'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Task = {
  id: string
  title: string
  status: string
  due_date: string | null
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setTasks(data as Task[])
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else fetchTasks()
    })
  }, [])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { error } = await supabase.from('tasks').insert({
      title,
      status: 'todo',
      user_id: userData.user.id,
    })

    if (error) setError(error.message)
    else {
      setTitle('')
      fetchTasks()
    }
  }

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    fetchTasks()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)' }}>
      <div className="max-w-xl mx-auto px-6 py-12">
        <header className="flex justify-between items-start mb-10">
          <div>
            <span className="font-display text-2xl" style={{ color: 'var(--accent)' }}>Tasks.</span>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
              {tasks.length === 0
                ? 'Nothing on the list yet.'
                : `${doneCount} of ${tasks.length} done today.`}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm underline"
            style={{ color: 'var(--ink-soft)' }}
          >
            Log out
          </button>
        </header>

        {tasks.length > 0 && (
          <div className="h-1.5 rounded-full mb-8 overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(doneCount / tasks.length) * 100}%`,
                backgroundColor: 'var(--accent)',
              }}
            />
          </div>
        )}

        <form onSubmit={handleAddTask} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-md px-3.5 py-2.5 border outline-none focus:border-[var(--accent)] bg-white"
            style={{ borderColor: 'var(--border)' }}
          />
          <button
            type="submit"
            className="rounded-md px-5 py-2.5 text-white font-medium"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Add
          </button>
        </form>

        {error && (
          <p className="text-sm rounded-md px-3 py-2 mb-4" style={{ backgroundColor: '#FBEDE8', color: 'var(--danger)' }}>
            {error}
          </p>
        )}

        {loading ? (
          <ul className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <li key={i} className="h-14 rounded-md animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
            ))}
          </ul>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 rounded-md border border-dashed" style={{ borderColor: 'var(--border)' }}>
            <p className="font-display text-xl mb-1">A clean slate.</p>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
              Add your first task above to get going.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-md px-4 py-3 bg-white border group"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  onClick={() => handleToggleStatus(task)}
                  aria-label={task.status === 'done' ? 'Mark as not done' : 'Mark as done'}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    borderColor: task.status === 'done' ? 'var(--accent)' : 'var(--border)',
                    backgroundColor: task.status === 'done' ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {task.status === 'done' && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <span
                  className="flex-1 text-sm"
                  style={{
                    color: task.status === 'done' ? 'var(--ink-soft)' : 'var(--ink)',
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </span>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--danger)' }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}