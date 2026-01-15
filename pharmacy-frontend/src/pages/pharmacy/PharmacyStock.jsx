import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import StockTable from '../../components/StockTable'
import { addStock, getPharmacyStock, updateStock } from '../../services/pharmacyService'

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
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <p className="text-gray-600 mt-1">Add new medicines or update quantity/price.</p>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

        <form onSubmit={onAdd} className="mt-4 grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Medicine Name</label>
            <input className="input mt-1" value={form.medicineName} onChange={(e) => setForm((f) => ({ ...f, medicineName: e.target.value }))} placeholder="e.g., Paracetamol" />
          </div>
          <div>
            <label className="text-sm font-medium">Quantity</label>
            <input type="number" className="input mt-1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Price</label>
            <input type="number" className="input mt-1" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div className="sm:col-span-4 flex justify-end">
            <button className="btn" disabled={loading}>{loading ? 'Saving...' : 'Add Stock'}</button>
          </div>
        </form>
      </div>

      <StockTable items={items} onUpdate={onUpdate} />
    </div>
  )
}
