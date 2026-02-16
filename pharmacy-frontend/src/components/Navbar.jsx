import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoSvg from '../assets/logo.svg'

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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const onLogout = () => {
    logout()
    navigate('/login')
    setDropdownOpen(false)
  }

  const goToProfile = () => {
    if (role === 'CUSTOMER') navigate('/customer/profile')
    else if (role === 'PHARMACY') navigate('/pharmacy/profile')
    else if (role === 'ADMIN') navigate('/admin/profile')
    setDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    const names = user.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="border-b bg-white print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80">
          <img src={logoSvg} alt="MediNavi Logo" className="w-8 h-8" />
          <span className="text-blue-600">MediNavi</span>
        </Link>

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
              <NavItem to="/customer/profile">Profile</NavItem>
            </>
          )}

          {isAuthenticated && role === 'PHARMACY' && (
            <>
              <NavItem to="/pharmacy/dashboard">Dashboard</NavItem>
              <NavItem to="/pharmacy/stock">Stock</NavItem>
              <NavItem to="/pharmacy/orders">Orders</NavItem>
              <NavItem to="/pharmacy/profile">Profile</NavItem>
            </>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <>
              <NavItem to="/admin/dashboard">Dashboard</NavItem>
              <NavItem to="/admin/reports">Reports</NavItem>
              <NavItem to="/admin/pharmacies">Pharmacies</NavItem>
              <NavItem to="/admin/users">Users</NavItem>
              <NavItem to="/admin/profile">Profile</NavItem>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* User Avatar Circle */}
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {getUserInitials()}
                </div>
                {/* User Name - hidden on small screens */}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name}
                </span>
                {/* Dropdown Arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {role}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={goToProfile}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View Profile
                    </button>

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500 hidden sm:block">Local demo</span>
          )}
        </div>
      </div>
    </header>
  )
}
