// 信息图封面一键导出 PNG（小红书 3:4，1080×1440）
// 从 app.js 拆出的独立模块（classic script，共享全局作用域；在 app.js 之前加载）。
// 运行时依赖的 ensureCompliant / getSelectedItem / state / coverStyleLabels / showToast 均为全局，
// 仅在 exportCoverPng 被调用时（运行期）使用，此时它们已在 app.js 中定义。
const coverRegionPalettes = {
  HK: { bg: ['#0f172a', '#7f1d1d'], accent: '#f59e0b', label: '香港' },
  UK: { bg: ['#0b1437', '#1e3a8a'], accent: '#38bdf8', label: '英国' },
  SG: { bg: ['#0f172a', '#0f766e'], accent: '#fca5a5', label: '新加坡' }
}
const coverStylePalettes = {
  chart: { bg: ['#0b132b', '#1c3d5a'], accent: '#22d3ee' },
  contrast: { bg: ['#1a0306', '#7f1d1d'], accent: '#fde047' },
  ai: { bg: ['#1e1b4b', '#4c1d95'], accent: '#f0abfc' }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapByWidth(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const ch of String(text || '')) {
    if (ch === '\n') { lines.push(line); line = ''; continue }
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function exportCoverPng() {
  if (!ensureCompliant()) return
  const item = getSelectedItem()
  if (!item) return
  const W = 1080
  const H = 1440
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const region = coverRegionPalettes[item.region] || coverRegionPalettes.UK
  const stylePal = coverStylePalettes[state.coverStyle]
  const bg = (stylePal && stylePal.bg) || region.bg
  const accent = (stylePal && stylePal.accent) || region.accent
  const fontStack = '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif'

  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, bg[0])
  grad.addColorStop(1, bg[1])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.globalAlpha = 0.16
  ctx.fillStyle = accent
  ctx.beginPath(); ctx.arc(W * 0.86, H * 0.12, 230, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(W * 0.08, H * 0.94, 280, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1

  // 顶部地区/风格胶囊
  const chipText = `${region.label || item.regionLabel || ''} · ${coverStyleLabels[state.coverStyle] || ''}`
  ctx.font = `600 36px ${fontStack}`
  ctx.textBaseline = 'middle'
  const chipW = ctx.measureText(chipText).width + 64
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  roundRect(ctx, 80, 108, chipW, 76, 38)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.fillText(chipText, 112, 148)

  // 强调短条
  ctx.fillStyle = accent
  roundRect(ctx, 80, 372, 132, 18, 9)
  ctx.fill()

  // 封面大字
  const coverText = (item.coverText || item.draftTitle || '留学干货').slice(0, 24)
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'top'
  const bigFont = coverText.length > 8 ? 92 : 108
  ctx.font = `800 ${bigFont}px ${fontStack}`
  const bigLines = wrapByWidth(ctx, coverText, W - 160).slice(0, 4)
  let cy = 432
  const bigLh = bigFont + 22
  for (const line of bigLines) {
    ctx.fillText(line, 80, cy)
    cy += bigLh
  }

  // 副标题（完整标题）
  ctx.fillStyle = 'rgba(255,255,255,0.86)'
  ctx.font = `500 42px ${fontStack}`
  const subLines = wrapByWidth(ctx, item.draftTitle || '', W - 160).slice(0, 3)
  let sy = Math.max(cy + 40, H - 380)
  for (const line of subLines) {
    ctx.fillText(line, 80, sy)
    sy += 58
  }

  // 底部水印
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.font = `400 30px ${fontStack}`
  ctx.fillText(`来源：${String(item.source || '').slice(0, 26)}`, 80, H - 152)
  ctx.fillStyle = accent
  ctx.font = `700 32px ${fontStack}`
  ctx.fillText('留学情报 · 内容仅供参考，以官方为准', 80, H - 104)

  canvas.toBlob(blob => {
    if (!blob) { showToast('封面导出失败'); return }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${String(item.region || 'xhs').toLowerCase()}-cover-${item.id}.png`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    showToast('封面 PNG 已导出')
  }, 'image/png')
}
