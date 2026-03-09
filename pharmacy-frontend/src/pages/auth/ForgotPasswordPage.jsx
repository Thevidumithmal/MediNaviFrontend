import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../services/authService'
import { validateRequired, validateEmail } from '../../utils/validation'
import { showSuccess, showError } from '../../utils/sweetAlert'
import logo from '../../assets/medinavi logo.png'

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateField = (key, value) => {
    let error = ''
    if (key === 'username') {
      error = validateRequired(value, 'Username')
    } else if (key === 'email') {
      error = validateEmail(value)
    }
    setFieldErrors((prev) => ({ ...prev, [key]: error }))
    return error
  }

  const validate = () => {
    const errors = {
      username: validateRequired(username, 'Username'),
      email: validateEmail(email)
    }
    setFieldErrors(errors)
    return !Object.values(errors).some((err) => err !== '')
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setLoading(true)
      const res = await forgotPassword({ username, email })
      
      await showSuccess(
        'Success!',
        res.message || 'Temporary password has been sent to your email. Please check your inbox.'
      )
      
      // Redirect to login page
      navigate('/login')
    } catch (err) {
      console.error('Forgot password error:', err)
      showError(
        'Error',
        err.response?.data?.message || 'Failed to process request. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Pharmacy Logo" className="h-32 w-32 object-cover" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h1>
          <p className="text-gray-600">
            Enter your username and email to receive a temporary password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                validateField('username', e.target.value)
              }}
              onBlur={(e) => validateField('username', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                fieldErrors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your username"
            />
            {fieldErrors.username && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                validateField('email', e.target.value)
              }}
              onBlur={(e) => validateField('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Temporary Password'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to Login
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> You will receive a temporary password via email. Use it to login, then change your password in the profile section.
          </p>
        </div>
      </div>
    </div>
  )
}
