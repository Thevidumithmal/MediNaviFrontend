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
      setLoading(true)
      const meds = await ocrPrescription(file)
      const cleaned = (meds || []).map((m) => String(m).trim()).filter(Boolean)
      setMedicines(cleaned)
      if (cleaned.length === 0) setError('No medicine names detected. Try a clearer image.')
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || 'OCR failed. Is FastAPI running on port 8000?')
    } finally {
      setLoading(false)
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
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Prescription OCR</h1>
        <p className="text-gray-600 mt-1">Upload a prescription image to extract medicine names using the AI service.</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">
            Location: {
              location.status === 'ready' ? 'Ready' :
              location.status === 'loading' ? 'Getting...' :
              location.status === 'denied' ? 'Denied (all pharmacies)' :
              location.status === 'timeout' ? 'Timeout (all pharmacies)' :
              location.status === 'unavailable' ? 'Unavailable (all pharmacies)' :
              location.status === 'unsupported' ? 'Not supported' :
              'Not set'
            }
          </span>
          <button className="btn-secondary" type="button" onClick={getLocation}>Refresh Location</button>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

        <div className="mt-4">
          <FileUpload label="Upload prescription image" onFileSelected={setFile} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn" onClick={runOCR} disabled={loading}>{loading ? 'Processing...' : 'Extract Medicines'}</button>
          <button className="btn-secondary" onClick={searchAll} disabled={loading || medicines.length === 0}>Search All Medicines</button>
        </div>
      </div>

      {medicines.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold">Extracted Medicines</h2>
          <p className="text-sm text-gray-600 mt-1">Click a medicine to search availability.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {medicines.map((m) => (
              <button key={m} className="btn-secondary" onClick={() => searchOne(m)} disabled={loading}>{m}</button>
            ))}
          </div>
        </div>
      )}

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
