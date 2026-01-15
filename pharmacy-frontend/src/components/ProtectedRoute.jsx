import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // redirect to role dashboard
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />
    if (role === 'PHARMACY') return <Navigate to="/pharmacy/dashboard" replace />
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
