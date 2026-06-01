import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      setMessage('Password reset link sent to your email')
      setEmail('')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Registered Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          placeholder="Enter your registered email"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      {message && (
        <p className="mt-2 text-center text-xs text-slate-600">
          {message}
        </p>
      )}

      <p className="mt-3 text-center text-xs">
        Remember your password?{' '}
        <Link to="/" className="font-medium text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  )
}