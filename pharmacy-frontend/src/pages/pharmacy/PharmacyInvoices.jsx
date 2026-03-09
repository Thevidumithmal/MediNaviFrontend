import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPharmacyInvoices, getInvoiceDetail } from '../../services/pharmacyService'

export default function PharmacyInvoices() {
  const { pharmacyId } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [q, setQ] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [invoices, setInvoices] = useState([])
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = async () => {
    if (!pharmacyId) return
    const params = {}
    if (q.trim()) params.q = q.trim()
    if (dateFrom) params.dateFrom = dateFrom
    if (dateTo) params.dateTo = dateTo
    const data = await getPharmacyInvoices(pharmacyId, params)
    setInvoices(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    setError('')
    setLoading(true)
    load().catch((err) => setError(err?.response?.data?.message || 'Failed to load invoices')).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId])

  const openDetail = async (inv) => {
    setDetail(null)
    try {
      setDetailLoading(true)
      const d = await getInvoiceDetail(pharmacyId, inv.id ?? inv.invoiceId)
      setDetail(d)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load invoice detail')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoice History</h1>
            <p className="text-gray-500 mt-1">Search and view transaction records</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm font-medium border-l-4 border-red-600">{error}</div>}

        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid sm:grid-cols-4 gap-3">
            <input 
              className="input" 
              placeholder="Search by name or phone" 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
            <input 
              className="input" 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From date"
            />
            <input 
              className="input" 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To date"
            />
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex-1 flex items-center justify-center gap-2" 
                onClick={() => { setLoading(true); load().finally(() => setLoading(false)) }} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>
              <button 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center" 
                onClick={() => { setQ(''); setDateFrom(''); setDateTo(''); setLoading(true); load().finally(() => setLoading(false)) }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Transaction Records</h2>
        {invoices.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No invoices found. Try adjusting your search filters.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left p-3 font-semibold">Invoice #</th>
                  <th className="text-left p-3 font-semibold">Customer</th>
                  <th className="text-left p-3 font-semibold">Phone</th>
                  <th className="text-center p-3 font-semibold">Items</th>
                  <th className="text-right p-3 font-semibold">Total</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-center p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {invoices.map((inv) => (
                  <tr key={inv.id ?? inv.invoiceId} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium text-blue-600">#{inv.invoiceNumber ?? inv.id}</td>
                    <td className="p-3 font-medium text-gray-800">{inv.customerName}</td>
                    <td className="p-3 text-gray-600">{inv.customerPhone}</td>
                    <td className="p-3 text-center">{inv.itemCount ?? inv.items?.length ?? '-'}</td>
                    <td className="p-3 text-right font-semibold text-gray-800">Rs. {inv.totalAmount}</td>
                    <td className="p-3 text-gray-600">{inv.createdAt}</td>
                    <td className="p-3 text-center">
                      <button 
                        className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium" 
                        onClick={() => openDetail(inv)} 
                        disabled={detailLoading}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Invoice #{detail.invoiceNumber ?? detail.id}</h2>
                <p className="text-sm text-gray-600 mt-1">{detail.createdAt}</p>
              </div>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium" 
                onClick={() => setDetail(null)}
              >
                ✕ Close
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Customer Information</h3>
              <p className="text-sm"><span className="font-medium">Name:</span> {detail.customerName}</p>
              <p className="text-sm"><span className="font-medium">Phone:</span> {detail.customerPhone}</p>
              <p className="text-sm"><span className="font-medium">Cashier:</span> {detail.cashierName}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Items Purchased</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 font-semibold">Medicine</th>
                      <th className="text-center p-3 font-semibold">Qty</th>
                      <th className="text-right p-3 font-semibold">Unit Price</th>
                      <th className="text-right p-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {detail.items?.map((it, idx) => (
                      <tr key={`${detail.id}-${it.medicineId}-${idx}`} className="border-t">
                        <td className="p-3 font-medium">{it.medicineName ?? it.medicineId}</td>
                        <td className="p-3 text-center">{it.quantity}</td>
                        <td className="p-3 text-right">Rs. {it.unitPrice}</td>
                        <td className="p-3 text-right font-semibold">Rs. {it.lineTotal ?? (it.unitPrice * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">Rs. {detail.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Tax:</span>
                  <span className="text-gray-900 font-semibold">Rs. {detail.taxAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Discount:</span>
                  <span className="text-gray-900 font-semibold">- Rs. {detail.discountAmount}</span>
                </div>
                <div className="border-t-2 border-blue-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">Rs. {detail.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
