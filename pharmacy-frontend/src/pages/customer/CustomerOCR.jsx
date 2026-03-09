import React, { useEffect, useMemo, useState } from 'react'
import FileUpload from '../../components/FileUpload'
import PharmacyList from '../../components/PharmacyList'
import { ocrPrescription } from '../../services/aiService'
import { searchMedicines } from '../../services/medicineService'
import { createOrder } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { showSuccess, showError } from '../../utils/sweetAlert'

export default function CustomerOCR() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [location, setLocation] = useState({ lat: null, lon: null, status: 'idle' })
  const [orderModal, setOrderModal] = useState({ open: false, item: null, qty: 1 })
  const canOrder = useMemo(() => !!user?.id, [user])

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation({ lat: null, lon: null, status: 'unsupported' })
      return
    }
    setLocation((s) => ({ ...s, status: 'loading' }))
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude, status: 'ready' }),
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
    getLocation()
  }, [])

  const runOCR = async () => {
    setError('')
    setResults([])
    if (!file) {
      setError('Please choose an image file')
      return
    }

    try {
      setExtracting(true)
      const meds = await ocrPrescription(file)
      const cleaned = (meds || []).map((m) => String(m).trim()).filter(Boolean)
      setMedicines(cleaned)
      if (cleaned.length === 0) setError('No medicine names detected. Try a clearer image.')
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || 'OCR failed. Is FastAPI running on port 8000?')
    } finally {
      setExtracting(false)
    }
  }

  const searchOne = async (name) => {
    setError('')
    try {
      setLoading(true)
      const data = await searchMedicines({
        name,
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

  const searchAll = async () => {
    setError('')
    setResults([])
    if (!medicines || medicines.length === 0) {
      setError('No extracted medicines to search')
      return
    }

    try {
      setLoading(true)
      const all = []
      for (const name of medicines) {
        const data = await searchMedicines({
          name,
          lat: location.status === 'ready' ? location.lat : null,
          lon: location.status === 'ready' ? location.lon : null
        })
        all.push(...data)
      }
      setResults(all)
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
      showError(err?.response?.data?.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Prescription Analysis</h1>
            <p className="text-gray-500 mt-1">Upload your prescription to extract medicine names using AI</p>
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
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Upload Prescription</h2>
        <FileUpload label="Select your prescription image" onFileSelected={setFile} />

        <div className="mt-6 flex flex-wrap gap-3">
          <button 
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
            onClick={runOCR} 
            disabled={loading || extracting || !file}
          >
            {extracting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Extract Medicines
              </>
            )}
          </button>
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2" 
            onClick={searchAll} 
            disabled={loading || extracting || medicines.length === 0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search All Medicines
          </button>
        </div>
      </div>

      {medicines.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2 pb-2 border-b">Extracted Medicines</h2>
          <p className="text-sm text-gray-600 mb-4">Click on any medicine to search for availability at nearby pharmacies</p>
          <div className="flex flex-wrap gap-2">
            {medicines.map((m, idx) => (
              <button 
                key={`${m}-${idx}`}
                className="px-4 py-2 bg-blue-100 text-blue-700 border-2 border-blue-300 rounded-lg hover:bg-blue-200 hover:border-blue-400 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                onClick={() => searchOne(m)} 
                disabled={loading || extracting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Loading Overlay for OCR Extraction */}
      {extracting && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            {/* Animated Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Title and Description */}
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Analyzing Prescription
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Our AI is extracting medicine names from your prescription image...
            </p>

            {/* Progress Bar */}
            <div className="relative mb-4">
              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                <div className="progress-bar-animated shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span>Processing image...</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse animation-delay-200"></div>
                <span>Extracting text data...</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse animation-delay-400"></div>
                <span>Identifying medicines...</span>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-xs text-blue-800 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span><strong>Tip:</strong> For best results, ensure your prescription image is clear and well-lit.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
