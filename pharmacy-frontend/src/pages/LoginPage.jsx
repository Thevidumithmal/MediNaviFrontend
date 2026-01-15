import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    if (!email.trim()) return 'Email is required'
    if (!password) return 'Password is required'
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    try {
      setLoading(true)
      const res = await loginUser({ email, password })
      login(res)

      const role = res?.user?.role
      if (role === 'CUSTOMER') navigate('/customer/dashboard')
      else if (role === 'PHARMACY') navigate('/pharmacy/dashboard')
      else if (role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-sm text-gray-600 mt-1">Access your dashboard</p>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
          </div>

          <button className="btn w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Don’t have an account? <Link className="font-medium underline" to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
