import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  canTransition,
  createDraftFromSource,
  evaluateTransition,
  JsonDraftRepository
} from '../dist/store/index.mjs'

// ---- 状态机 ----
{
  assert.equal(canTransition('to_qc', 'to_cover'), true, '可前进一步')
  assert.equal(canTransition('to_qc', 'to_review'), false, '不能跳两步')
  assert.equal(canTransition('ready', 'to_generate'), true, '可后退到任意更早')
  assert.equal(canTransition('to_qc', 'to_qc'), false, '同态不算转移')
  console.log('store: 状态机前进/后退/越级规则 ✓')
}

// ---- ready 闸门 ----
{
  const base = createDraftFromSource({ id: 'a', draftBody: '正文', title: 't' })
  base.status = 'to_review'

  // 未质检 → 拒绝
  let verdict = evaluateTransition(base, 'ready')
  assert.equal(verdict.ok, false, '未质检不能进 ready')

  // 质检过但有数字存疑 → 拒绝
  base.quality = { score: 90, passed: true, errors: 0, warns: 1 }
  base.factCheck = { ok: false, checked: 2, flagged: [{ value: '95%', kind: 'percent' }] }
  verdict = evaluateTransition(base, 'ready')
  assert.equal(verdict.ok, false, '有数字未核验不能进 ready')
  assert.ok(/未在来源/.test(verdict.reason || ''), '理由提示数字未核验')

  // 质检过且数字 ok → 放行
  base.factCheck = { ok: true, checked: 2, flagged: [] }
  verdict = evaluateTransition(base, 'ready')
  assert.equal(verdict.ok, true, '质检过+数字过 → 放行')
  console.log('store: ready 闸门（质检/数字双卡）✓')
}

// ---- JSON repo CRUD + 持久化往返 ----
{
  const dir = await mkdtemp(path.join(tmpdir(), 'sa-store-'))
  const file = path.join(dir, 'store.json')
  const repo = new JsonDraftRepository(file)

  const created = await repo.seedFromSources([
    { id: 'x1', title: '港校政策', region: 'HK', draftBody: '正文', draftTitle: '标题' },
    { id: 'x2', title: '英国签证', region: 'UK' }
  ])
  assert.equal(created, 2, '建档 2 条')

  const x1 = await repo.get('x1')
  assert.equal(x1.status, 'to_qc', '有正文→待质检')
  const x2 = await repo.get('x2')
  assert.equal(x2.status, 'to_generate', '无正文→待生成')

  await repo.patch('x1', { draftBody: '改过的正文', verification: { cover: true } })
  const x1b = await repo.get('x1')
  assert.equal(x1b.draftBody, '改过的正文', 'patch 内容')
  assert.equal(x1b.verification.cover, true, 'patch 嵌套子合并')
  assert.equal(x1b.verification.source, false, '其余子字段保留')

  // transition 必须走闸门：to_qc→to_cover ok；越级被拒
  const t1 = await repo.transition('x1', 'to_cover')
  assert.equal(t1.ok, true, 'to_qc→to_cover 合法')
  const t2 = await repo.transition('x1', 'ready')
  assert.equal(t2.ok, false, 'to_cover→ready 越级被拒')

  // 持久化往返：新实例读同一文件
  const repo2 = new JsonDraftRepository(file)
  const reloaded = await repo2.get('x1')
  assert.equal(reloaded.draftBody, '改过的正文', '重开实例数据仍在（真持久化）')
  assert.equal(reloaded.status, 'to_cover', '状态持久化')

  // seed 幂等：已存在不覆盖编辑
  await repo2.seedFromSources([{ id: 'x1', title: '港校政策', draftBody: '不该覆盖' }])
  const x1c = await repo2.get('x1')
  assert.equal(x1c.draftBody, '改过的正文', 'seed 不覆盖已有编辑')

  await rm(dir, { recursive: true, force: true })
  console.log('store: JSON repo CRUD + 持久化往返 + seed 幂等 ✓')
}

console.log('store tests passed')
