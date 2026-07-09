'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-5/12 flex-col justify-between p-12" style={{ backgroundColor: 'var(--accent)' }}>
        <span className="font-display text-3xl text-white">Tasks.</span>
        <div>
          <p className="font-display text-4xl leading-tight text-white/95 mb-4">
            Start with<br />an empty list.
          </p>
          <p className="text-white/70 text-sm max-w-xs">
            Sign up in seconds. No clutter, no noise — just what you need to do today.
          </p>
        </div>
        <p className="text-white/50 text-xs">Built for people who like a clean inbox.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8">
            <span className="font-display text-2xl" style={{ color: 'var(--accent)' }}>Tasks.</span>
          </div>
          <h1 className="font-display text-3xl mb-2">Create your account</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--ink-soft)' }}>Takes less than a minute.</p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-wide font-medium block mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md px-3.5 py-2.5 border outline-none transition-colors focus:border-[var(--accent)]"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide font-medium block mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md px-3.5 py-2.5 border outline-none transition-colors focus:border-[var(--accent)]"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>

            {error && (
              <p className="text-sm rounded-md px-3 py-2" style={{ backgroundColor: '#FBEDE8', color: 'var(--danger)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-md px-4 py-2.5 text-white font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="text-sm mt-6 text-center" style={{ color: 'var(--ink-soft)' }}>
            Already have an account?{' '}
            <a href="/login" className="font-medium underline" style={{ color: 'var(--accent)' }}>
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}