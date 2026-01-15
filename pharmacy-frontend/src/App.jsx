import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerSearch from './pages/customer/CustomerSearch'
import CustomerOCR from './pages/customer/CustomerOCR'
import CustomerOrders from './pages/customer/CustomerOrders'
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard'
import PharmacyStock from './pages/pharmacy/PharmacyStock'
import PharmacyOrders from './pages/pharmacy/PharmacyOrders'
import PharmacyPOS from './pages/pharmacy/PharmacyPOS'
import PharmacyInvoices from './pages/pharmacy/PharmacyInvoices'
import AdminDashboard from './pages/admin/AdminDashboard'
import NotFound from './pages/NotFound'
import { useAuth } from './context/AuthContext'

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />
  if (role === 'PHARMACY') return <Navigate to="/pharmacy/dashboard" replace />
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer routes */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/search" element={<CustomerSearch />} />
              <Route path="/customer/ocr" element={<CustomerOCR />} />
              <Route path="/customer/orders" element={<CustomerOrders />} />
            </Route>

            {/* Pharmacy routes */}
            <Route element={<ProtectedRoute allowedRoles={['PHARMACY','ADMIN']} />}>
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/stock" element={<PharmacyStock />} />
              <Route path="/pharmacy/orders" element={<PharmacyOrders />} />
              <Route path="/pharmacy/pos" element={<PharmacyPOS />} />
              <Route path="/pharmacy/invoices" element={<PharmacyInvoices />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
