import React from 'react'

export default function OrderTable({ orders, context = 'pharmacy', onReady, onReject }) {
  if (!orders || orders.length === 0) {
    return <div className="card p-6 text-center text-gray-600">No orders yet.</div>
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">Order #{o.id}</p>
              {context === 'pharmacy' ? (
                <p className="text-sm text-gray-600">Customer: {o.customerName || o.customerId}</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">Pharmacy: {o.pharmacyName || o.pharmacyId}</p>
                  {o.pharmacyPhone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${o.pharmacyPhone}`} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                        {o.pharmacyPhone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold">{o.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-semibold">Rs. {o.totalAmount}</p>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-2">Medicine</th>
                  <th className="text-left p-2">Qty</th>
                  <th className="text-left p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {o.items?.map((it) => (
                  <tr key={`${o.id}-${it.medicineId}`} className="border-t">
                    <td className="p-2">{it.medicineName || it.name || it.medicineId}</td>
                    <td className="p-2">{it.quantity}</td>
                    <td className="p-2">Rs. {it.price ?? it.unitPrice ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {o.statusMessage && (
            <p className="mt-2 text-sm text-gray-700"><span className="font-medium">Message:</span> {o.statusMessage}</p>
          )}

          {context === 'pharmacy' && o.status === 'PENDING' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn" onClick={() => onReady && onReady(o)}>Mark Ready</button>
              <button className="btn-secondary" onClick={() => onReject && onReject(o)}>Reject</button>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500">Created: {o.createdAt}</p>
        </div>
      ))}
    </div>
  )
}
