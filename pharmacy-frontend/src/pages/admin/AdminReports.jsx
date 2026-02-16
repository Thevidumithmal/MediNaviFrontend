import React, { useEffect, useState } from 'react'
import { getAdminStats } from '../../services/adminService'

export default function AdminReports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detailModal, setDetailModal] = useState({ open: false, title: '', data: [] })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setError('')
    try {
      setLoading(true)
      const statsRes = await getAdminStats().catch(() => null)
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
        <div className="h-64 flex items-end gap-4">
          {stats?.usersByRole && stats.usersByRole.length > 0 ? (
            stats.usersByRole.map((item, idx) => {
              const maxCount = Math.max(...stats.usersByRole.map((d) => d.count || 0))
              const height = maxCount > 0 ? ((item.count || 0) / maxCount) * 100 : 0
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t cursor-pointer hover:bg-blue-600 transition"
                    style={{ height: `${height}%`, minHeight: item.count > 0 ? '20px' : '0' }}
                    onClick={() => showDetails('Users by Role', stats.usersByRole)}
                    title={`${item.role}: ${item.count} users`}
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center font-medium">{item.role}</p>
                  <p className="text-sm font-bold text-gray-800">{item.count}</p>
                </div>
              )
            })
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
        <div className="h-64 flex items-end gap-4">
          {stats?.pharmaciesByRegion && stats.pharmaciesByRegion.length > 0 ? (
            stats.pharmaciesByRegion.map((item, idx) => {
              const maxCount = Math.max(...stats.pharmaciesByRegion.map((d) => d.count || 0))
              const height = maxCount > 0 ? ((item.count || 0) / maxCount) * 100 : 0
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-emerald-500 rounded-t cursor-pointer hover:bg-emerald-600 transition"
                    style={{ height: `${height}%`, minHeight: item.count > 0 ? '20px' : '0' }}
                    onClick={() => showDetails('Pharmacies by Region', stats.pharmaciesByRegion)}
                    title={`${item.region || 'Unknown'}: ${item.count} pharmacies`}
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center font-medium">{item.region || 'Unknown'}</p>
                  <p className="text-sm font-bold text-gray-800">{item.count}</p>
                </div>
              )
            })
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
        <div className="space-y-3">
          {stats?.topMedicines && stats.topMedicines.length > 0 ? (
            stats.topMedicines.map((medicine, idx) => {
              const maxStock = Math.max(...stats.topMedicines.map((m) => m.totalStock || 0))
              const width = maxStock > 0 ? ((medicine.totalStock || 0) / maxStock) * 100 : 0
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 text-gray-500 text-sm font-medium">{idx + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{medicine.name || 'Unknown'}</p>
                    <div className="mt-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-purple-500 cursor-pointer hover:bg-purple-600 transition flex items-center justify-end px-2"
                        style={{ width: `${width}%`, minWidth: medicine.totalStock > 0 ? '40px' : '0' }}
                        onClick={() => showDetails('Top Medicines', stats.topMedicines)}
                      >
                        <span className="text-xs text-white font-medium">{medicine.totalStock || 0}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{medicine.pharmacyCount || 0} pharmacies</p>
                  </div>
                </div>
              )
            })
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
                          <th key={key} className="pb-2 font-medium">{key}</th>
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
              <button className="btn-secondary" onClick={() => setDetailModal({ open: false, title: '', data: [] })}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
