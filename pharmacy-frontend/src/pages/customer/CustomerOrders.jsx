import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { getCustomerOrders } from '../../services/orderService'
import OrderTable from '../../components/OrderTable'

export default function CustomerOrders() {
  const { user } = useAuth()
  const { markAsViewed, checkNotifications } = useNotifications()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  const load = async () => {
    const customerId = user?.customerId ?? user?.id
    if (!customerId) {
      setError('User ID not found. Please login again.')
      return
    }
    // Request all orders by passing a large page size or no pagination params
    // Some backends use 'size', 'limit', or 'pageSize' - try multiple approaches
    const data = await getCustomerOrders(customerId, { size: 1000, limit: 1000 })
    setOrders(data)
    // Reset to first page when orders are loaded/refreshed
    setCurrentPage(1)
  }

  useEffect(() => {
    setError('')
    setLoading(true)
    load().catch((err) => setError(err?.response?.data?.message || 'Failed to load your orders')).finally(() => setLoading(false))
    
    // Mark notifications as viewed when page loads
    markAsViewed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Refresh notifications after refreshing orders
  const handleRefresh = async () => {
    setLoading(true)
    await load().finally(() => setLoading(false))
    await checkNotifications()
  }

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / ordersPerPage)
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-500 mt-1">Track your prescription orders and status updates</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh Orders'}
            </button>
          </div>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm font-medium border-l-4 border-red-600">{error}</div>}
        
        {/* Orders Count */}
        {orders.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
          </div>
        )}
      </div>

      <OrderTable orders={currentOrders} context="customer" />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="text-gray-400">...</span>
                  }
                  return null
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
