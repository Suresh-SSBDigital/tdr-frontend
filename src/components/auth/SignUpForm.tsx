import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiUrl } from '../../api/http'

const SIGNUP_ENDPOINT = apiUrl('/api/frontend-auth/signup')

export default function SignupForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      toast.success('Registration successful')
      localStorage.setItem(
        'tdr.portal.lastSignupProfile',
        JSON.stringify({ name: formData.name.trim(), email: formData.email.trim().toLowerCase() }),
      )
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setTimeout(() => {
        navigate('/')
      }, 900)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          placeholder="Enter your email"
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

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Confirm Password *</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          placeholder="Confirm your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        {loading ? 'Creating...' : 'Register'}
      </button>

      <p className="mt-3 text-center text-xs">
        Already have an account?{' '}
        <Link to="/" className="font-medium text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  )
}