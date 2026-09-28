// Local-only quick view of the vault's projects. `npm run hq` starts it and
// opens the browser; close the terminal to stop it.
import { createServer } from 'node:http'
import { exec } from 'node:child_process'
import { readProjects, groupByTier, inboxCount, writeInboxNote, localDate, VAULT } from './vault.js'
import { renderPage } from './page.js'

const HOST = '127.0.0.1'
const PORT = Number(process.env.HQ_PORT ?? 5180)
const MAX_NOTE = 20_000

const send = (res, status, type, body) => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' })
  res.end(body)
}
const json = (res, status, obj) => send(res, status, 'application/json', JSON.stringify(obj))

// Only this page may write notes: reject requests from other sites in the browser.
function sameOrigin(req) {
  const hosts = [`${HOST}:${PORT}`, `localhost:${PORT}`]
  if (!hosts.includes(req.headers.host)) return false
  const origin = req.headers.origin
  return !origin || hosts.some(h => origin === `http://${h}`)
}

async function readBody(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > MAX_NOTE * 2) throw new Error('Note too long')
  }
  return JSON.parse(body)
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      const [projects, inbox] = await Promise.all([readProjects(), inboxCount()])
      return send(res, 200, 'text/html; charset=utf-8', renderPage({ groups: groupByTier(projects), inbox, today: localDate() }))
    }
    if (req.method === 'POST' && req.url === '/note') {
      if (!sameOrigin(req)) return json(res, 403, { error: 'Forbidden' })
      const { text, project } = await readBody(req)
      if (typeof text !== 'string' || !text.trim()) return json(res, 400, { error: 'Note is empty' })
      if (text.length > MAX_NOTE) return json(res, 400, { error: 'Note too long' })
      const id = typeof project === 'string' && /^[a-z0-9-]+$/.test(project) ? project : ''
      const file = await writeInboxNote(text, id)
      return json(res, 200, { file, inbox: await inboxCount() })
    }
    send(res, 404, 'text/plain', 'Not found')
  } catch (err) {
    console.error(err)
    json(res, 500, { error: err.message })
  }
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') console.error(`Port ${PORT} is in use. Is the quick view already running? Open http://${HOST}:${PORT}`)
  else console.error(err)
  process.exit(1)
})

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`
  console.log(`Portfolio HQ quick view: ${url}\nVault: ${VAULT}\nClose this terminal (or Ctrl+C) to stop.`)
  if (!process.argv.includes('--no-open')) exec(process.platform === 'win32' ? `start "" ${url}` : `open ${url}`)
})
