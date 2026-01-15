import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    pharmacyName: '',
    address: '',
    latitude: '',
    longitude: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setError('')
    setSuccess('')
  }, [form.role])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    if (!form.name.trim()) return 'Name is required'
    if (!form.email.trim()) return 'Email is required'
    if (!form.password) return 'Password is required'
    if (!form.role) return 'Role is required'

    if (form.role === 'PHARMACY') {
      if (!form.pharmacyName.trim()) return 'Pharmacy name is required'
      if (!form.address.trim()) return 'Address is required'
      if (form.latitude === '' || form.longitude === '') return 'Latitude & Longitude are required'
      if (Number.isNaN(Number(form.latitude)) || Number.isNaN(Number(form.longitude))) return 'Latitude/Longitude must be numbers'
    }

    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const v = validate()
    if (v) {
      setError(v)
      return
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    }

    if (form.role === 'PHARMACY') {
      payload.pharmacyName = form.pharmacyName
      payload.address = form.address
      payload.latitude = Number(form.latitude)
      payload.longitude = Number(form.longitude)
    }

    try {
      setLoading(true)
      await registerUser(payload)
      setSuccess('Registration successful. You can login now.')
      setTimeout(() => navigate('/login'), 700)
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="text-sm text-gray-600 mt-1">Create a new account</p>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
        {success && <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 p-3 text-sm">{success}</div>}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input className="input mt-1" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select className="input mt-1" value={form.role} onChange={(e) => update('role', e.target.value)}>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="PHARMACY">PHARMACY</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input className="input mt-1" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="input mt-1" value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>
          </div>

          {form.role === 'PHARMACY' && (
            <div className="mt-4 space-y-4">
              <div className="border-t pt-4">
                <h2 className="font-semibold">Pharmacy Details</h2>
                <p className="text-sm text-gray-600">Required for pharmacy owner accounts</p>
              </div>

              <div>
                <label className="text-sm font-medium">Pharmacy Name</label>
                <input className="input mt-1" value={form.pharmacyName} onChange={(e) => update('pharmacyName', e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <input className="input mt-1" value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Latitude</label>
                  <input className="input mt-1" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} placeholder="6.9271" />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitude</label>
                  <input className="input mt-1" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} placeholder="79.8612" />
                </div>
              </div>
            </div>
          )}

          <button className="btn w-full" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account? <Link className="font-medium underline" to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
