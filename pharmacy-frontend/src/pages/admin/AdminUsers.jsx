import React, { useEffect, useState } from 'react'
import { getAllUsers, createUser, updateUserStatus, changeUserPassword, getAllPharmacies } from '../../services/adminService'
import { validateEmail, validatePhoneRequired, validatePassword, validateUsername, validateName, validateRequired } from '../../utils/validation'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [addModal, setAddModal] = useState(false)
  const [passwordModal, setPasswordModal] = useState({ open: false, userId: null, username: '' })
  const [newPassword, setNewPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [passwordError, setPasswordError] = useState('')

  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    pharmacyId: ''
  })

  useEffect(() => {
    loadUsers()
    loadPharmacies()
  }, [filterRole])

  const loadPharmacies = async () => {
    try {
      const data = await getAllPharmacies()
      setPharmacies(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load pharmacies:', err)
    }
  }

  const loadUsers = async () => {
    setError('')
    try {
      setLoading(true)
      const params = filterRole !== 'ALL' ? { role: filterRole } : {}
      const data = await getAllUsers(params)
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    setError('')
    
    // Validate all fields
    const errors = {
      username: validateUsername(form.username),
      password: validatePassword(form.password, 6),
      name: validateName(form.name),
      email: validateEmail(form.email),
      phone: validatePhoneRequired(form.phone)
    }

    if (form.role === 'PHARMACY' && !form.pharmacyId) {
      errors.pharmacyId = 'Please select a pharmacy for PHARMACY role'
    }

    setFieldErrors(errors)

    // Check if there are any errors
    if (Object.values(errors).some((err) => err !== '')) {
      return
    }

    try {
      setLoading(true)
      const payload = {
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        pharmacyId: form.role === 'PHARMACY' ? Number(form.pharmacyId) : null
      }
      await createUser(payload)
      setAddModal(false)
      setForm({ username: '', password: '', name: '', email: '', phone: '', role: 'CUSTOMER', pharmacyId: '' })
      setFieldErrors({})
      showSuccess('User created successfully!')
      loadUsers()
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    
    const result = await showConfirm(
      `Do you want to ${newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} this user?`,
      'Change User Status'
    )
    
    if (!result.isConfirmed) return
    
    setError('')
    try {
      setLoading(true)
      await updateUserStatus(userId, { status: newStatus })
      showSuccess(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully!`)
      loadUsers()
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    
    const error = validatePassword(newPassword, 6)
    if (error) {
      setPasswordError(error)
      return
    }

    try {
      setLoading(true)
      await changeUserPassword(passwordModal.userId, { newPassword })
      setPasswordModal({ open: false, userId: null, username: '' })
      setNewPassword('')
      setPasswordError('')
      showSuccess('Password changed successfully!')
    } catch (err) {
      setPasswordError(err?.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users, add pharmacy users, activate/deactivate accounts</p>
          </div>
          <button className="btn" onClick={() => setAddModal(true)}>Add User</button>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

        <div className="mt-4 flex gap-2">
          <select
            className="input w-auto"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="ALL">All Users</option>
            <option value="CUSTOMER">Customers</option>
            <option value="PHARMACY">Pharmacy Users</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Username</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3 font-medium">{user.username}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3 text-gray-600">{user.email || '—'}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() =>
                            setPasswordModal({ open: true, userId: user.id, username: user.username })
                          }
                          disabled={loading}
                        >
                          Change Password
                        </button>
                        <button
                          className={`text-sm font-medium ${
                            user.status === 'ACTIVE' ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                          onClick={() => toggleStatus(user.id, user.status || 'ACTIVE')}
                          disabled={loading}
                        >
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="card p-6 w-full max-w-md my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">Add New User</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Username *</label>
                <input
                  className={`input mt-1 ${fieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={form.username}
                  onChange={(e) => {
                    setForm({ ...form, username: e.target.value })
                    if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }))
                  }}
                  placeholder="user123"
                />
                {fieldErrors.username && <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Password *</label>
                <input
                  type="password"
                  className={`input mt-1 ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }))
                  }}
                  placeholder="••••••••"
                />
                {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Name *</label>
                <input
                  className={`input mt-1 ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }))
                  }}
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
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value })
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }))
                  }}
                  placeholder="user@example.com"
                />
                {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Phone *</label>
                <input
                  className={`input mt-1 ${fieldErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value })
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }))
                  }}
                  placeholder="0714582468 or +94714582468"
                />
                {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <select 
                  className="input mt-1" 
                  value={form.role} 
                  onChange={(e) => {
                    setForm({ ...form, role: e.target.value, pharmacyId: '' })
                    if (fieldErrors.pharmacyId) setFieldErrors((prev) => ({ ...prev, pharmacyId: '' }))
                  }}
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="PHARMACY">PHARMACY</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              {form.role === 'PHARMACY' && (
                <div>
                  <label className="text-sm font-medium">Pharmacy *</label>
                  <select 
                    className={`input mt-1 ${fieldErrors.pharmacyId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    value={form.pharmacyId} 
                    onChange={(e) => {
                      setForm({ ...form, pharmacyId: e.target.value })
                      if (fieldErrors.pharmacyId) setFieldErrors((prev) => ({ ...prev, pharmacyId: '' }))
                    }}
                  >
                    <option value="">-- Select Pharmacy --</option>
                    {pharmacies.map((pharmacy) => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name} - {pharmacy.address}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.pharmacyId && <p className="text-xs text-red-600 mt-1">{fieldErrors.pharmacyId}</p>}
                  {pharmacies.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No pharmacies available. Create a pharmacy first.</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn-danger"
                onClick={() => {
                  setAddModal(false)
                  setForm({ username: '', password: '', name: '', email: '', phone: '', role: 'CUSTOMER', pharmacyId: '' })
                }}
              >
                Cancel
              </button>
              <button className="btn-success" onClick={handleAdd} disabled={loading}>
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="card p-6 w-full max-w-md my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">Change Password</h2>
            <p className="text-sm text-gray-600 mt-1">
              User: <span className="font-medium">{passwordModal.username}</span>
            </p>
            {passwordError && <div className="mt-3 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{passwordError}</div>}
            <div className="mt-4">
              <label className="text-sm font-medium">New Password *</label>
              <input
                type="password"
                className={`input mt-1 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (passwordError) setPasswordError('')
                }}
                placeholder="••••••••"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn-danger"
                onClick={() => {
                  setPasswordModal({ open: false, userId: null, username: '' })
                  setNewPassword('')
                  setPasswordError('')
                }}
              >
                Cancel
              </button>
              <button className="btn-success" onClick={handlePasswordChange} disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
