import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}
        `
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { isAuthenticated, role, user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b bg-white print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">AI Pharmacy</Link>

        <nav className="flex items-center gap-2">
          {!isAuthenticated && (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Register</NavItem>
            </>
          )}

          {isAuthenticated && role === 'CUSTOMER' && (
            <>
              <NavItem to="/customer/dashboard">Dashboard</NavItem>
              <NavItem to="/customer/search">Search</NavItem>
              <NavItem to="/customer/ocr">Prescription OCR</NavItem>
            </>
          )}

          {isAuthenticated && role === 'PHARMACY' && (
            <>
              <NavItem to="/pharmacy/dashboard">Dashboard</NavItem>
              <NavItem to="/pharmacy/stock">Stock</NavItem>
              <NavItem to="/pharmacy/orders">Orders</NavItem>
            </>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <>
              <NavItem to="/admin/dashboard">Admin</NavItem>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.name} • <span className="font-medium">{role}</span>
              </span>
              <button className="btn-secondary" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <span className="text-sm text-gray-500 hidden sm:block">Local demo</span>
          )}
        </div>
      </div>
    </header>
  )
}
