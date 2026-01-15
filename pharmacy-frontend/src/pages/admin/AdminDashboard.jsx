import React from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600 mt-1">Welcome, {user?.name}. This demo dashboard can be extended with admin features.</p>
      <ul className="list-disc ml-5 mt-4 text-sm text-gray-600 space-y-1">
        <li>View all users</li>
        <li>Manage pharmacies</li>
        <li>Reports & analytics</li>
      </ul>
    </div>
  )
}
