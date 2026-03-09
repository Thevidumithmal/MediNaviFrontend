import React, { useEffect, useState } from 'react'
import { getAllPharmacies, createPharmacy, deletePharmacy } from '../../services/adminService'
import { validateRequired, validatePhone, validateLatitude, validateLongitude } from '../../utils/validation'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: ''
  })

  useEffect(() => {
    loadPharmacies()
  }, [])

  const loadPharmacies = async () => {
    setError('')
    try {
      setLoading(true)
      const data = await getAllPharmacies()
      setPharmacies(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load pharmacies')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    setError('')
    
    // Validate all fields
    const errors = {
      name: validateRequired(form.name, 'Pharmacy name'),
      address: validateRequired(form.address, 'Address'),
      phone: validateRequired(form.phone, 'Phone number') || validatePhone(form.phone),
      latitude: validateRequired(form.latitude, 'Latitude') || validateLatitude(form.latitude),
      longitude: validateRequired(form.longitude, 'Longitude') || validateLongitude(form.longitude)
    }

    setFieldErrors(errors)

    // Check if there are any errors
    if (Object.values(errors).some((err) => err !== '')) {
      return
    }

    const payload = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude)
    }

    try {
      setLoading(true)
      await createPharmacy(payload)
      setAddModal(false)
      setForm({ name: '', address: '', phone: '', latitude: '', longitude: '' })
      setFieldErrors({})
      showSuccess('Pharmacy created successfully!')
      loadPharmacies()
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to create pharmacy')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await showConfirm(
      'Delete this pharmacy? This cannot be undone.',
      'Delete Pharmacy'
    )
    
    if (!result.isConfirmed) return
    
    setError('')
    try {
      setLoading(true)
      await deletePharmacy(id)
      showSuccess('Pharmacy deleted successfully!')
      loadPharmacies()
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to delete pharmacy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pharmacy Management</h1>
            <p className="text-gray-600 mt-1">View, add, and manage all pharmacies</p>
          </div>
          <button className="btn" onClick={() => setAddModal(true)}>Add Pharmacy</button>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Address</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.length > 0 ? (
                pharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">{pharmacy.id}</td>
                    <td className="p-3 font-medium">{pharmacy.name}</td>
                    <td className="p-3 text-gray-600">{pharmacy.address || '—'}</td>
                    <td className="p-3 text-gray-600">{pharmacy.phone || '—'}</td>
                    <td className="p-3 text-gray-600">
                      {pharmacy.latitude != null && pharmacy.longitude != null
                        ? `${pharmacy.latitude}, ${pharmacy.longitude}`
                        : '—'}
                    </td>
                    <td className="p-3">
                      <button
                        className="btn-danger text-sm"
                        onClick={() => handleDelete(pharmacy.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No pharmacies found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Pharmacy Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold">Add New Pharmacy</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <input
                  className={`input mt-1 ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  placeholder="City Pharmacy"
                />
                {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Address *</label>
                <input
                  className={`input mt-1 ${fieldErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={form.address}
                  onChange={(e) => {
                    setForm({ ...form, address: e.target.value })
                    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }))
                  }}
                  placeholder="123 Main St, Colombo"
                />
                {fieldErrors.address && <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Latitude *</label>
                  <input
                    className={`input mt-1 ${fieldErrors.latitude ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    value={form.latitude}
                    onChange={(e) => {
                      setForm({ ...form, latitude: e.target.value })
                      if (fieldErrors.latitude) setFieldErrors((prev) => ({ ...prev, latitude: '' }))
                    }}
                    placeholder="6.9271"
                  />
                  {fieldErrors.latitude && <p className="text-xs text-red-600 mt-1">{fieldErrors.latitude}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Longitude *</label>
                  <input
                    className={`input mt-1 ${fieldErrors.longitude ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    value={form.longitude}
                    onChange={(e) => {
                      setForm({ ...form, longitude: e.target.value })
                      if (fieldErrors.longitude) setFieldErrors((prev) => ({ ...prev, longitude: '' }))
                    }}
                    placeholder="79.8612"
                  />
                  {fieldErrors.longitude && <p className="text-xs text-red-600 mt-1">{fieldErrors.longitude}</p>}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn-danger"
                onClick={() => {
                  setAddModal(false)
                  setForm({ name: '', address: '', phone: '', latitude: '', longitude: '' })
                  setFieldErrors({})
                }}
              >
                Cancel
              </button>
              <button className="btn-success" onClick={handleAdd} disabled={loading}>
                {loading ? 'Adding...' : 'Add Pharmacy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
