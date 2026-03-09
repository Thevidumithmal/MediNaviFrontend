import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import StockTable from '../../components/StockTable'
import { addStock, getPharmacyStock, updateStock } from '../../services/pharmacyService'
import { showSuccess } from '../../utils/sweetAlert'

export default function PharmacyStock() {
  const { pharmacyId } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ medicineName: '', quantity: '', price: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!pharmacyId) return
    const data = await getPharmacyStock(pharmacyId)
    setItems(data)
  }

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || 'Failed to load stock'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId])

  const validateAdd = () => {
    if (!form.medicineName.trim()) return 'Medicine name is required'
    if (form.quantity === '' || Number(form.quantity) < 0) return 'Quantity must be 0 or more'
    if (form.price === '' || Number(form.price) < 0) return 'Price must be 0 or more'
    return ''
  }

  const onAdd = async (e) => {
    e.preventDefault()
    setError('')
    const v = validateAdd()
    if (v) {
      setError(v)
      return
    }

    try {
      setLoading(true)
      await addStock({
        pharmacyId,
        medicineName: form.medicineName.trim(),
        quantity: Number(form.quantity),
        price: Number(form.price)
      })
      setForm({ medicineName: '', quantity: '', price: '' })
      await load()
      showSuccess(`${form.medicineName.trim()} has been added to inventory successfully!`, 'Medicine Added!')
    } catch (err) {
      setError(err?.response?.data?.message || 'Add stock failed')
    } finally {
      setLoading(false)
    }
  }

  const onUpdate = async (stockId, payload) => {
    setError('')
    try {
      setLoading(true)
      await updateStock(stockId, payload)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
            <p className="text-gray-500 mt-1">Manage your medicine stock and pricing</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm font-medium border-l-4 border-red-600">{error}</div>}
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Add New Medicine</h2>
        <form onSubmit={onAdd} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Medicine Name <span className="text-red-600">*</span></label>
              <input 
                className="input mt-1" 
                value={form.medicineName} 
                onChange={(e) => setForm((f) => ({ ...f, medicineName: e.target.value }))} 
                placeholder="e.g., Paracetamol"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Quantity <span className="text-red-600">*</span></label>
              <input 
                type="number" 
                min="0"
                className="input mt-1" 
                value={form.quantity} 
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} 
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Price (Rs.) <span className="text-red-600">*</span></label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                className="input mt-1" 
                value={form.price} 
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} 
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Inventory
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <StockTable items={items} onUpdate={onUpdate} />
    </div>
  )
}
