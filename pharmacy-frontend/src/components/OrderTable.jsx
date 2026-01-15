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
                <p className="text-sm text-gray-600">Pharmacy: {o.pharmacyName || o.pharmacyId}</p>
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
