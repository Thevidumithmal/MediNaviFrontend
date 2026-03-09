import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function CustomerDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back, {user?.name}!</h1>
            <p className="text-gray-500 mt-1">Manage your prescriptions and orders with ease</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/customer/search" 
            className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition"
          >
            <svg className="w-16 h-16 mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="font-bold text-lg text-gray-800">Search Medicines</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Find medicines at nearby pharmacies</p>
          </Link>

          <Link 
            to="/customer/ocr" 
            className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:border-green-400 hover:shadow-md transition"
          >
            <svg className="w-16 h-16 mb-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-bold text-lg text-gray-800">Prescription Upload</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Upload prescription for medicine extraction</p>
          </Link>

          <Link 
            to="/customer/orders" 
            className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-md transition"
          >
            <svg className="w-16 h-16 mb-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="font-bold text-lg text-gray-800">My Orders</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Track your prescription orders</p>
          </Link>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Key Features
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-800">Smart Medicine Search</p>
                <p className="text-sm text-gray-600">Find medicines by name with real-time availability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-800">AI-Powered Prescription Analysis</p>
                <p className="text-sm text-gray-600">Extract medicine names from prescription images</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-800">Location-Based Results</p>
                <p className="text-sm text-gray-600">See nearby pharmacies first when location is enabled</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-800">Order Tracking</p>
                <p className="text-sm text-gray-600">Monitor your orders from placement to pickup</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Tips & Guides
          </h3>
          <div className="space-y-3">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-sm font-medium text-blue-900">Enable Location Services</p>
              <p className="text-xs text-blue-700 mt-1">Allow location access to find the closest pharmacies with your medicines in stock</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p className="text-sm font-medium text-green-900">Use Prescription Upload</p>
              <p className="text-xs text-green-700 mt-1">Upload a clear photo of your prescription for automatic medicine name extraction</p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
              <p className="text-sm font-medium text-purple-900">Track Your Orders</p>
              <p className="text-xs text-purple-700 mt-1">Check order status and receive notifications when your medicines are ready for pickup</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase font-semibold">Username</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{user?.username || '—'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase font-semibold">Email</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{user?.email || '—'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 uppercase font-semibold">Phone</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{user?.phone || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
