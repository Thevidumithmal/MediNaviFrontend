import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPharmacyStock } from '../../services/pharmacyService'
import { createInvoice } from '../../services/pharmacyService'

export default function PharmacyPOS() {
  const { user, pharmacyId } = useAuth()
  const [stock, setStock] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [filter, setFilter] = useState('')
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [taxPct, setTaxPct] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [invoiceNo, setInvoiceNo] = useState('')

  const loadStock = async () => {
    if (!pharmacyId) return
    const items = await getPharmacyStock(pharmacyId)
    setStock(Array.isArray(items) ? items : [])
  }

  useEffect(() => {
    setError('')
    setLoading(true)
    loadStock().catch((err) => setError(err?.response?.data?.message || 'Failed to load stock')).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return stock
    return stock.filter((s) => String(s.medicineName || s.name || '').toLowerCase().includes(q))
  }, [filter, stock])

  const addToCart = (item) => {
    const id = item.medicineId ?? item.id
    const name = item.medicineName ?? item.name ?? `#${id}`
    const price = Number(item.price ?? item.unitPrice ?? 0)
    setCart((prev) => {
      const exist = prev.find((c) => c.medicineId === id)
      if (exist) {
        return prev.map((c) => c.medicineId === id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { medicineId: id, medicineName: name, quantity: 1, price }]
    })
  }

  const updateQty = (id, qty) => {
    const q = Math.max(1, Number(qty || 1))
    setCart((prev) => prev.map((c) => c.medicineId === id ? { ...c, quantity: q } : c))
  }

  const updatePrice = (id, p) => {
    const v = Math.max(0, Number(p || 0))
    setCart((prev) => prev.map((c) => c.medicineId === id ? { ...c, price: v } : c))
  }

  const removeItem = (id) => setCart((prev) => prev.filter((c) => c.medicineId !== id))
  const clearCart = () => setCart([])

  const subtotal = useMemo(() => cart.reduce((sum, c) => sum + (c.price * c.quantity), 0), [cart])
  const tax = useMemo(() => Math.round((subtotal * Number(taxPct)))/100, [subtotal, taxPct])
  const total = useMemo(() => Math.max(0, subtotal + tax - Number(discount || 0)), [subtotal, tax, discount])

  const saveInvoice = async () => {
    setError('')
    if (cart.length === 0) {
      setError('Add at least one item')
      return
    }
    try {
      setSaving(true)
      const payload = {
        pharmacyId,
        cashierName: user?.name,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: cart.map((c) => ({ medicineId: c.medicineId, quantity: c.quantity, unitPrice: c.price })),
        subtotal,
        taxAmount: tax,
        discountAmount: Number(discount || 0),
        totalAmount: total,
      }
      const res = await createInvoice(payload)
      setInvoiceNo(res?.invoiceNumber || '')
      alert('Invoice saved')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const printInvoice = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="card p-6 print:hidden">
        <h1 className="text-2xl font-bold">Pharmacy POS & Invoice</h1>
        <p className="text-gray-600 mt-1">Bill walk-in customers, compute totals, and print invoice.</p>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 print:hidden">
        <div className="card p-6">
          <h2 className="font-semibold">Stock</h2>
          <div className="mt-3 flex gap-2">
            <input className="input flex-1" placeholder="Search medicine" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <button className="btn-secondary" onClick={loadStock} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
          </div>

          <div className="mt-4 space-y-2 max-h-[360px] overflow-auto">
            {filtered.map((s) => (
              <div key={s.medicineId ?? s.id} className="flex items-center justify-between border rounded-lg p-2">
                <div>
                  <p className="font-medium">{s.medicineName ?? s.name}</p>
                  <p className="text-xs text-gray-600">Price: Rs. {s.price ?? s.unitPrice ?? '-'}</p>
                </div>
                <button className="btn" onClick={() => addToCart(s)}>Add</button>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-sm text-gray-600">No matches</p>}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold">Cart</h2>
          <div className="mt-3 space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <input className="input mt-1" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Phone</label>
                <input className="input mt-1" value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left p-2">Medicine</th>
                    <th className="text-left p-2">Qty</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((c) => (
                    <tr key={c.medicineId} className="border-t">
                      <td className="p-2">{c.medicineName}</td>
                      <td className="p-2"><input type="number" min={1} className="input w-24" value={c.quantity} onChange={(e) => updateQty(c.medicineId, e.target.value)} /></td>
                      <td className="p-2"><input type="number" min={0} className="input w-28" value={c.price} onChange={(e) => updatePrice(c.medicineId, e.target.value)} /></td>
                      <td className="p-2">Rs. {c.price * c.quantity}</td>
                      <td className="p-2"><button className="btn-secondary" onClick={() => removeItem(c.medicineId)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cart.length === 0 && <p className="text-sm text-gray-600 mt-2">Cart is empty</p>}
            </div>

            <div className="grid sm:grid-cols-3 gap-2 mt-3">
              <div>
                <label className="text-sm font-medium">Tax (%)</label>
                <input type="number" className="input mt-1" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value || 0))} />
              </div>
              <div>
                <label className="text-sm font-medium">Discount (Rs.)</label>
                <input type="number" className="input mt-1" value={discount} onChange={(e) => setDiscount(Number(e.target.value || 0))} />
              </div>
              <div className="flex items-end">
                <button className="btn-secondary w-full" onClick={clearCart}>Clear Cart</button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subtotal: Rs. {subtotal}</p>
                <p className="text-sm text-gray-600">Tax: Rs. {tax}</p>
                <p className="text-sm text-gray-600">Discount: Rs. {discount}</p>
                <p className="text-xl font-bold">Total: Rs. {total}</p>
                {invoiceNo && <p className="text-sm text-gray-600">Invoice #: {invoiceNo}</p>}
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={saveInvoice} disabled={saving || cart.length === 0}>{saving ? 'Saving...' : 'Save Invoice'}</button>
                <button className="btn" onClick={printInvoice} disabled={cart.length === 0}>Print PDF</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable invoice section */}
      <div className="card p-6 print:block hidden">
        <div>
          <h2 className="text-xl font-bold">Invoice</h2>
          <p className="text-sm text-gray-600">Pharmacy: {user?.pharmacyName || pharmacyId} • Cashier: {user?.name}</p>
          {invoiceNo && <p className="text-sm">Invoice #: {invoiceNo}</p>}
          <p className="text-sm">Customer: {customer.name} • {customer.phone}</p>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Item</th>
                <th className="text-left p-2">Qty</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((c) => (
                <tr key={`print-${c.medicineId}`} className="border-t">
                  <td className="p-2">{c.medicineName}</td>
                  <td className="p-2">{c.quantity}</td>
                  <td className="p-2">Rs. {c.price}</td>
                  <td className="p-2">Rs. {c.price * c.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <p className="text-sm">Subtotal: Rs. {subtotal}</p>
          <p className="text-sm">Tax: Rs. {tax}</p>
          <p className="text-sm">Discount: Rs. {discount}</p>
          <p className="text-lg font-bold">Total: Rs. {total}</p>
        </div>
        <p className="mt-4 text-xs text-gray-500">Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}
