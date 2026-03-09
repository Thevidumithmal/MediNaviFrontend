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
  const [calculated, setCalculated] = useState(false)

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
    if (!q) return [] // Don't show medicines until user types
    return stock.filter((s) => {
      const medicineName = String(s.medicineName || s.name || '').toLowerCase()
      return medicineName.startsWith(q) // Only show medicines that START with typed text
    })
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

  const removeItem = (id) => {
    setCart((prev) => prev.filter((c) => c.medicineId !== id))
    setCalculated(false)
  }
  
  const clearCart = () => {
    setCart([])
    setCalculated(false)
    setInvoiceNo('')
  }

  const subtotal = useMemo(() => cart.reduce((sum, c) => sum + (c.price * c.quantity), 0), [cart])
  const tax = useMemo(() => Math.round((subtotal * Number(taxPct)))/100, [subtotal, taxPct])
  const total = useMemo(() => Math.max(0, subtotal + tax - Number(discount || 0)), [subtotal, tax, discount])

  const handleCalculate = () => {
    setError('')
    if (cart.length === 0) {
      setError('Please add items to cart')
      return
    }
    if (!customer.name.trim()) {
      setError('Customer name is required')
      return
    }
    setCalculated(true)
  }

  const printAndSave = async () => {
    setError('')
    
    if (cart.length === 0) {
      setError('Please add items to cart')
      return
    }
    
    if (!customer.name.trim()) {
      setError('Customer name is required')
      return
    }

    if (!calculated) {
      setError('Please calculate the total first')
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
      
      // Wait a moment for state to update, then print
      setTimeout(() => {
        window.print()
        // Clear cart after printing
        setTimeout(() => {
          clearCart()
          setCustomer({ name: '', phone: '' })
          setTaxPct(0)
          setDiscount(0)
        }, 500)
      }, 300)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Point of Sale</h1>
            <p className="text-gray-500 mt-1">Transaction Management System</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Cashier: {user?.name}</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm font-medium border-l-4 border-red-600">{error}</div>}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 print:hidden">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">Medicine Inventory</h2>
          <div className="mt-3 flex gap-2">
            <input 
              className="input flex-1" 
              placeholder="Search by name..." 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
            />
            <button className="btn-secondary flex items-center gap-2" onClick={loadStock} disabled={loading}>
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>

          <div className="mt-4 space-y-2 max-h-[500px] overflow-auto">
            {filtered.map((s) => (
              <div key={s.medicineId ?? s.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{s.medicineName ?? s.name}</p>
                  <p className="text-sm text-gray-600">Rs. {s.price ?? s.unitPrice ?? '-'}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium" onClick={() => addToCart(s)}>+ Add</button>
              </div>
            ))}
            {filter.trim() && filtered.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No medicines found matching "{filter}"</p>
            )}
            {!filter.trim() && (
              <p className="text-sm text-gray-500 text-center py-8 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start typing medicine name to search inventory
              </p>
            )}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">Transaction Details</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Customer Name <span className="text-red-600">*</span></label>
                <input 
                  className="input mt-1" 
                  placeholder="Enter customer name"
                  value={customer.name} 
                  onChange={(e) => {
                    setCustomer((c) => ({ ...c, name: e.target.value }))
                    setCalculated(false)
                  }} 
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                <input 
                  className="input mt-1" 
                  placeholder="Enter phone number"
                  value={customer.phone} 
                  onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} 
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left p-3 font-semibold">Item Description</th>
                    <th className="text-center p-3 font-semibold">Quantity</th>
                    <th className="text-right p-3 font-semibold">Unit Price</th>
                    <th className="text-right p-3 font-semibold">Amount</th>
                    <th className="text-center p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {cart.map((c) => (
                    <tr key={c.medicineId} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-800">{c.medicineName}</td>
                      <td className="p-3 text-center">
                        <input 
                          type="number" 
                          min={1} 
                          className="input w-20 text-center" 
                          value={c.quantity} 
                          onChange={(e) => {
                            updateQty(c.medicineId, e.target.value)
                            setCalculated(false)
                          }} 
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input 
                          type="number" 
                          min={0} 
                          step="0.01"
                          className="input w-28 text-right" 
                          value={c.price} 
                          onChange={(e) => {
                            updatePrice(c.medicineId, e.target.value)
                            setCalculated(false)
                          }} 
                        />
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-800">Rs. {(c.price * c.quantity).toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button 
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium" 
                          onClick={() => removeItem(c.medicineId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cart.length === 0 && <p className="text-sm text-gray-500 text-center py-8 bg-gray-50">No items in transaction</p>}
            </div>

            <div className="grid sm:grid-cols-4 gap-3 mt-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Tax Rate (%)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  className="input mt-1" 
                  value={taxPct} 
                  onChange={(e) => {
                    setTaxPct(Number(e.target.value || 0))
                    setCalculated(false)
                  }} 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Discount (Rs.)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  className="input mt-1" 
                  value={discount} 
                  onChange={(e) => {
                    setDiscount(Number(e.target.value || 0))
                    setCalculated(false)
                  }} 
                />
              </div>
              <div className="flex items-end">
                <button 
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition w-full font-medium" 
                  onClick={handleCalculate}
                  disabled={cart.length === 0}
                >
                  Calculate Total
                </button>
              </div>
              <div className="flex items-end">
                <button 
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition w-full font-medium" 
                  onClick={clearCart}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-700 font-medium">Subtotal:</span>
                    <span className="text-gray-900 font-semibold">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-700 font-medium">Tax ({taxPct}%):</span>
                    <span className="text-gray-900 font-semibold">Rs. {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-700 font-medium">Discount:</span>
                    <span className="text-gray-900 font-semibold">- Rs. {Number(discount).toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between gap-8">
                      <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">Rs. {total.toFixed(2)}</span>
                    </div>
                  </div>
                  {invoiceNo && (
                    <div className="mt-3 bg-green-100 px-3 py-2 rounded border border-green-300">
                      <p className="text-sm font-semibold text-green-800">Invoice #{invoiceNo}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2" 
                    onClick={printAndSave} 
                    disabled={saving || cart.length === 0 || !calculated}
                  >
                    {saving ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print & Save
                      </>
                    )}
                  </button>
                </div>
              </div>
              {!calculated && cart.length > 0 && (
                <p className="text-sm text-orange-600 mt-3 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Please click "Calculate Total" before printing
                </p>
              )}
            </div>
          </div>
        </div>
      

      {/* Printable invoice section */}
      <div className="hidden print:block p-8">
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <div className="mt-2 text-sm">
            <p className="font-semibold">Pharmacy: {user?.pharmacyName || 'Pharmacy'}</p>
            <p>Cashier: {user?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Bill To:</h3>
            <p className="font-medium text-lg">{customer.name}</p>
            {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
          </div>
          <div className="text-right">
            {invoiceNo && (
              <>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="font-bold text-xl text-gray-900">#{invoiceNo}</p>
              </>
            )}
            <p className="text-sm text-gray-600 mt-2">{new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 font-bold border-b border-gray-300">Item Description</th>
                <th className="text-center p-3 font-bold border-b border-gray-300">Qty</th>
                <th className="text-right p-3 font-bold border-b border-gray-300">Unit Price</th>
                <th className="text-right p-3 font-bold border-b border-gray-300">Amount</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((c) => (
                <tr key={`print-${c.medicineId}`} className="border-b border-gray-200">
                  <td className="p-3">{c.medicineName}</td>
                  <td className="p-3 text-center">{c.quantity}</td>
                  <td className="p-3 text-right">Rs. {c.price.toFixed(2)}</td>
                  <td className="p-3 text-right font-semibold">Rs. {(c.price * c.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-80">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Tax ({taxPct}%):</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Discount:</span>
              <span>- Rs. {Number(discount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-100 px-3 mt-2">
              <span className="text-xl font-bold">Total Amount:</span>
              <span className="text-xl font-bold">Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p className="mt-1">This is a computer-generated invoice.</p>
        </div>
      </div>
    </div>
  )
}
