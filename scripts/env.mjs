import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export async function loadLocalEnv(file = path.join(rootDir, '.env')) {
  let text = ''
  try {
    text = await readFile(file, 'utf8')
  } catch {
    return { loaded: false, file }
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) continue

    const key = trimmed.slice(0, equalsIndex).trim()
    const value = unquote(trimmed.slice(equalsIndex + 1).trim())
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }

  return { loaded: true, file }
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}
