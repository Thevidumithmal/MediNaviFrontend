import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPharmacyOrders, getPharmacyStock } from '../../services/pharmacyService'

export default function PharmacyDashboard() {
  const { user, pharmacyId } = useAuth()
  const [stats, setStats] = useState({ stockCount: 0, orderCount: 0 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setError('')
      setLoading(true)
      if (!pharmacyId) {
        setError('No pharmacyId found. Login with a pharmacy account.')
        setLoading(false)
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
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pharmacyId])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm font-medium border-l-4 border-red-600">{error}</div>}
      </div>

      {/* Statistics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Inventory Items</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{loading ? '...' : stats.stockCount}</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Total Orders</p>
              <p className="text-4xl font-bold text-green-900 mt-2">{loading ? '...' : stats.orderCount}</p>
            </div>
            <div className="text-green-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Status</p>
              <p className="text-lg font-bold text-purple-900 mt-2">Active</p>
            </div>
            <div className="text-purple-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Pharmacy Name</p>
              <p className="text-lg font-bold text-orange-900 mt-2">{user?.pharmacyName || 'Pharmacy'}</p>
            </div>
            <div className="text-orange-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/pharmacy/pos" 
            className="flex items-center p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
          >
            <div className="mr-4">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">Point of Sale</p>
              <p className="text-sm text-blue-100">Process transactions</p>
            </div>
          </Link>

          <Link 
            to="/pharmacy/stock" 
            className="flex items-center p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-md"
          >
            <div className="mr-4">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">Manage Inventory</p>
              <p className="text-sm text-green-100">Update stock levels</p>
            </div>
          </Link>

          <Link 
            to="/pharmacy/orders" 
            className="flex items-center p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition shadow-md"
          >
            <div className="mr-4">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">View Orders</p>
              <p className="text-sm text-purple-100">Track customer orders</p>
            </div>
          </Link>

          <Link 
            to="/pharmacy/invoices" 
            className="flex items-center p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition shadow-md"
          >
            <div className="mr-4">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">Invoice History</p>
              <p className="text-sm text-amber-100">View past invoices</p>
            </div>
          </Link>

          <Link 
            to="/pharmacy/profile" 
            className="flex items-center p-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition shadow-md"
          >
            <div className="mr-4">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">Profile Settings</p>
              <p className="text-sm text-gray-100">Manage your account</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
