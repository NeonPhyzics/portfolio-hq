import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 }

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    // Blocked tasks always sort after ready ones, regardless of priority —
    // there's no point surfacing something as "next" that can't be started.
    if (a.isBlocked !== b.isBlocked) return a.isBlocked ? 1 : -1
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    if (p !== 0) return p
    const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity
    const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity
    if (ad !== bd) return ad - bd
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

export function usePortfolioData(session) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ventures, setVentures] = useState([])
  const [projects, setProjects] = useState([])
  const [learningThreads, setLearningThreads] = useState([])
  const [rawTasks, setRawTasks] = useState([])
  const [nudges, setNudges] = useState([])

  const refetch = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    const [v, p, lt, t, n] = await Promise.all([
      supabase.from('ventures').select('*').order('name'),
      supabase.from('projects').select('*').order('name'),
      supabase.from('learning_threads').select('*').order('code'),
      supabase.from('tasks').select('*'),
      supabase.from('nudges').select('*').order('created_at'),
    ])
    const firstError = v.error || p.error || lt.error || t.error || n.error
    if (firstError) {
      setError(firstError)
      setLoading(false)
      return
    }
    setVentures(v.data)
    setProjects(p.data)
    setLearningThreads(lt.data)
    setRawTasks(t.data)
    setNudges(n.data)
    setLoading(false)
  }, [session])

  useEffect(() => {
    refetch()
  }, [refetch])

  const tasksById = new Map(rawTasks.map((t) => [t.id, t]))

  // Enrich each task with whether it's currently blocked, and by what,
  // so views don't need to re-derive this themselves.
  const tasks = rawTasks.map((t) => {
    const blocker = t.blocked_by ? tasksById.get(t.blocked_by) : null
    const isBlocked = !!blocker && blocker.status !== 'done'
    return { ...t, isBlocked, blockerTitle: isBlocked ? blocker.title : null }
  })

  const openTasks = tasks.filter((t) => t.status !== 'done')

  function tasksFor(key, id) {
    return sortTasks(openTasks.filter((t) => t[key] === id))
  }

  async function patchTask(id, patch) {
    setRawTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    const { error } = await supabase.from('tasks').update(patch).eq('id', id)
    if (error) {
      setError(error)
      refetch()
    }
  }

  async function setTaskStatus(id, status) {
    await patchTask(id, { status, completed_at: status === 'done' ? new Date().toISOString() : null })
  }

  async function setTaskPriority(id, priority) {
    await patchTask(id, { priority })
  }

  async function setTaskDueDate(id, due_date) {
    await patchTask(id, { due_date: due_date || null })
  }

  async function closeThread(id) {
    setLearningThreads((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'closed' } : t)))
    const { error } = await supabase.from('learning_threads').update({ status: 'closed' }).eq('id', id)
    if (error) {
      setError(error)
      refetch()
    }
  }

  return {
    loading,
    error,
    ventures,
    projects,
    learningThreads,
    tasks,
    openTasks,
    nudges,
    tasksForVenture: (id) => tasksFor('venture_id', id),
    tasksForProject: (id) => tasksFor('project_id', id),
    tasksForThread: (id) => tasksFor('learning_thread_id', id),
    allOpenSorted: sortTasks(openTasks),
    setTaskStatus,
    setTaskPriority,
    setTaskDueDate,
    closeThread,
    refetch,
  }
}
