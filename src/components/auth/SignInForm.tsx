import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiUrl } from '../../api/http'
import { inferUserRoleFromEmail } from '../../constants/userRoles'
import { useTdr } from '../../context/useTdr'

const SIGNIN_ENDPOINT = apiUrl('/api/frontend-auth/signin')

export default function SignInForm() {
  const navigate = useNavigate()
  const { setRole, setUserProfile } = useTdr()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(SIGNIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed')
      }

      const emailFromApi = String(data?.data?.email || formData.email).trim().toLowerCase()
      const lastSignupRaw = localStorage.getItem('tdr.portal.lastSignupProfile')
      let storedName = ''
      if (lastSignupRaw) {
        try {
          const parsed = JSON.parse(lastSignupRaw) as { name?: string; email?: string }
          if (parsed.email?.toLowerCase() === emailFromApi && parsed.name) {
            storedName = parsed.name
          }
        } catch {
          storedName = ''
        }
      }
      const displayName = (storedName || emailFromApi.split('@')[0]?.replace(/[._-]/g, ' ') || 'User').trim()
      toast.success('Login successful')
      setRole(inferUserRoleFromEmail(emailFromApi))
      setUserProfile({
        name: displayName
          .split(' ')
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
        email: emailFromApi,
      })

      setTimeout(() => {
        navigate('/dashboard/apply')
      }, 900)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Enter Username *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          placeholder="username or email"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          placeholder="Enter your password"
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <Link to="/forgot-password" className="text-blue-600 hover:underline">
          Forgot Password?
        </Link>
        {/* <Link to="/signup" className="text-blue-600 hover:underline">
          Register
        </Link> */}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-slate-300 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

    </form>
  )
}