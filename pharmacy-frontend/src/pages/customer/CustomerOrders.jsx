import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCustomerOrders } from '../../services/orderService'
import OrderTable from '../../components/OrderTable'

export default function CustomerOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const customerId = user?.customerId ?? user?.id
    if (!customerId) {
      setError('User ID not found. Please login again.')
      return
    }
    const data = await getCustomerOrders(customerId)
    setOrders(data)
  }

  useEffect(() => {
    setError('')
    setLoading(true)
    load().catch((err) => setError(err?.response?.data?.message || 'Failed to load your orders')).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-gray-600 mt-1">Orders you have placed and their current status.</p>

        <div className="mt-4 flex items-center gap-2">
          <button className="btn-secondary" onClick={() => { setLoading(true); load().finally(() => setLoading(false)) }} disabled={loading}>Refresh</button>
          {loading && <span className="text-sm text-gray-600">Loading...</span>}
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
      </div>

      <OrderTable orders={orders} context="customer" />
    </div>
  )
}
