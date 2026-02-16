import React from 'react'

export default function MedicineCard({ item, onOrder }) {
  const distanceLabel = item.distanceKm == null ? '—' : `${Number(item.distanceKm).toFixed(2)} km`

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Pharmacy</p>
          <p className="font-semibold">{item.pharmacyName}</p>
          <p className="text-sm text-gray-600">{item.address || '—'}</p>
          {item.pharmacyPhone && (
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${item.pharmacyPhone}`} className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                {item.pharmacyPhone}
              </a>
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
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
