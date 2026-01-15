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
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Invoice History</h1>
        <p className="text-gray-600 mt-1">Search by customer name or phone. Only your pharmacy's invoices are shown.</p>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

        <div className="mt-4 grid sm:grid-cols-4 gap-2">
          <input className="input" placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn" onClick={() => { setLoading(true); load().finally(() => setLoading(false)) }} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
            <button className="btn-secondary" onClick={() => { setQ(''); setDateFrom(''); setDateTo(''); setLoading(true); load().finally(() => setLoading(false)) }}>Reset</button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        {invoices.length === 0 ? (
          <p className="text-center text-gray-600">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-2">Invoice #</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Items</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id ?? inv.invoiceId} className="border-t">
                    <td className="p-2">{inv.invoiceNumber ?? inv.id}</td>
                    <td className="p-2">{inv.customerName}</td>
                    <td className="p-2">{inv.customerPhone}</td>
                    <td className="p-2">{inv.itemCount ?? inv.items?.length ?? '-'}</td>
                    <td className="p-2">Rs. {inv.totalAmount}</td>
                    <td className="p-2">{inv.createdAt}</td>
                    <td className="p-2"><button className="btn-secondary" onClick={() => openDetail(inv)} disabled={detailLoading}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Invoice {detail.invoiceNumber ?? detail.id}</h2>
              <button className="btn-secondary" onClick={() => setDetail(null)}>Close</button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Customer: {detail.customerName} • {detail.customerPhone}</p>
            <p className="text-sm text-gray-600">Cashier: {detail.cashierName}</p>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left p-2">Medicine</th>
                    <th className="text-left p-2">Qty</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items?.map((it, idx) => (
                    <tr key={`${detail.id}-${it.medicineId}-${idx}`} className="border-t">
                      <td className="p-2">{it.medicineName ?? it.medicineId}</td>
                      <td className="p-2">{it.quantity}</td>
                      <td className="p-2">Rs. {it.unitPrice}</td>
                      <td className="p-2">Rs. {it.lineTotal ?? (it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <p className="text-sm">Subtotal: Rs. {detail.subtotal}</p>
              <p className="text-sm">Tax: Rs. {detail.taxAmount}</p>
              <p className="text-sm">Discount: Rs. {detail.discountAmount}</p>
              <p className="text-lg font-bold">Total: Rs. {detail.totalAmount}</p>
              <p className="text-xs text-gray-500 mt-2">Created: {detail.createdAt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
