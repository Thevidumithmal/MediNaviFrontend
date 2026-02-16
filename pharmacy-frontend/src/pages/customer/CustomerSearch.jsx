import React, { useEffect, useMemo, useState } from 'react'
import PharmacyList from '../../components/PharmacyList'
import { searchMedicines } from '../../services/medicineService'
import { createOrder } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { showSuccess, showError } from '../../utils/sweetAlert'

export default function CustomerSearch() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [location, setLocation] = useState({ lat: null, lon: null, status: 'idle' })

  const [orderModal, setOrderModal] = useState({ open: false, item: null, qty: 1 })
  const canOrder = useMemo(() => !!user?.id, [user])

  const getLocation = () => {
    setError('')
    if (!navigator.geolocation) {
      setLocation({ lat: null, lon: null, status: 'unsupported' })
      return
    }
    setLocation((s) => ({ ...s, status: 'loading' }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude, status: 'ready' })
      },
      (err) => {
        const status = err?.code === 1
          ? 'denied'
          : err?.code === 3
          ? 'timeout'
          : 'unavailable'
        setLocation({ lat: null, lon: null, status })
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    )
  }

  useEffect(() => {
    // try silently on first open
    getLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = async (e) => {
    e.preventDefault()
    setError('')
    setResults([])
    if (!query.trim()) {
      setError('Please enter a medicine name')
      return
    }

    try {
      setLoading(true)
      const data = await searchMedicines({
        name: query.trim(),
        lat: location.status === 'ready' ? location.lat : null,
        lon: location.status === 'ready' ? location.lon : null
      })
      setResults(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const openOrder = (item) => {
    if (!canOrder) {
      setError('Please login to place orders')
      return
    }
    setOrderModal({ open: true, item, qty: 1 })
  }

  const placeOrder = async () => {
    const item = orderModal.item
    if (!item) return

    // NOTE: Backend order API requires medicineId.
    // If your /medicines/search response does not include medicineId, ordering will be blocked.
    if (!item.medicineId) {
      setError('Ordering needs medicineId from backend. Please update backend /medicines/search to return medicineId.')
      setOrderModal({ open: false, item: null, qty: 1 })
      return
    }

    try {
      setLoading(true)
      await createOrder({
        customerId: user.id,
        pharmacyId: item.pharmacyId,
        items: [{ medicineId: item.medicineId, quantity: Number(orderModal.qty) }]
      })
      setOrderModal({ open: false, item: null, qty: 1 })
      showSuccess('Order placed successfully!')
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Order failed'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Medicine Search</h1>
        <p className="text-gray-600 mt-1">Search and find nearby pharmacies first (when location is available).</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">
            Location: {
              location.status === 'ready' ? 'Ready' :
              location.status === 'loading' ? 'Getting location...' :
              location.status === 'denied' ? 'Denied (showing all pharmacies)' :
              location.status === 'timeout' ? 'Timeout (using all pharmacies)' :
              location.status === 'unavailable' ? 'Unavailable (using all pharmacies)' :
              location.status === 'unsupported' ? 'Not supported' :
              'Not set'
            }
          </span>
          <button className="btn-secondary" type="button" onClick={getLocation}>Refresh Location</button>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

        <form className="mt-4 flex flex-col sm:flex-row gap-2" onSubmit={onSearch}>
          <input className="input flex-1" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., Paracetamol" />
          <button className="btn" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
        </form>
      </div>

      <PharmacyList results={results} onOrder={openOrder} />

      {orderModal.open && orderModal.item && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold">Place Order</h2>
            <p className="text-sm text-gray-600 mt-1">
              {orderModal.item.medicineName} from {orderModal.item.pharmacyName}
            </p>

            <div className="mt-4">
              <label className="text-sm font-medium">Quantity</label>
              <input
                className="input mt-1"
                type="number"
                min={1}
                max={orderModal.item.quantity || 999}
                value={orderModal.qty}
                onChange={(e) => setOrderModal((m) => ({ ...m, qty: e.target.value }))}
              />
              {!orderModal.item.medicineId && (
                <p className="text-xs text-amber-700 mt-2">
                  Ordering requires <span className="font-semibold">medicineId</span> in search response.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setOrderModal({ open: false, item: null, qty: 1 })}>Cancel</button>
              <button className="btn" onClick={placeOrder} disabled={loading || !orderModal.item.medicineId}>Confirm Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
