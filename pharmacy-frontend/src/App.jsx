import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import HelpPage from './pages/HelpPage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerSearch from './pages/customer/CustomerSearch'
import CustomerOCR from './pages/customer/CustomerOCR'
import CustomerOrders from './pages/customer/CustomerOrders'
import CustomerProfile from './pages/customer/CustomerProfile'
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard'
import PharmacyStock from './pages/pharmacy/PharmacyStock'
import PharmacyOrders from './pages/pharmacy/PharmacyOrders'
import PharmacyPOS from './pages/pharmacy/PharmacyPOS'
import PharmacyInvoices from './pages/pharmacy/PharmacyInvoices'
import PharmacyProfile from './pages/pharmacy/PharmacyProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminReports from './pages/admin/AdminReports'
import AdminPharmacies from './pages/admin/AdminPharmacies'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProfile from './pages/admin/AdminProfile'
import NotFound from './pages/NotFound'
import { useAuth } from './context/AuthContext'
import MedicineChatbot from './components/MedicineChatbot'

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />
  if (role === 'PHARMACY') return <Navigate to="/pharmacy/dashboard" replace />
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  const location = useLocation()
  const { role } = useAuth()
  const hideNavbarPaths = ['/login', '/register', '/forgot-password', '/help']
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-1">
        <div className={shouldHideNavbar ? "" : "max-w-6xl mx-auto px-4 py-6"}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* Customer routes */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/search" element={<CustomerSearch />} />
              <Route path="/customer/ocr" element={<CustomerOCR />} />
              <Route path="/customer/orders" element={<CustomerOrders />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
            </Route>

            {/* Pharmacy routes */}
            <Route element={<ProtectedRoute allowedRoles={['PHARMACY','ADMIN']} />}>
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/stock" element={<PharmacyStock />} />
              <Route path="/pharmacy/orders" element={<PharmacyOrders />} />
              <Route path="/pharmacy/pos" element={<PharmacyPOS />} />
              <Route path="/pharmacy/invoices" element={<PharmacyInvoices />} />
              <Route path="/pharmacy/profile" element={<PharmacyProfile />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/pharmacies" element={<AdminPharmacies />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      
      {/* Medicine Chatbot - Available on all customer pages */}
      {role === 'CUSTOMER' && <MedicineChatbot />}
    </div>
  )
}
