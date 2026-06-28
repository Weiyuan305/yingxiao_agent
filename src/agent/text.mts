export function cleanText(value = ''): string {
  return String(value).replace(/\s+/g, ' ').trim()
}

export function cleanTextBlock(value = ''): string {
  return String(value).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim()
}

export function truncate(value = '', length = 240): string {
  const text = cleanText(value)
  return text.length > length ? text.slice(0, length) : text
}

export function formatTime(value = ''): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function formatDate(value = ''): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未知'
  return date.toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function toTag(value = ''): string {
  return cleanText(value)
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
    .slice(0, 12)
}

export function normalize(value = ''): string {
  return String(value || '').toLowerCase()
}

export function uniqueStrings(values: string[], limit: number): string[] {
  return [...new Set(values.map(value => cleanText(value)).filter(Boolean))].slice(0, limit)
}
