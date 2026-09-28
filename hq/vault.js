// Reads the AI-Framework vault. Project records are read-only here; the only
// write is a new capture file in 00-inbox/ (see writeInboxNote).
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const VAULT = process.env.HQ_VAULT ?? 'C:\\Users\\dnbar\\OneDrive\\Dreamhouse\\AI-Framework'
const PROJECTS = join(VAULT, '10-projects')
const INBOX = join(VAULT, '00-inbox')

const STALE_DAYS = 21

// Minimal YAML frontmatter reader for the shapes _project.md actually uses:
// scalars, quoted scalars, folded continuation lines, [] / [a, b] and "- item" lists.
export function parseFrontmatter(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines[0].trim() !== '---') return { data: {}, body: text }
  const end = lines.indexOf('---', 1)
  if (end === -1) return { data: {}, body: text }

  const raw = {}
  let key = null
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (m) {
      key = m[1]
      raw[key] = { text: m[2].trim(), items: [] }
    } else if (key && /^\s*-\s+/.test(line)) {
      raw[key].items.push(line.replace(/^\s*-\s+/, '').trim())
    } else if (key && line.trim()) {
      raw[key].text += ' ' + line.trim()
    }
  }

  const data = {}
  for (const [k, { text: t, items }] of Object.entries(raw)) {
    data[k] = items.length ? items : scalar(t)
  }
  return { data, body: lines.slice(end + 1).join('\n') }
}

function scalar(t) {
  if (t.startsWith("'") && t.endsWith("'") && t.length > 1) return t.slice(1, -1).replace(/''/g, "'")
  if (t.startsWith('"') && t.endsWith('"') && t.length > 1) {
    try { return JSON.parse(t) } catch { return t.slice(1, -1) }
  }
  if (t === '[]') return []
  if (t.startsWith('[') && t.endsWith(']')) return t.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
  return t
}

// Bullets under "## Open questions", minus the "None currently." placeholder.
function openQuestions(body) {
  const m = body.match(/^## Open questions\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)
  if (!m) return []
  const items = []
  for (const line of m[1].split(/\r?\n/)) {
    if (/^-\s+/.test(line)) items.push(line.replace(/^-\s+/, '').trim())
    else if (items.length && /^\s+\S/.test(line)) items[items.length - 1] += ' ' + line.trim()
  }
  return items.filter(q => !/^none\b/i.test(q))
}

export function localDate(d = new Date()) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function daysBetween(from, to) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000)
}

export async function readProjects() {
  const today = localDate()
  const dirs = await readdir(PROJECTS, { withFileTypes: true })
  const projects = []
  for (const dir of dirs) {
    if (!dir.isDirectory() || dir.name.startsWith('_')) continue
    const file = join(PROJECTS, dir.name, '_project.md')
    if (!existsSync(file)) continue
    const { data, body } = parseFrontmatter(await readFile(file, 'utf8'))
    const str = v => (typeof v === 'string' ? v : '')
    const nextReview = str(data.next_review)
    const updated = str(data.updated)
    const blocked = data.blocked_by
    projects.push({
      id: str(data.id) || dir.name,
      title: str(data.title) || dir.name,
      tier: str(data.tier),
      category: str(data.category),
      stage: str(data.stage),
      nextAction: str(data.next_action),
      nextReview,
      updated,
      repo: str(data.repo),
      blockedBy: Array.isArray(blocked) ? blocked : blocked ? [blocked] : [],
      openQuestions: openQuestions(body),
      overdue: nextReview !== '' && nextReview < today,
      staleDays: updated && daysBetween(updated, today) > STALE_DAYS ? daysBetween(updated, today) : 0,
    })
  }
  // Overdue first (oldest review first), then by next review; no review date last.
  projects.sort((a, b) =>
    (b.overdue - a.overdue) ||
    ((a.nextReview || '9999') < (b.nextReview || '9999') ? -1 : (a.nextReview || '9999') > (b.nextReview || '9999') ? 1 : 0) ||
    a.title.localeCompare(b.title))
  return projects
}

export async function inboxCount() {
  if (!existsSync(INBOX)) return 0
  const files = await readdir(INBOX)
  return files.filter(f => /\.(md|txt)$/i.test(f)).length
}

// Follows the vault's capture format: 00-inbox/YYYY-MM-DD-HHmm-<slug>.md with
// captured/source frontmatter and the note verbatim. Never overwrites.
export async function writeInboxNote(text, projectId) {
  const now = new Date()
  const p = n => String(n).padStart(2, '0')
  const hhmm = `${p(now.getHours())}${p(now.getMinutes())}`
  const slug = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').trim().split(/\s+/).slice(0, 5).join('-').slice(0, 50) || 'note'
  const source = projectId ? `portfolio-hq quick view — ${projectId}` : 'portfolio-hq quick view'
  const content = `---\ncaptured: ${localDate(now)}T${p(now.getHours())}:${p(now.getMinutes())}\nsource: ${source}\n---\n\n${text.trim()}\n`

  for (const stamp of [hhmm, `${hhmm}${p(now.getSeconds())}`]) {
    const name = `${localDate(now)}-${stamp}-${slug}.md`
    try {
      await writeFile(join(INBOX, name), content, { flag: 'wx' })
      return name
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  }
  throw new Error('A note with this name already exists; try again in a second.')
}
