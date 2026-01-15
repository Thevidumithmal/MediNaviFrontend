import React from 'react'

export default function MedicineCard({ item, onOrder }) {
  const distanceLabel = item.distanceKm == null ? '—' : `${Number(item.distanceKm).toFixed(2)} km`

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Pharmacy</p>
          <p className="font-semibold">{item.pharmacyName}</p>
          <p className="text-sm text-gray-600">{item.address || '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Distance</p>
          <p className="font-semibold">{distanceLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-sm text-gray-500">Medicine</p>
          <p className="font-medium">{item.medicineName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Stock</p>
          <p className={`font-semibold ${item.quantity > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{item.quantity}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="font-semibold">{item.price != null ? `Rs. ${item.price}` : '—'}</p>
        </div>
      </div>

      {onOrder && (
        <div className="pt-2">
          <button className="btn" disabled={!item.quantity || item.quantity <= 0} onClick={() => onOrder(item)}>
            Order from this pharmacy
          </button>
        </div>
      )}
    </div>
  )
}
