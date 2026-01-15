import React from 'react'
import MedicineCard from './MedicineCard'

export default function PharmacyList({ results, onOrder }) {
  if (!results || results.length === 0) {
    return (
      <div className="card p-6 text-center text-gray-600">No results found.</div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((item) => (
        <MedicineCard key={`${item.stockId}-${item.pharmacyId}`} item={item} onOrder={onOrder} />
      ))}
    </div>
  )
}
