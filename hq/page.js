// Renders the quick view as one self-contained HTML page.

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
// Vault text is markdown; show link text only.
const plain = s => esc(String(s).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1'))
const short = d => (d ? d.slice(5) : '')
const days = n => `${n} day${n === 1 ? '' : 's'}`
const TIER_LABEL = { 'non-discretionary': 'Non-discretionary', discretionary: 'Discretionary', choose: 'Choose' }
const tierLabel = t => TIER_LABEL[t] ?? (t ? t[0].toUpperCase() + t.slice(1) : 'No tier')

function card(p) {
  const flags = []
  if (p.overdue) flags.push(`<span class="flag overdue">Review ${days(p.overdueDays)} overdue</span>`)
  if (p.missingNextAction) flags.push('<span class="flag gap">No next action</span>')
  if (p.missingReview) flags.push('<span class="flag gap">No review date</span>')
  if (p.staleDays) flags.push(`<span class="flag gap">Not updated in ${days(p.staleDays)}</span>`)

  const meta = [
    p.category,
    p.value && `value ${p.value}`,
    p.effort && `effort ${p.effort}`,
    p.nextReview && `review ${short(p.nextReview)}`,
    p.updated && `updated ${short(p.updated)}`,
  ].filter(Boolean).map(esc)
  if (p.repo) meta.push(`<a href="${esc(p.repo)}" target="_blank" rel="noopener">repo</a>`)

  const classes = ['card', p.overdue && 'is-overdue', p.inactive && 'is-inactive'].filter(Boolean).join(' ')
  return `
  <article class="${classes}" data-project="${esc(p.id)}">
    <header>
      <h3>${esc(p.title)}</h3>
      ${p.stage ? `<span class="stage stage-${esc(p.stage)}">${esc(p.stage)}</span>` : ''}
    </header>
    <p class="meta">${meta.join(' · ')}</p>
    ${flags.length ? `<div class="flags">${flags.join('')}</div>` : ''}
    ${p.nextAction ? `<section><h4>Next action</h4><div class="clamp"><p>${plain(p.nextAction)}</p></div><button type="button" class="link more" hidden>Show more</button></section>` : ''}
    ${p.blockedBy.length ? `<section><h4>Blocked by</h4><ul>${p.blockedBy.map(b => `<li>${plain(b)}</li>`).join('')}</ul></section>` : ''}
    ${p.openQuestions.length ? `<section><h4>Open questions</h4><div class="clamp"><ul>${p.openQuestions.map(q => `<li>${plain(q)}</li>`).join('')}</ul></div><button type="button" class="link more" hidden>Show more</button></section>` : ''}
    <footer><button type="button" class="link add-for" data-project="${esc(p.id)}">+ Add item</button></footer>
  </article>`
}

function tierSection({ tier, projects }) {
  return `
  <section class="tier">
    <h2>${esc(tierLabel(tier))} <span class="count">${projects.length}</span></h2>
    <div class="grid">${projects.map(card).join('')}</div>
  </section>`
}

export function renderPage({ groups, inbox, today }) {
  const projects = groups.flatMap(g => g.projects)
  const overdue = projects.filter(p => p.overdue).length
  const gaps = projects.filter(p => p.missingNextAction || p.missingReview || p.staleDays).length
  const options = projects.map(p => `<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Portfolio HQ</title>
<style>
/* Color roles: red = overdue review, amber = record-hygiene gap, green = active,
   blue = in review/ratified, grey = everything else. Each color means one thing. */
:root {
  --bg: #f6f5f2; --panel: #ffffff; --ink: #1d1d1b; --muted: #62615c; --line: #e3e1db;
  --accent: #2f5d50; --accent-ink: #ffffff;
  --blue: #2f5383;
  --warn: #a3401f; --warn-bg: #fbeee8;
  --gap: #7a5a12; --gap-bg: #f7f0dc;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #161615; --panel: #1f1f1d; --ink: #ecebe6; --muted: #a09e97; --line: #34332f;
    --accent: #7fb8a6; --accent-ink: #10201b;
    --blue: #9db8e0;
    --warn: #f0906d; --warn-bg: #3a2119;
    --gap: #e2c071; --gap-bg: #33291a;
  }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width: 1180px; margin: 0 auto; padding: 24px 20px 60px; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }

.top { display: flex; flex-wrap: wrap; gap: 10px 20px; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 14px; }
h1 { font-size: 22px; margin: 0; letter-spacing: -0.01em; }
.summary { color: var(--muted); margin: 0; flex: 1; min-width: 220px; }
.summary .n-overdue { color: var(--warn); font-weight: 600; }
.summary .n-gap { color: var(--gap); font-weight: 600; }
.summary b { color: var(--ink); }

button { font: inherit; cursor: pointer; }
.primary { font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--accent); background: var(--accent); color: var(--accent-ink); }
.primary:disabled { opacity: 0.5; cursor: default; }
.secondary { font-size: 14px; padding: 8px 14px; border-radius: 8px; border: 1px solid var(--line); background: transparent; color: var(--ink); }
.link { background: none; border: 0; padding: 2px 0; color: var(--accent); font-size: 13px; }

.composer { margin: 16px 0 0; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
.composer[hidden] { display: none; }
.composer .fields { display: grid; gap: 8px; }
.composer label { font-size: 12px; color: var(--muted); font-weight: 600; }
.composer select, .composer textarea { width: 100%; font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; }
.composer select { max-width: 320px; }
.composer textarea { resize: vertical; min-height: 84px; }
.composer .row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 10px; }
.hint { font-size: 12px; color: var(--muted); }
.status { font-size: 13px; color: var(--muted); }
.status.ok { color: var(--accent); }
.status.error { color: var(--warn); }

.tier { margin-top: 28px; }
.tier h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 0 0 10px; font-weight: 600; }
.tier h2 .count { font-weight: 400; margin-left: 4px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; align-items: start; }

.card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px 12px; }
.card.is-overdue { border-left: 3px solid var(--warn); }
.card.is-inactive { opacity: 0.65; }
.card header { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.card h3 { font-size: 17px; margin: 0; }
.card h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin: 14px 0 4px; font-weight: 600; }
.meta { color: var(--muted); font-size: 13px; margin: 2px 0 0; }
.meta a { color: var(--accent); }
.card section p, .card section ul { margin: 0; }
.card section ul { padding-left: 18px; }
.card footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--line); }

.stage { font-size: 12px; border: 1px solid var(--line); border-radius: 999px; padding: 1px 9px; color: var(--muted); white-space: nowrap; }
.stage-active { color: var(--accent); border-color: currentColor; }
.stage-review, .stage-ratified { color: var(--blue); border-color: currentColor; }
.stage-parked, .stage-closed { border-style: dashed; }

.flags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.flag { font-size: 12px; border-radius: 4px; padding: 2px 8px; font-weight: 500; }
.flag.overdue { color: var(--warn); background: var(--warn-bg); }
.flag.gap { color: var(--gap); background: var(--gap-bg); }

.clamp { max-height: 6em; overflow: hidden; position: relative; }
.clamp::after { content: ""; position: absolute; inset: auto 0 0 0; height: 1.5em; background: linear-gradient(transparent, var(--panel)); }
.clamp.fits::after, .clamp.open::after { display: none; }
.clamp.open { max-height: none; }

@media (max-width: 480px) {
  main { padding: 18px 16px 48px; }
  .grid { grid-template-columns: 1fr; }
  .top .primary { width: 100%; }
}
</style>
</head>
<body>
<main>
  <div class="top">
    <h1>Portfolio HQ</h1>
    <p class="summary">
      ${projects.length} projects${overdue ? ` · <span class="n-overdue">${overdue} overdue</span>` : ''}${gaps ? ` · <span class="n-gap">${gaps} need a record update</span>` : ''}
      · <b id="inbox-count">${inbox}</b> in inbox · ${esc(today)}
    </p>
    <button type="button" class="primary" id="add-item" aria-expanded="false" aria-controls="composer">+ Add item</button>
  </div>

  <form class="composer" id="composer" hidden>
    <div class="fields">
      <label for="c-project">Project</label>
      <select id="c-project" name="project"><option value="">General (no project)</option>${options}</select>
      <label for="c-text">Item</label>
      <textarea id="c-text" name="text" placeholder="What should the next vault session pick up?" required></textarea>
    </div>
    <div class="row">
      <button type="submit" class="primary">Save to vault inbox</button>
      <button type="button" class="secondary" id="c-cancel">Cancel</button>
      <span class="status" role="status" aria-live="polite"></span>
      <span class="hint">Ctrl+Enter saves · Esc closes · triaged in the next vault session</span>
    </div>
  </form>

  ${groups.map(tierSection).join('')}
</main>
<script>
for (const box of document.querySelectorAll('.clamp')) {
  const btn = box.nextElementSibling
  if (box.scrollHeight <= box.clientHeight + 6) { box.classList.add('fits'); continue }
  btn.hidden = false
  btn.addEventListener('click', () => {
    const open = box.classList.toggle('open')
    btn.textContent = open ? 'Show less' : 'Show more'
  })
}

const composer = document.getElementById('composer')
const addBtn = document.getElementById('add-item')
const select = composer.project
const text = composer.text
const status = composer.querySelector('.status')

function openComposer(projectId = '') {
  composer.hidden = false
  addBtn.setAttribute('aria-expanded', 'true')
  select.value = projectId
  status.textContent = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
  text.focus({ preventScroll: true })
}
function closeComposer() {
  composer.hidden = true
  addBtn.setAttribute('aria-expanded', 'false')
  addBtn.focus()
}

addBtn.addEventListener('click', () => (composer.hidden ? openComposer() : closeComposer()))
document.getElementById('c-cancel').addEventListener('click', closeComposer)
for (const b of document.querySelectorAll('.add-for')) b.addEventListener('click', () => openComposer(b.dataset.project))

composer.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeComposer()
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) composer.requestSubmit()
})

composer.addEventListener('submit', async e => {
  e.preventDefault()
  const body = text.value.trim()
  if (!body) return
  const btn = composer.querySelector('[type=submit]')
  btn.disabled = true
  status.className = 'status'
  status.textContent = 'Saving…'
  try {
    const res = await fetch('/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body, project: select.value }),
    })
    const out = await res.json()
    if (!res.ok) throw new Error(out.error || 'Save failed')
    text.value = ''
    status.className = 'status ok'
    const target = select.value ? select.options[select.selectedIndex].text : 'general'
    status.textContent = 'Saved to inbox (' + target + ')'
    document.getElementById('inbox-count').textContent = out.inbox
    text.focus()
  } catch (err) {
    status.className = 'status error'
    status.textContent = err.message
  } finally {
    btn.disabled = false
  }
})
</script>
</body>
</html>`
}
