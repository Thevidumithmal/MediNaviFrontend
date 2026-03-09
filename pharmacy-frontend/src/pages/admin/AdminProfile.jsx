import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCurrentUserProfile, updateUserProfile, changePassword } from '../../services/userService'
import { showError, showSuccess } from '../../utils/sweetAlert'
import { validateUsername, validatePhoneRequired, validatePassword } from '../../utils/validation'

export default function AdminProfile() {
  const { user: authUser, updateUser } = useAuth()
  const [user, setUser] = useState(authUser)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', phone: '' })
  const [errors, setErrors] = useState({})
  
  // Password change state
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    // First, use data from auth context
    setUser(authUser)
    
    // Then try to fetch fresh data from API (optional)
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      console.log('[DEBUG] Current user from auth:', authUser)
      console.log('[API] Fetching fresh profile from API...')
      const data = await getCurrentUserProfile()
      console.log('[SUCCESS] Profile data received:', data)
      setUser(data)
    } catch (err) {
      console.error('[ERROR] Failed to load profile:', err)
      console.error('Error details:', err.response?.data || err.message)
      // Keep using auth context user if API fails
      console.log('[CACHE] Using cached user data from login')
    } finally {
      setLoading(false)
    }
  }

  // Debug: Show what data we have
  useEffect(() => {
    console.log('[DEBUG] Admin Profile Data:', {
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    const usernameError = validateUsername(formData.username)
    if (usernameError) newErrors.username = usernameError
    
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
      updateUser(updatedUser)
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

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validatePasswordForm = () => {
    const newErrors = {}
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    const newPasswordError = validatePassword(passwordData.newPassword)
    if (newPasswordError) newErrors.newPassword = newPasswordError
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return
    
    try {
      setPasswordLoading(true)
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      showSuccess('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordErrors({})
    } catch (err) {
      console.error('Failed to change password:', err)
      const errorMessage = err.response?.data?.message || 'Failed to change password'
      showError(errorMessage)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-gray-600 mt-1">View and manage your administrator account information</p>
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
            <div className="w-24 h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-3xl font-bold">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'A'}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Administrator'}</h2>
            <p className="text-sm text-gray-500 mt-1">System Administrator</p>

            {isEditing ? (
              /* Edit Mode */
              <div className="mt-6 space-y-4">
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

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="btn-success"
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
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {user?.role || 'ADMIN'}
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

      {/* Permissions Card */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Administrator Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 py-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Manage All Users</span>
          </div>
          <div className="flex items-center gap-2 py-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Manage Pharmacies</span>
          </div>
          <div className="flex items-center gap-2 py-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">View All Reports</span>
          </div>
          <div className="flex items-center gap-2 py-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">System Configuration</span>
          </div>
          <div className="flex items-center gap-2 py-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Create Admin Accounts</span>
          </div>
          <div className="flex items-center gap-2 py-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Full System Access</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <p className="text-sm text-gray-600 mb-4">Update your password to keep your account secure</p>
        
        <div className="max-w-md space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={`input pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={`input pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`input pr-10 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          {/* Change Password Button */}
          <div className="pt-2">
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="btn-success"
            >
              {passwordLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
