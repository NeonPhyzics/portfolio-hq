import { useState } from 'react'
import Login from './components/Login.jsx'
import { useAuth } from './lib/useAuth'
import { usePortfolioData } from './lib/usePortfolioData'
import './App.css'

const TABS = ['Monday Review', 'By Band', 'By Domain']

const BAND_LABEL = {
  1: 'Core Business',
  2: 'Business Tools',
  3: 'Tools + Learning',
  4: 'Hobbies',
}

const URGENCY_OPTIONS = ['urgent', 'high', 'medium', 'low']
const STATUS_OPTIONS = ['open', 'in_progress', 'blocked', 'done']
const BAND_OPTIONS = [1, 2, 3, 4]
const DOMAIN_OPTIONS = ['Business', 'Household']

const URGENCY_CLASS = {
  urgent: 'priority-urgent',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

const STATUS_SELECT_CLASS = {
  open: 'task-status-open',
  in_progress: 'task-status-in-progress',
  blocked: 'task-status-blocked-status',
  done: 'task-status-done',
}

function TaskRow({ task, onUpdate, onStatusChange, onDelete }) {
  const [notesOpen, setNotesOpen] = useState(false)

  return (
    <div className={`row-card task-row-card ${task.isBlocked ? 'task-blocked' : ''}`}>
      <div className="row-top">
        <select
          className={`status-select ${STATUS_SELECT_CLASS[task.status] || 'task-status-open'}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          aria-label="Task status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <h3 className="task-row-title">{task.title}</h3>
        <button className="delete-btn" onClick={() => onDelete(task.id)} aria-label="Delete task">
          ×
        </button>
      </div>

      {task.isBlocked && <span className="task-blocked-note">Blocked by: {task.blockerTitle}</span>}

      <div className="task-meta">
        <select
          className={`priority-select ${URGENCY_CLASS[task.urgency] || 'priority-medium'}`}
          value={task.urgency}
          onChange={(e) => onUpdate(task.id, { urgency: e.target.value })}
        >
          {URGENCY_OPTIONS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          className="band-select"
          value={task.band}
          onChange={(e) => onUpdate(task.id, { band: Number(e.target.value) })}
        >
          {BAND_OPTIONS.map((b) => (
            <option key={b} value={b}>
              Band {b} — {BAND_LABEL[b]}
            </option>
          ))}
        </select>
        <select
          className="domain-select"
          value={task.domain}
          onChange={(e) => onUpdate(task.id, { domain: e.target.value })}
        >
          {DOMAIN_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="due-input"
          value={task.due_date || ''}
          onChange={(e) => onUpdate(task.id, { due_date: e.target.value || null })}
        />
      </div>

      {task.venture && <span className="tag venture-tag">{task.venture}</span>}

      <details className="notes-toggle" open={notesOpen} onToggle={(e) => setNotesOpen(e.target.open)}>
        <summary>{task.notes ? 'Notes' : 'Add notes'}</summary>
        <textarea
          className="notes-input"
          defaultValue={task.notes || ''}
          onBlur={(e) => onUpdate(task.id, { notes: e.target.value || null })}
          rows={2}
        />
      </details>
    </div>
  )
}

function NewTaskForm({ onCreate }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [band, setBand] = useState(1)
  const [domain, setDomain] = useState('Business')
  const [urgency, setUrgency] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title: title.trim(), band, domain, urgency, due_date: dueDate || null })
    setTitle('')
    setBand(1)
    setDomain('Business')
    setUrgency('medium')
    setDueDate('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button className="toggle-btn new-task-btn" onClick={() => setOpen(true)}>
        + New task
      </button>
    )
  }

  return (
    <form className="new-task-form" onSubmit={submit}>
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="login-input"
      />
      <div className="task-meta">
        <select className="priority-select" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
          {URGENCY_OPTIONS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select className="band-select" value={band} onChange={(e) => setBand(Number(e.target.value))}>
          {BAND_OPTIONS.map((b) => (
            <option key={b} value={b}>
              Band {b} — {BAND_LABEL[b]}
            </option>
          ))}
        </select>
        <select className="domain-select" value={domain} onChange={(e) => setDomain(e.target.value)}>
          {DOMAIN_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input type="date" className="due-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="lt-actions">
        <button type="submit" className="lt-btn lt-btn-complete">
          Add
        </button>
        <button type="button" className="lt-btn lt-btn-close" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function MondayReviewView({ data }) {
  const groups = new Map()
  for (const t of data.openTasks) {
    if (!groups.has(t.band)) groups.set(t.band, [])
    groups.get(t.band).push(t)
  }

  return (
    <>
      <NewTaskForm onCreate={data.createTask} />
      {[...groups.entries()].map(([band, tasks]) => (
        <section key={band} className="today-group">
          <h2 className="today-group-title">
            Band {band} — {BAND_LABEL[band]}
          </h2>
          <div className="list">
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} onUpdate={data.updateTask} onStatusChange={data.setTaskStatus} onDelete={data.deleteTask} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function ByBandView({ data }) {
  const [band, setBand] = useState(1)
  const tasks = data.openTasks.filter((t) => t.band === band)

  return (
    <>
      <NewTaskForm onCreate={data.createTask} />
      <div className="view-toggle">
        {BAND_OPTIONS.map((b) => (
          <button key={b} className={`toggle-btn ${band === b ? 'active' : ''}`} onClick={() => setBand(b)}>
            Band {b}
          </button>
        ))}
      </div>
      {tasks.length === 0 ? (
        <p className="proposals-note">Nothing open in Band {band}.</p>
      ) : (
        <div className="list">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} onUpdate={data.updateTask} onStatusChange={data.setTaskStatus} onDelete={data.deleteTask} />
          ))}
        </div>
      )}
    </>
  )
}

function ByDomainView({ data }) {
  const [domain, setDomain] = useState('Business')
  const tasks = data.openTasks.filter((t) => t.domain === domain)

  return (
    <>
      <NewTaskForm onCreate={data.createTask} />
      <div className="view-toggle">
        {DOMAIN_OPTIONS.map((d) => (
          <button key={d} className={`toggle-btn ${domain === d ? 'active' : ''}`} onClick={() => setDomain(d)}>
            {d}
          </button>
        ))}
      </div>
      {tasks.length === 0 ? (
        <p className="proposals-note">Nothing open in {domain}.</p>
      ) : (
        <div className="list">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} onUpdate={data.updateTask} onStatusChange={data.setTaskStatus} onDelete={data.deleteTask} />
          ))}
        </div>
      )}
    </>
  )
}

function AppShell({ data, onSignOut }) {
  const [tab, setTab] = useState('Monday Review')

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h1>Portfolio HQ</h1>
          <p className="tagline">Personal task management for a multi-venture portfolio.</p>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
        <button className="signout-btn" onClick={onSignOut}>
          Sign out
        </button>
      </aside>

      <main className="content">
        <div className="mobile-brand">
          <h1>Portfolio HQ</h1>
        </div>
        <nav className="tabs mobile-tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>

        {data.loading && <p className="proposals-note">Loading…</p>}
        {data.error && <p className="lt-btn-close">Error: {data.error.message}</p>}

        {!data.loading && !data.error && (
          <>
            {tab === 'Monday Review' && <MondayReviewView data={data} />}
            {tab === 'By Band' && <ByBandView data={data} />}
            {tab === 'By Domain' && <ByDomainView data={data} />}
          </>
        )}
      </main>
    </div>
  )
}

function App() {
  const { session, loading: authLoading, sendMagicLink, signOut } = useAuth()
  const data = usePortfolioData(session)

  if (authLoading) return null
  if (!session) return <Login sendMagicLink={sendMagicLink} />

  return <AppShell data={data} onSignOut={signOut} />
}

export default App
