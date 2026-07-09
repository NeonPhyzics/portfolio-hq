import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const URGENCY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 }

function sortTasks(tasks) {
  // Per CLAUDE.md: band ascending, then urgency. Band always sorts first.
  // blocked_by is frozen/grandfathered — it's still shown on the row, but
  // deliberately doesn't reorder anything anymore per the new default sort.
  return [...tasks].sort((a, b) => {
    if (a.band !== b.band) return a.band - b.band
    return URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]
  })
}

export function usePortfolioData(session) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rawTasks, setRawTasks] = useState([])

  const refetch = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    // Only band-tagged rows are MVP tasks — learning-thread-linked rows are
    // intentionally left band=null so they're excluded here without a
    // separate table or any destructive migration.
    const { data, error } = await supabase.from('tasks').select('*').not('band', 'is', null)
    if (error) {
      setError(error)
      setLoading(false)
      return
    }
    setRawTasks(data)
    setLoading(false)
  }, [session])

  useEffect(() => {
    refetch()
  }, [refetch])

  const tasksById = new Map(rawTasks.map((t) => [t.id, t]))

  const tasks = rawTasks.map((t) => {
    const blocker = t.blocked_by ? tasksById.get(t.blocked_by) : null
    const isBlocked = !!blocker && blocker.status !== 'done'
    return { ...t, isBlocked, blockerTitle: isBlocked ? blocker.title : null }
  })

  const openTasks = sortTasks(tasks.filter((t) => t.status !== 'done'))

  async function updateTask(id, patch) {
    setRawTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    const { error } = await supabase.from('tasks').update(patch).eq('id', id)
    if (error) {
      setError(error)
      refetch()
    }
  }

  async function setTaskStatus(id, status) {
    await updateTask(id, { status, completed_at: status === 'done' ? new Date().toISOString() : null })
  }

  async function createTask(fields) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: session.user.id, ...fields })
      .select()
      .single()
    if (error) {
      setError(error)
      return
    }
    setRawTasks((prev) => [...prev, data])
  }

  async function deleteTask(id) {
    setRawTasks((prev) => prev.filter((t) => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      setError(error)
      refetch()
    }
  }

  return {
    loading,
    error,
    openTasks,
    updateTask,
    setTaskStatus,
    createTask,
    deleteTask,
    refetch,
  }
}
