import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { getPharmacyOrders } from '../../services/pharmacyService'
import { updateOrderStatus } from '../../services/orderService'
import OrderTable from '../../components/OrderTable'
import Swal from 'sweetalert2'

export default function PharmacyOrders() {
  const { pharmacyId } = useAuth()
  const { markAsViewed, checkNotifications } = useNotifications()
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
    
    // Mark notifications as viewed when page loads
    markAsViewed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId])

  // Refresh notifications after handling orders
  const handleRefresh = async () => {
    setLoading(true)
    await load().finally(() => setLoading(false))
    await checkNotifications()
  }

  const markReady = async (order) => {
    const result = await Swal.fire({
      title: 'Mark Order as Ready',
      text: 'Optional message for customer (e.g., pickup counter/time):',
      input: 'text',
      inputValue: 'Ready for pickup',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Mark Ready',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      showLoaderOnConfirm: true,
      preConfirm: async (msg) => {
        try {
          await updateOrderStatus(order.id, { status: 'READY', message: msg || 'Ready for pickup' })
          return true
        } catch (err) {
          Swal.showValidationMessage(err?.response?.data?.message || 'Failed to mark as READY')
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    })

    if (result.isConfirmed) {
      await load()
      await checkNotifications()
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Order marked as ready',
        confirmButtonColor: '#10b981'
      })
    }
  }

  const rejectOrder = async (order) => {
    const result = await Swal.fire({
      title: 'Reject Order',
      text: 'Reason for rejection (required):',
      input: 'text',
      inputValue: 'Out of stock',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Reject Order',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      showLoaderOnConfirm: true,
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Rejection reason is required!'
        }
      },
      preConfirm: async (msg) => {
        try {
          await updateOrderStatus(order.id, { status: 'REJECTED', message: msg.trim() })
          return true
        } catch (err) {
          Swal.showValidationMessage(err?.response?.data?.message || 'Failed to reject order')
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    })

    if (result.isConfirmed) {
      await load()
      await checkNotifications()
      Swal.fire({
        icon: 'success',
        title: 'Order Rejected',
        text: 'Order has been rejected',
        confirmButtonColor: '#10b981'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
            <p className="text-gray-500 mt-1">Track and manage customer prescriptions</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh Orders'}
            </button>
          </div>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm font-medium border-l-4 border-red-600">{error}</div>}
      </div>

      <OrderTable orders={orders} context="pharmacy" onReady={markReady} onReject={rejectOrder} />
    </div>
  )
}
