// 今日待处理队列视图
// 从 app.js 拆出的独立模块（classic script，共享全局作用域；在 app.js 之前加载）。
// 运行时依赖 draftServer / escapeHtml / showToast / render 均为全局，仅在被调用时使用。
const QUEUE_STATUS_ORDER = ['collected', 'triage', 'to_generate', 'to_qc', 'to_cover', 'to_review', 'ready', 'published', 'retro']
const QUEUE_STATUS_LABELS = {
  collected: '已采集', triage: '待选题', to_generate: '待生成', to_qc: '待质检',
  to_cover: '待封面', to_review: '待审核', ready: '可发布', published: '已发布', retro: '复盘待录入'
}

function statusLabel(status) {
  return (draftServer.labels && draftServer.labels[status]) || QUEUE_STATUS_LABELS[status] || status
}

function renderQueue() {
  const board = document.querySelector('#queueBoard')
  const totalBadge = document.querySelector('#queueTotalBadge')
  if (!board) return

  const drafts = Object.values(draftServer.drafts || {})
  if (totalBadge) totalBadge.textContent = `${drafts.length} 条`

  if (!draftServer.available) {
    board.innerHTML = '<p class="queue-empty">队列需要运行 <code>npm run serve</code> 启动本地服务后才能使用（草稿状态会持久化到 data/store.json）。</p>'
    return
  }
  if (!drafts.length) {
    board.innerHTML = '<p class="queue-empty">还没有草稿。先到「情报中心」刷新或生成内容。</p>'
    return
  }

  const order = draftServer.statuses && draftServer.statuses.length ? draftServer.statuses : QUEUE_STATUS_ORDER
  const grouped = order.map(status => ({ status, items: drafts.filter(d => d.status === status) }))
    .filter(group => group.items.length)

  board.innerHTML = grouped.map(group => {
    const cards = group.items.map(draft => queueCardHtml(draft, order)).join('')
    return `<div class="queue-col">
      <div class="queue-col-head"><strong>${escapeHtml(statusLabel(group.status))}</strong><span>${group.items.length}</span></div>
      <div class="queue-cards">${cards}</div>
    </div>`
  }).join('')
}

function queueCardHtml(draft, order) {
  const idx = order.indexOf(draft.status)
  const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
  const prev = idx > 0 ? order[idx - 1] : null
  const title = escapeHtml(draft.draftTitle || draft.sourceTitle || '未命名草稿')
  const region = escapeHtml(draft.regionLabel || draft.region || '')

  const badges = []
  if (draft.quality) {
    badges.push(draft.quality.passed
      ? `<span class="badge badge-ready">质检 ${draft.quality.score}</span>`
      : '<span class="badge badge-review">质检未过</span>')
  }
  if (draft.factCheck && !draft.factCheck.ok) {
    badges.push(`<span class="badge badge-review">数字 ${draft.factCheck.flagged.length} 存疑</span>`)
  }
  const assignee = draft.assignee ? `<span class="queue-assignee">@${escapeHtml(draft.assignee)}</span>` : ''

  const actions = [
    prev ? `<button class="btn-ghost compact" type="button" data-queue-back="${escapeHtml(draft.id)}">◀ 退回</button>` : '',
    next ? `<button class="btn-secondary compact" type="button" data-queue-advance="${escapeHtml(draft.id)}" data-queue-to="${next}">${escapeHtml(statusLabel(next))} ▶</button>` : ''
  ].join('')

  return `<div class="queue-card" data-queue-open="${escapeHtml(draft.id)}">
    <div class="queue-card-title">${title}</div>
    <div class="queue-card-meta">${region}${assignee}</div>
    <div class="queue-card-badges">${badges.join('')}</div>
    <div class="queue-card-actions">${actions}</div>
  </div>`
}

async function queueTransition(id, to) {
  const result = await draftServer.transition(id, to)
  if (result.ok) {
    showToast(`已流转到「${statusLabel(to)}」`)
    render()
  } else {
    showToast(`不能流转：${result.reason || '状态校验未通过'}`)
  }
}
