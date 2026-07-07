import { useState } from 'react'
import data from './data.json'
import './App.css'

const TABS = ['Ventures', 'Active Projects', 'Skills']

const STATUS_CLASS = {
  Active: 'status-active',
  Building: 'status-building',
  'In progress': 'status-active',
  Deferred: 'status-deferred',
}

function StatusBadge({ status }) {
  const cls = STATUS_CLASS[status] || 'status-deferred'
  return <span className={`badge ${cls}`}>{status}</span>
}

function VenturesView() {
  return (
    <div className="grid">
      {data.ventures.map((v) => (
        <div className="card venture-card" key={v.id}>
          <div className="card-top">
            <h3>{v.name}</h3>
            <StatusBadge status={v.status} />
          </div>
          <p className="summary">{v.summary}</p>
          <div className="field">
            <div className="label">Focus</div>
            <div className="value">{v.focus}</div>
          </div>
          <div className="field next">
            <div className="label">Next</div>
            <div className="value">{v.next}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ventureName(id) {
  if (!id) return null
  const v = data.ventures.find((v) => v.id === id)
  return v ? v.name : id
}

function ActiveProjectsView() {
  return (
    <div className="list">
      {data.activeProjects.map((p) => (
        <div className="row-card" key={p.id}>
          <div className="row-top">
            <h3>{p.name}</h3>
            <StatusBadge status={p.status} />
          </div>
          <div className="tags">
            {p.venture ? (
              <span className="tag venture-tag">{ventureName(p.venture)}</span>
            ) : (
              <span className="tag venture-tag cross">Cross-venture</span>
            )}
          </div>
          {p.blocker && (
            <div className="field">
              <div className="label">Blocker</div>
              <div className="value blocker">{p.blocker}</div>
            </div>
          )}
          <div className="field next">
            <div className="label">Next</div>
            <div className="value">{p.next}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LearningThreadCard({ thread, onComplete, onClose, closed }) {
  return (
    <div className={`row-card lt-card ${closed ? 'lt-closed' : ''}`}>
      <div className="lt-header">
        <div>
          <h3>{thread.title}</h3>
          <span className="tag lt-project-tag">{thread.linked_project}</span>
        </div>
        <div className="lt-meta">
          <span className={`badge ${thread.status === 'open' ? 'status-active' : 'status-deferred'}`}>
            {thread.status}
          </span>
          <span className="lt-since">since {thread.since}</span>
        </div>
      </div>

      {thread.build && <p className="lt-build">{thread.build}</p>}

      {!closed && <div className="lt-next-action">{thread.next_action}</div>}

      <div className="lt-donewhen">
        <span className="lt-donewhen-label">Done when</span>
        {thread.done_when}
      </div>

      {thread.backlog.length > 0 && (
        <details className="lt-backlog">
          <summary>Backlog ({thread.backlog.length})</summary>
          <ul>
            {thread.backlog.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </details>
      )}

      {thread.note && (
        <div className="field next">
          <div className="label">Note</div>
          <div className="value">{thread.note}</div>
        </div>
      )}

      {!closed && (
        <div className="lt-actions">
          {thread.backlog.length > 0 && (
            <button className="lt-btn lt-btn-complete" onClick={onComplete}>
              Complete → promote next backlog item
            </button>
          )}
          <button className="lt-btn lt-btn-close" onClick={onClose}>
            Close thread
          </button>
        </div>
      )}
    </div>
  )
}

function LearningThreadsSection() {
  const [threads, setThreads] = useState(() => data.skills.learningThreads.map((t) => ({ ...t })))

  function completeNextAction(id) {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.backlog.length === 0) return t
        const [promoted, ...rest] = t.backlog
        return { ...t, next_action: promoted, backlog: rest }
      })
    )
  }

  function closeThread(id) {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'closed' } : t)))
  }

  const open = threads.filter((t) => t.status === 'open')
  const closed = threads.filter((t) => t.status === 'closed')

  return (
    <section className="skills-section">
      <h2>Learning Threads</h2>
      <div className="list">
        {open.map((t) => (
          <LearningThreadCard
            key={t.id}
            thread={t}
            onComplete={() => completeNextAction(t.id)}
            onClose={() => closeThread(t.id)}
          />
        ))}
      </div>

      {closed.length > 0 && (
        <details className="lt-closed-group">
          <summary>Closed ({closed.length})</summary>
          <div className="list">
            {closed.map((t) => (
              <LearningThreadCard key={t.id} thread={t} closed />
            ))}
          </div>
        </details>
      )}
    </section>
  )
}

function SkillsView() {
  return (
    <>
      <section className="skills-section">
        <h2>Today's 1% Better</h2>
        {data.skills.nudges.map((n, i) => (
          <div className="nudge" key={i}>
            <span className="tag nudge-tag">{n.tag}</span>
            <p>{n.text}</p>
          </div>
        ))}
      </section>

      <LearningThreadsSection />

      <section className="skills-section">
        <h2>Proposed Actions</h2>
        <p className="proposals-note">Proposals only — nothing here has been run automatically.</p>
        <div className="list">
          {data.proposedActions.map((a) => (
            <div className="row-card" key={a.id}>
              <div className="row-top">
                <h3>{a.summary}</h3>
                {a.flag && <span className="badge status-deferred">{a.flag}</span>}
              </div>
              <div className="field next">
                <div className="label">Why</div>
                <div className="value">{a.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function App() {
  const [tab, setTab] = useState('Ventures')

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h1>{data.meta.title}</h1>
          <p className="tagline">{data.meta.tagline}</p>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="updated">Last updated {data.meta.lastUpdated}</div>
      </aside>

      <main className="content">
        <div className="mobile-brand">
          <h1>{data.meta.title}</h1>
        </div>
        <nav className="tabs mobile-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        {tab === 'Ventures' && <VenturesView />}
        {tab === 'Active Projects' && <ActiveProjectsView />}
        {tab === 'Skills' && <SkillsView />}
      </main>
    </div>
  )
}

export default App
