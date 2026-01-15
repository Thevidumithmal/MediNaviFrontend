import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPharmacyOrders } from '../../services/pharmacyService'
import { updateOrderStatus } from '../../services/orderService'
import OrderTable from '../../components/OrderTable'

export default function PharmacyOrders() {
  const { pharmacyId } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!pharmacyId) return
    const data = await getPharmacyOrders(pharmacyId)
    setOrders(data)
  }

  useEffect(() => {
    setError('')
    setLoading(true)
    load().catch((err) => setError(err?.response?.data?.message || 'Failed to load orders')).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId])

  const markReady = async (order) => {
    const msg = window.prompt('Optional message for customer (e.g., pickup counter/time):', 'Ready for pickup')
    try {
      setLoading(true)
      await updateOrderStatus(order.id, { status: 'READY', message: msg || 'Ready for pickup' })
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark as READY')
    } finally {
      setLoading(false)
    }
  }

  const rejectOrder = async (order) => {
    const msg = window.prompt('Reason for rejection (required):', 'Out of stock')
    if (!msg || !msg.trim()) return
    try {
      setLoading(true)
      await updateOrderStatus(order.id, { status: 'REJECTED', message: msg.trim() })
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reject order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-600 mt-1">All customer orders for your pharmacy.</p>

        <div className="mt-4 flex items-center gap-2">
          <button className="btn-secondary" onClick={() => { setLoading(true); load().finally(() => setLoading(false)) }} disabled={loading}>Refresh</button>
          {loading && <span className="text-sm text-gray-600">Loading...</span>}
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
      </div>

      <OrderTable orders={orders} context="pharmacy" onReady={markReady} onReject={rejectOrder} />
    </div>
  )
}
