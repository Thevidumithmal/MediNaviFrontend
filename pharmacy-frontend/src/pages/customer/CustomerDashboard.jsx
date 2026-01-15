import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function CustomerDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-gray-600 mt-1">Search medicines by name or upload a prescription.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/customer/search" className="btn">Medicine Search</Link>
          <Link to="/customer/ocr" className="btn-secondary">Prescription OCR</Link>
          <Link to="/customer/orders" className="btn-secondary">My Orders</Link>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Tips</h2>
        <ul className="list-disc ml-5 mt-2 text-gray-600 text-sm space-y-1">
          <li>Allow browser location to see nearby pharmacies first.</li>
          <li>If spelling is wrong, use the OCR page to extract names from your prescription.</li>
        </ul>
      </div>
    </div>
  )
}
