import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCurrentUserProfile, updateUserProfile, changePassword } from '../../services/userService'
import { showError, showSuccess } from '../../utils/sweetAlert'
import { validateUsername, validatePhoneRequired, validatePassword } from '../../utils/validation'

export default function PharmacyProfile() {
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
    console.log('[DEBUG] Pharmacy Profile Data:', {
      id: user?.id,
      username: user?.username,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      role: user?.role,
      status: user?.status,
      pharmacyId: user?.pharmacyId,
      pharmacyName: user?.pharmacyName
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-500 mt-1">Manage your profile and security settings</p>
          </div>
          <div className="text-right">
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Personal Information</h2>
        <div className="flex items-start gap-6">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-green-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'P'}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Pharmacy User'}</h2>
            <p className="text-sm text-gray-500 mt-1">Pharmacy Staff Account</p>

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
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
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
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {user?.role || 'PHARMACY'}
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

                {/* Pharmacy Name */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Pharmacy Name</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{user?.pharmacyName || '—'}</p>
                </div>

                {/* Pharmacy ID */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Pharmacy ID</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">#{user?.pharmacyId || '—'}</p>
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
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Account Permissions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Manage Inventory</p>
              <p className="text-sm text-gray-600">Add & update stock</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Process Orders</p>
              <p className="text-sm text-gray-600">Accept & fulfill orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Point of Sale</p>
              <p className="text-sm text-gray-600">Create invoices & bills</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-600">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Invoice History</p>
              <p className="text-sm text-gray-600">View past transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Security Settings</h2>
        <p className="text-sm text-gray-600 mb-6">Keep your account secure by updating your password regularly</p>
        
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
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium flex items-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
