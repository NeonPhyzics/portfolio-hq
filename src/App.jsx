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

      <section className="skills-section">
        <h2>Learning Threads</h2>
        <div className="list">
          {data.skills.learningItems.map((item) => (
            <div className="row-card" key={item.id}>
              <div className="row-top">
                <h3>{item.summary}</h3>
                <span className={`badge ${item.status === 'open' ? 'status-active' : 'status-deferred'}`}>
                  {item.status}
                </span>
              </div>
              <div className="field">
                <div className="label">Since</div>
                <div className="value">{item.firstSeen}</div>
              </div>
              {item.note && (
                <div className="field next">
                  <div className="label">Note</div>
                  <div className="value">{item.note}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

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
