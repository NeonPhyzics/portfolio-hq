import { useState } from 'react'
import Login from './components/Login.jsx'
import { useAuth } from './lib/useAuth'
import { usePortfolioData } from './lib/usePortfolioData'
import './App.css'

const TABS = ['Today', 'Ventures', 'Active Projects', 'Skills']

const STATUS_CLASS = {
  Active: 'status-active',
  Building: 'status-building',
  'In progress': 'status-active',
  Deferred: 'status-deferred',
}

const PRIORITY_CLASS = {
  urgent: 'priority-urgent',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

// Static housekeeping proposals — not yet migrated into the tasks table,
// since these are rare one-off items rather than recurring task/venture work.
const PROPOSED_ACTIONS = [
  {
    id: 'rotate-supabase-credentials',
    summary: 'Rotate the SCDP Supabase access token and DB password',
    note: 'Deferred until SCDP finishes its remaining build steps in Lovable, per prior decision.',
    flag: 'Deferred',
  },
]

function StatusBadge({ status }) {
  const cls = STATUS_CLASS[status] || 'status-deferred'
  return <span className={`badge ${cls}`}>{status}</span>
}

function PriorityBadge({ priority }) {
  const cls = PRIORITY_CLASS[priority] || 'priority-medium'
  return <span className={`badge ${cls}`}>{priority}</span>
}

const PRIORITY_OPTIONS = ['urgent', 'high', 'medium', 'low']

function TaskRow({ task, onDone, onPriorityChange, onDueDateChange, parentLabel }) {
  return (
    <div className={`task-row ${task.isBlocked ? 'task-blocked' : ''}`}>
      <button className="task-check" onClick={() => onDone(task.id)} aria-label="Mark done" />
      <div className="task-row-main">
        <span className="task-title">{task.title}</span>
        {parentLabel && <span className="task-parent">{parentLabel}</span>}
        <div className="task-meta">
          {onPriorityChange ? (
            <select
              className={`priority-select ${PRIORITY_CLASS[task.priority] || 'priority-medium'}`}
              value={task.priority}
              onChange={(e) => onPriorityChange(task.id, e.target.value)}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          ) : (
            <PriorityBadge priority={task.priority} />
          )}
          {onDueDateChange ? (
            <input
              type="date"
              className="due-input"
              value={task.due_date || ''}
              onChange={(e) => onDueDateChange(task.id, e.target.value)}
            />
          ) : (
            task.due_date && <span className="task-due">due {task.due_date}</span>
          )}
        </div>
        {task.isBlocked && <span className="task-blocked-note">Blocked by: {task.blockerTitle}</span>}
      </div>
    </div>
  )
}

function VenturesView({ data }) {
  return (
    <div className="grid">
      {data.ventures.map((v) => {
        const next = data.tasksForVenture(v.id)[0]
        return (
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
              <div className="value">{next ? next.title : 'None open.'}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ActiveProjectsView({ data }) {
  return (
    <div className="list">
      {data.projects.map((p) => {
        const venture = data.ventures.find((v) => v.id === p.venture_id)
        const next = data.tasksForProject(p.id)[0]
        return (
          <div className="row-card" key={p.id}>
            <div className="row-top">
              <h3>{p.name}</h3>
              <StatusBadge status={p.status} />
            </div>
            <div className="tags">
              {venture ? (
                <span className="tag venture-tag">{venture.name}</span>
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
              <div className="value">{next ? next.title : 'None open.'}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LearningThreadCard({ thread, tasks, onDone, onPriorityChange, onDueDateChange, onClose, closed }) {
  const [nextAction, ...backlog] = tasks

  return (
    <div className={`row-card lt-card ${closed ? 'lt-closed' : ''}`}>
      <div className="lt-header">
        <div>
          <h3>{thread.title}</h3>
          <span className="tag lt-project-tag">{thread.linked_label}</span>
        </div>
        <div className="lt-meta">
          <span className={`badge ${thread.status === 'open' ? 'status-active' : 'status-deferred'}`}>
            {thread.status}
          </span>
          <span className="lt-since">since {thread.since}</span>
        </div>
      </div>

      {thread.build && <p className="lt-build">{thread.build}</p>}

      {!closed && nextAction && (
        <TaskRow task={nextAction} onDone={onDone} onPriorityChange={onPriorityChange} onDueDateChange={onDueDateChange} />
      )}
      {!closed && !nextAction && <div className="lt-next-action">No open tasks.</div>}

      <div className="lt-donewhen">
        <span className="lt-donewhen-label">Done when</span>
        {thread.done_when}
      </div>

      {backlog.length > 0 && (
        <details className="lt-backlog">
          <summary>Backlog ({backlog.length})</summary>
          <div className="list backlog-list">
            {backlog.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onDone={onDone}
                onPriorityChange={onPriorityChange}
                onDueDateChange={onDueDateChange}
              />
            ))}
          </div>
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
          <button className="lt-btn lt-btn-close" onClick={() => onClose(thread.id)}>
            Close thread
          </button>
        </div>
      )}
    </div>
  )
}

function SkillsView({ data }) {
  const open = data.learningThreads.filter((t) => t.status === 'open')
  const closed = data.learningThreads.filter((t) => t.status === 'closed')

  return (
    <>
      <section className="skills-section">
        <h2>Today's 1% Better</h2>
        {data.nudges.map((n) => (
          <div className="nudge" key={n.id}>
            <span className="tag nudge-tag">{n.tag}</span>
            <p>{n.text}</p>
          </div>
        ))}
      </section>

      <section className="skills-section">
        <h2>Learning Threads</h2>
        <div className="list">
          {open.map((t) => (
            <LearningThreadCard
              key={t.id}
              thread={t}
              tasks={data.tasksForThread(t.id)}
              onDone={(id) => data.setTaskStatus(id, 'done')}
              onPriorityChange={data.setTaskPriority}
              onDueDateChange={data.setTaskDueDate}
              onClose={data.closeThread}
            />
          ))}
        </div>

        {closed.length > 0 && (
          <details className="lt-closed-group">
            <summary>Closed ({closed.length})</summary>
            <div className="list">
              {closed.map((t) => (
                <LearningThreadCard key={t.id} thread={t} tasks={data.tasksForThread(t.id)} closed />
              ))}
            </div>
          </details>
        )}
      </section>

      <section className="skills-section">
        <h2>Proposed Actions</h2>
        <p className="proposals-note">Proposals only — nothing here has been run automatically.</p>
        <div className="list">
          {PROPOSED_ACTIONS.map((a) => (
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

function TodayView({ data }) {
  function parentLabel(task) {
    if (task.venture_id) return data.ventures.find((v) => v.id === task.venture_id)?.name
    if (task.project_id) return data.projects.find((p) => p.id === task.project_id)?.name
    if (task.learning_thread_id) return data.learningThreads.find((t) => t.id === task.learning_thread_id)?.title
    return null
  }

  const tasks = data.allOpenSorted

  if (tasks.length === 0) {
    return <p className="proposals-note">Nothing open. Go build something.</p>
  }

  return (
    <div className="list">
      {tasks.map((t) => (
        <div className="row-card" key={t.id}>
          <TaskRow
            task={t}
            onDone={(id) => data.setTaskStatus(id, 'done')}
            onPriorityChange={data.setTaskPriority}
            onDueDateChange={data.setTaskDueDate}
            parentLabel={parentLabel(t) || 'Unlinked'}
          />
        </div>
      ))}
    </div>
  )
}

function AppShell({ data, onSignOut }) {
  const [tab, setTab] = useState('Today')

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <h1>Portfolio HQ</h1>
          <p className="tagline">System of record for every venture, project, and skill in flight.</p>
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
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        {data.loading && <p className="proposals-note">Loading…</p>}
        {data.error && <p className="lt-btn-close">Error: {data.error.message}</p>}

        {!data.loading && !data.error && (
          <>
            {tab === 'Today' && <TodayView data={data} />}
            {tab === 'Ventures' && <VenturesView data={data} />}
            {tab === 'Active Projects' && <ActiveProjectsView data={data} />}
            {tab === 'Skills' && <SkillsView data={data} />}
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
