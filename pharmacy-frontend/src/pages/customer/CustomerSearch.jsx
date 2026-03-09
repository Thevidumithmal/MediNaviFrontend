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
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Medicine Search</h1>
            <p className="text-gray-500 mt-1">Find medicines at nearby pharmacies</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm font-medium border-l-4 border-red-600">{error}</div>}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Location Services</h2>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2" 
            type="button" 
            onClick={getLocation}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Refresh Location
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0"
                 style={{backgroundColor: location.status === 'ready' ? '#10b981' : 
                                        location.status === 'loading' ? '#3b82f6' : '#ef4444'}}>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Location Status</p>
              <p className="text-sm text-gray-600">
                {location.status === 'ready' ? 'Location enabled - finding nearby pharmacies' :
                 location.status === 'loading' ? 'Getting your location...' :
                 location.status === 'denied' ? 'Location access denied - showing all pharmacies' :
                 location.status === 'timeout' ? 'Location timeout - showing all pharmacies' :
                 location.status === 'unavailable' ? 'Location unavailable - showing all pharmacies' :
                 location.status === 'unsupported' ? 'Location not supported by browser' :
                 'Location not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Search Medicines</h2>
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={onSearch}>
          <input 
            className="input flex-1" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Enter medicine name (e.g., Paracetamol)"
          />
          <button 
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2" 
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </>
            )}
          </button>
        </form>
      </div>

      <PharmacyList results={results} onOrder={openOrder} />

      {orderModal.open && orderModal.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800">Place Order</h2>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">{orderModal.item.medicineName}</span> from <span className="font-semibold">{orderModal.item.pharmacyName}</span>
            </p>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700">Quantity <span className="text-red-600">*</span></label>
              <input
                className="input mt-1"
                type="number"
                min={1}
                max={orderModal.item.quantity || 999}
                value={orderModal.qty}
                onChange={(e) => setOrderModal((m) => ({ ...m, qty: e.target.value }))}
              />
              {!orderModal.item.medicineId && (
                <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Ordering requires <span className="font-semibold">medicineId</span> in search response.</span>
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium" 
                onClick={() => setOrderModal({ open: false, item: null, qty: 1 })}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2" 
                onClick={placeOrder} 
                disabled={loading || !orderModal.item.medicineId}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
