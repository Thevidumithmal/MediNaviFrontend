import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'
import { validateEmail, validatePhoneRequired, validatePassword, validateName, validateUsername } from '../utils/validation'
import { showSuccess, showError } from '../utils/sweetAlert'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: '' }))
    }
  }

  const validateField = (key, value) => {
    let error = ''
    switch (key) {
      case 'username':
        error = validateUsername(value)
        break
      case 'name':
        error = validateName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value, 6)
        break
      case 'phone':
        error = validatePhoneRequired(value)
        break
      default:
        break
    }
    setFieldErrors((prev) => ({ ...prev, [key]: error }))
    return error
  }

  const validate = () => {
    const errors = {
      username: validateUsername(form.username),
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password, 6),
      phone: validatePhoneRequired(form.phone)
    }
    
    setFieldErrors(errors)
    
    // Return true if no errors
    return !Object.values(errors).some((err) => err !== '')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validate()) {
      return
    }

    const payload = {
      username: form.username,
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: 'CUSTOMER'
    }

    // Log payload for debugging
    console.log('📤 Registration Payload:', payload)

    try {
      setLoading(true)
      const result = await registerUser(payload)
      console.log('[SUCCESS] Registration Response:', result)
      await showSuccess('Registration successful! Redirecting to login...', 'Welcome!')
      navigate('/login')
    } catch (err) {
      showError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-sm text-gray-600 mt-1">Register as a customer to start ordering medicines</p>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
        {success && <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 p-3 text-sm">{success}</div>}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Username *</label>
            <input 
              className={`input mt-1 ${fieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={form.username} 
              onChange={(e) => update('username', e.target.value)}
              onBlur={(e) => validateField('username', e.target.value)}
              placeholder="johndoe123"
            />
            {fieldErrors.username && <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Full Name *</label>
            <input 
              className={`input mt-1 ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={form.name} 
              onChange={(e) => update('name', e.target.value)}
              onBlur={(e) => validateField('name', e.target.value)}
              placeholder="John Doe"
            />
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Email *</label>
            <input 
              type="text"
              className={`input mt-1 ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={form.email} 
              onChange={(e) => update('email', e.target.value)}
              onBlur={(e) => validateField('email', e.target.value)}
              placeholder="you@example.com" 
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Password *</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className={`input mt-1 pr-10 ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                value={form.password} 
                onChange={(e) => update('password', e.target.value)}
                onBlur={(e) => validateField('password', e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number *</label>
            <input 
              type="tel"
              className={`input mt-1 ${fieldErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={form.phone} 
              onChange={(e) => update('phone', e.target.value)}
              onBlur={(e) => validateField('phone', e.target.value)}
              placeholder="0714582468 or +94714582468"
            />
            {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
          </div>

          <button className="btn w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Already have an account? <Link className="font-medium text-blue-600 hover:underline" to="/login">Login</Link>
          </p>
          <p className="text-xs text-gray-500 mt-3">
            <strong>Note:</strong> Pharmacy accounts and Admin accounts can only be created by administrators.
          </p>
        </div>
      </div>
    </div>
  )
}
