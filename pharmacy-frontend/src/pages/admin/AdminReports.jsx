import React, { useEffect, useState } from 'react'
import { getAdminStats } from '../../services/adminService'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AdminReports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detailModal, setDetailModal] = useState({ open: false, title: '', data: [] })

  useEffect(() => {
    loadData()
  }, [])

  // Normalize data to handle case-insensitive duplicates
  const normalizeByField = (data, field, additionalSumFields = []) => {
    if (!data || !Array.isArray(data)) return data

    const normalized = {}
    
    data.forEach(item => {
      const key = item[field]
      if (!key) return
      
      const lowerKey = String(key).toLowerCase()
      
      if (!normalized[lowerKey]) {
        // First occurrence - use proper case (capitalize first letter)
        normalized[lowerKey] = {
          ...item,
          [field]: String(key).charAt(0).toUpperCase() + String(key).slice(1).toLowerCase()
        }
      } else {
        // Merge with existing entry - sum numeric fields
        normalized[lowerKey].count = (normalized[lowerKey].count || 0) + (item.count || 0)
        
        // Sum additional fields if specified
        additionalSumFields.forEach(sumField => {
          if (item[sumField] !== undefined) {
            normalized[lowerKey][sumField] = (normalized[lowerKey][sumField] || 0) + (item[sumField] || 0)
          }
        })
      }
    })

    return Object.values(normalized)
  }

  const loadData = async () => {
    setError('')
    try {
      setLoading(true)
      const statsRes = await getAdminStats().catch(() => null)
      
      // Normalize data to handle case-insensitive duplicates
      if (statsRes) {
        if (statsRes.pharmaciesByRegion) {
          statsRes.pharmaciesByRegion = normalizeByField(statsRes.pharmaciesByRegion, 'region')
        }
        if (statsRes.topMedicines) {
          statsRes.topMedicines = normalizeByField(statsRes.topMedicines, 'name', ['totalStock', 'pharmacyCount'])
        }
        if (statsRes.usersByRole) {
          statsRes.usersByRole = normalizeByField(statsRes.usersByRole, 'role')
        }
      }
      
      setStats(statsRes)
    } catch (err) {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const showDetails = (title, data) => {
    setDetailModal({ open: true, title, data })
  }

  // Format column headers to proper title case
  const formatColumnHeader = (key) => {
    // Convert camelCase to Title Case
    const result = key.replace(/([A-Z])/g, ' $1')
    return result.charAt(0).toUpperCase() + result.slice(1)
  }

  // Color palette for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Overview of system performance and statistics</p>
        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.activeUsers || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total Pharmacies</p>
            <p className="text-2xl font-bold mt-1">{stats.totalPharmacies || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total Medicines</p>
            <p className="text-2xl font-bold mt-1">{stats.totalMedicines || 0}</p>
          </div>
        </div>
      )}

      {/* Active Users by Role Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Users by Role</h2>
          {stats?.usersByRole && (
            <button className="btn-secondary" onClick={() => showDetails('Users by Role', stats.usersByRole)}>
              View Details
            </button>
          )}
        </div>
        <div className="h-80 flex items-center justify-center">
          {stats?.usersByRole && stats.usersByRole.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, count, percent }) => `${role}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="role"
                >
                  {stats.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} users`, props.payload.role]} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${entry.payload.role}: ${entry.payload.count}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>

      {/* Pharmacies by Status Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pharmacies Overview</h2>
          {stats?.pharmaciesByRegion && (
            <button className="btn-secondary" onClick={() => showDetails('Pharmacies by Region', stats.pharmaciesByRegion)}>
              View Details
            </button>
          )}
        </div>
        <div className="h-80 flex items-center justify-center">
          {stats?.pharmaciesByRegion && stats.pharmaciesByRegion.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.pharmaciesByRegion} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="region" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Region', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`${value} pharmacies`, 'Count']}
                />
                <Bar 
                  dataKey="count" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>

      {/* Top Medicines Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Top Available Medicines</h2>
          {stats?.topMedicines && (
            <button className="btn-secondary" onClick={() => showDetails('Top Medicines', stats.topMedicines)}>
              View Details
            </button>
          )}
        </div>
        <div className="h-96 flex items-center justify-center">
          {stats?.topMedicines && stats.topMedicines.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.topMedicines} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Total Stock', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  width={90}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value, name, props) => [
                    `Stock: ${value}`,
                    `${props.payload.pharmacyCount} pharmacies`
                  ]}
                />
                <Bar 
                  dataKey="totalStock" 
                  fill="#8b5cf6" 
                  radius={[0, 8, 8, 0]}
                  animationDuration={1500}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold">{detailModal.title}</h2>
            <div className="mt-4">
              {detailModal.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        {Object.keys(detailModal.data[0]).map((key) => (
                          <th key={key} className="pb-2 font-medium text-gray-700">{formatColumnHeader(key)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detailModal.data.map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          {Object.values(row).map((val, i) => (
                            <td key={i} className="py-2">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No data to display</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button className="btn-danger" onClick={() => setDetailModal({ open: false, title: '', data: [] })}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
