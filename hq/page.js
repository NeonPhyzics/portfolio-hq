// Renders the quick view as one self-contained HTML page.

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
// Vault text is markdown; show link text only.
const plain = s => esc(String(s).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1'))
const short = d => (d ? d.slice(5) : '')

function card(p) {
  const flags = []
  if (p.overdue) flags.push(`<span class="flag overdue">Review overdue · ${short(p.nextReview)}</span>`)
  if (p.staleDays) flags.push(`<span class="flag stale">Not updated in ${p.staleDays} days</span>`)
  const meta = [p.tier, p.category].filter(Boolean).map(esc).join(' · ')

  return `
  <article class="card${p.overdue ? ' is-overdue' : ''}" data-project="${esc(p.id)}">
    <header>
      <h2>${esc(p.title)}</h2>
      ${p.stage ? `<span class="stage stage-${esc(p.stage)}">${esc(p.stage)}</span>` : ''}
    </header>
    <p class="meta">${meta}${p.nextReview ? ` · review ${short(p.nextReview)}` : ''}${p.updated ? ` · updated ${short(p.updated)}` : ''}${p.repo ? ` · <a href="${esc(p.repo)}" target="_blank" rel="noopener">repo</a>` : ''}</p>
    ${flags.length ? `<div class="flags">${flags.join('')}</div>` : ''}
    <section>
      <h3>Next action</h3>
      ${p.nextAction ? `<p class="next clamp">${plain(p.nextAction)}</p><button class="more" hidden>Show more</button>` : '<p class="empty">None set</p>'}
    </section>
    ${p.blockedBy.length ? `<section><h3>Blocked by</h3><ul>${p.blockedBy.map(b => `<li>${plain(b)}</li>`).join('')}</ul></section>` : ''}
    ${p.openQuestions.length ? `<section><h3>Open questions</h3><ul>${p.openQuestions.map(q => `<li>${plain(q)}</li>`).join('')}</ul></section>` : ''}
    <details class="note">
      <summary>Add note</summary>
      <form data-project="${esc(p.id)}">
        <textarea name="text" rows="3" placeholder="Note for the ${esc(p.title)} inbox triage…" required></textarea>
        <div class="row"><button type="submit">Save to inbox</button><span class="status" role="status"></span></div>
      </form>
    </details>
  </article>`
}

export function renderPage({ projects, inbox, today }) {
  const overdue = projects.filter(p => p.overdue).length
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Portfolio HQ</title>
<style>
:root {
  --bg: #f6f5f2; --panel: #ffffff; --ink: #1d1d1b; --muted: #6b6a65; --line: #e3e1db;
  --accent: #2f5d50; --warn: #a3401f; --warn-bg: #fbeee8; --stale: #7a5a12; --stale-bg: #f7f0dc;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #161615; --panel: #1f1f1d; --ink: #ecebe6; --muted: #9a9892; --line: #33322f;
    --accent: #7fb8a6; --warn: #f0906d; --warn-bg: #3a2119; --stale: #e2c071; --stale-bg: #33291a;
  }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width: 1180px; margin: 0 auto; padding: 28px 20px 60px; }
.top { display: flex; flex-wrap: wrap; gap: 8px 24px; align-items: baseline; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 14px; }
h1 { font-size: 22px; margin: 0; letter-spacing: -0.01em; }
.summary { color: var(--muted); margin: 0; }
.summary strong { color: var(--warn); font-weight: 600; }
.inbox { color: var(--muted); }
.inbox b { color: var(--ink); }
.general { margin: 18px 0 26px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px 12px; display: flex; flex-direction: column; }
.card.is-overdue { border-left: 3px solid var(--warn); }
.card header { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
h2 { font-size: 17px; margin: 0; }
h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin: 14px 0 4px; font-weight: 600; }
.meta { color: var(--muted); font-size: 13px; margin: 2px 0 0; }
.meta a { color: var(--accent); }
.stage { font-size: 12px; border: 1px solid var(--line); border-radius: 999px; padding: 1px 9px; color: var(--muted); white-space: nowrap; }
.stage-active { color: var(--accent); border-color: currentColor; }
.flags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.flag { font-size: 12px; border-radius: 4px; padding: 2px 8px; font-weight: 500; }
.flag.overdue { color: var(--warn); background: var(--warn-bg); }
.flag.stale { color: var(--stale); background: var(--stale-bg); }
section p, section ul { margin: 0; }
section ul { padding-left: 18px; }
.clamp { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.empty { color: var(--muted); font-style: italic; }
button.more { background: none; border: 0; padding: 2px 0; color: var(--accent); cursor: pointer; font: inherit; font-size: 13px; }
details.note { margin-top: auto; padding-top: 12px; }
details.note summary { cursor: pointer; color: var(--accent); font-size: 13px; }
textarea { width: 100%; margin-top: 8px; padding: 8px 10px; font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 6px; resize: vertical; }
textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
.row { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
button[type=submit] { font: inherit; font-size: 13px; padding: 5px 12px; border-radius: 6px; border: 1px solid var(--accent); background: var(--accent); color: var(--panel); cursor: pointer; }
button[type=submit]:disabled { opacity: 0.5; cursor: default; }
.status { font-size: 13px; color: var(--muted); }
.status.error { color: var(--warn); }
</style>
</head>
<body>
<main>
  <div class="top">
    <h1>Portfolio HQ</h1>
    <p class="summary">${projects.length} projects${overdue ? ` · <strong>${overdue} review${overdue === 1 ? '' : 's'} overdue</strong>` : ''} · ${esc(today)}</p>
    <p class="inbox summary"><b id="inbox-count">${inbox}</b> note${inbox === 1 ? '' : 's'} waiting in the vault inbox</p>
  </div>

  <details class="note general">
    <summary>Add a general note</summary>
    <form data-project="">
      <textarea name="text" rows="3" placeholder="Anything for the next vault session…" required></textarea>
      <div class="row"><button type="submit">Save to inbox</button><span class="status" role="status"></span></div>
    </form>
  </details>

  <div class="grid">
    ${projects.map(card).join('')}
  </div>
</main>
<script>
for (const p of document.querySelectorAll('.next.clamp')) {
  const btn = p.nextElementSibling
  if (p.scrollHeight > p.clientHeight + 6) {
    btn.hidden = false
    btn.addEventListener('click', () => {
      const open = p.classList.toggle('clamp')
      btn.textContent = open ? 'Show more' : 'Show less'
    })
  }
}

for (const form of document.querySelectorAll('form[data-project]')) {
  form.addEventListener('submit', async e => {
    e.preventDefault()
    const btn = form.querySelector('button')
    const status = form.querySelector('.status')
    const text = form.text.value.trim()
    if (!text) return
    btn.disabled = true
    status.className = 'status'
    status.textContent = 'Saving…'
    try {
      const res = await fetch('/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, project: form.dataset.project }),
      })
      const out = await res.json()
      if (!res.ok) throw new Error(out.error || 'Save failed')
      form.text.value = ''
      status.textContent = 'Saved to inbox'
      const count = document.getElementById('inbox-count')
      count.textContent = out.inbox
      count.parentElement.lastChild.textContent = (out.inbox === 1 ? ' note' : ' notes') + ' waiting in the vault inbox'
    } catch (err) {
      status.className = 'status error'
      status.textContent = err.message
    } finally {
      btn.disabled = false
    }
  })
}
</script>
</body>
</html>`
}
