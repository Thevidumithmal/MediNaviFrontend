import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPharmacyOrders, getPharmacyStock } from '../../services/pharmacyService'

export default function PharmacyDashboard() {
  const { user, pharmacyId } = useAuth()
  const [stats, setStats] = useState({ stockCount: 0, orderCount: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setError('')
      if (!pharmacyId) {
        setError('No pharmacyId found. Login with a pharmacy account.')
        return
      }
      try {
        const [stock, orders] = await Promise.all([
          getPharmacyStock(pharmacyId),
          getPharmacyOrders(pharmacyId)
        ])
        setStats({ stockCount: stock?.length || 0, orderCount: orders?.length || 0 })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard')
      }
    }
    load()
  }, [pharmacyId])

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Pharmacy Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-600">Stock Items</p>
            <p className="text-3xl font-bold">{stats.stockCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Orders Received</p>
            <p className="text-3xl font-bold">{stats.orderCount}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Next</h2>
        <ul className="list-disc ml-5 mt-2 text-gray-600 text-sm space-y-1">
          <li>Add or update your medicine stock from the Stock page.</li>
          <li>Monitor customer orders from the Orders page.</li>
          <li>Use the POS to bill walk-in customers and print invoices.</li>
        </ul>
        <div className="mt-3">
          <Link to="/pharmacy/pos" className="btn">Open POS & Invoice</Link>
          <Link to="/pharmacy/invoices" className="btn-secondary ml-2">Invoice History</Link>
        </div>
      </div>
    </div>
  )
}
