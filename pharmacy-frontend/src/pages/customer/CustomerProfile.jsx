import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCurrentUserProfile, updateUserProfile } from '../../services/userService'
import { showError, showSuccess } from '../../utils/sweetAlert'
import { validateUsername, validatePhoneRequired } from '../../utils/validation'

export default function CustomerProfile() {
  const { user: authUser, updateUser } = useAuth()
  const [user, setUser] = useState(authUser)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', phone: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // First, use data from auth context
    setUser(authUser)
    
    // Then try to fetch fresh data from API (optional)
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      console.log('🔍 Current user from auth:', authUser)
      console.log('📡 Fetching fresh profile from API...')
      const data = await getCurrentUserProfile()
      console.log('✅ Profile data received:', data)
      setUser(data)
    } catch (err) {
      console.error('❌ Failed to load profile:', err)
      console.error('Error details:', err.response?.data || err.message)
      // Keep using auth context user if API fails
      console.log('📋 Using cached user data from login')
    } finally {
      setLoading(false)
    }
  }

  // Debug: Show what data we have
  useEffect(() => {
    console.log('👤 Customer Profile Data:', {
      id: user?.id,
      username: user?.username,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      role: user?.role,
      status: user?.status
    })
  }, [user])

  const handleEditClick = () => {
    setFormData({
      username: user?.username || '',
      phone: user?.phone || ''
    })
    setErrors({})
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData({ username: '', phone: '' })
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validate username
    const usernameError = validateUsername(formData.username)
    if (usernameError) newErrors.username = usernameError
    
    // Validate phone (required)
    const phoneError = validatePhoneRequired(formData.phone)
    if (phoneError) newErrors.phone = phoneError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) return
    
    try {
      setLoading(true)
      const updatedUser = await updateUserProfile(formData)
      setUser(updatedUser)
      updateUser(updatedUser) // Update auth context
      showSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update profile:', err)
      const errorMessage = err.response?.data?.message || 'Failed to update profile'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-gray-600 mt-1">View and manage your account information</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start gap-6">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-sm text-gray-500 mt-1">Customer Account</p>

            {isEditing ? (
              /* Edit Mode */
              <div className="mt-6 space-y-4">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`input ${errors.username ? 'border-red-500' : ''}`}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Username</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{user?.username || '—'}</p>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Email Address</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{user?.email || '—'}</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{user?.phone || '—'}</p>
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
                  <p className="mt-1">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {user?.role || 'CUSTOMER'}
                    </span>
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Account Status</label>
                  <p className="mt-1">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {user?.status || 'ACTIVE'}
                    </span>
                  </p>
                </div>

                {/* User ID */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">User ID</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">#{user?.id || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account Type</span>
            <span className="font-medium">Customer</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium">2026</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Can Place Orders</span>
            <span className="font-medium text-green-600">✓ Yes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
