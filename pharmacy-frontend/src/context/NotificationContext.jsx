import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { getPharmacyOrders } from '../services/pharmacyService'
import { getCustomerOrders } from '../services/orderService'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user, role, pharmacyId, isAuthenticated } = useAuth()
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const getLastViewedKey = () => {
    if (role === 'PHARMACY') return `lastViewed_pharmacy_${pharmacyId}`
    if (role === 'CUSTOMER') return `lastViewed_customer_${user?.id || user?.customerId}`
    return null
  }

  const checkNotifications = async () => {
    if (!isAuthenticated || role === 'ADMIN') {
      setNotificationCount(0)
      return
    }

    try {
      setLoading(true)
      const key = getLastViewedKey()
      const lastViewed = key ? localStorage.getItem(key) : null
      const lastViewedTime = lastViewed ? new Date(lastViewed) : null

      if (role === 'PHARMACY' && pharmacyId) {
        // For pharmacy: count PENDING orders
        const orders = await getPharmacyOrders(pharmacyId)
        const pendingCount = orders?.filter(o => o.status === 'PENDING')?.length || 0
        setNotificationCount(pendingCount)
      } else if (role === 'CUSTOMER') {
        // For customer: count READY or REJECTED orders created/updated after last viewed
        const customerId = user?.customerId ?? user?.id
        if (!customerId) {
          setNotificationCount(0)
          return
        }
        const orders = await getCustomerOrders(customerId)
        
        // Count orders that are READY or REJECTED
        const newNotifications = orders?.filter(o => {
          if (o.status !== 'READY' && o.status !== 'REJECTED') return false
          
          // If never viewed before, show all READY/REJECTED orders
          if (!lastViewedTime) return true
          
          // Check if order was updated after last viewed time
          const orderTime = new Date(o.updatedAt || o.createdAt)
          return orderTime > lastViewedTime
        })?.length || 0
        
        setNotificationCount(newNotifications)
      }
    } catch (err) {
      console.error('Failed to check notifications:', err)
      setNotificationCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsViewed = () => {
    const key = getLastViewedKey()
    if (key) {
      localStorage.setItem(key, new Date().toISOString())
      setNotificationCount(0)
    }
  }

  // Check notifications on mount and when user/role changes
  useEffect(() => {
    checkNotifications()
    
    // Set up polling every 30 seconds
    const interval = setInterval(checkNotifications, 30000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, role, pharmacyId, isAuthenticated])

  const value = {
    notificationCount,
    loading,
    checkNotifications,
    markAsViewed
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
