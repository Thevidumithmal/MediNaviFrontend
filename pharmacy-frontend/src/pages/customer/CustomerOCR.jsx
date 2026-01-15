import React, { useEffect, useState } from 'react'
import FileUpload from '../../components/FileUpload'
import PharmacyList from '../../components/PharmacyList'
import { ocrPrescription } from '../../services/aiService'
import { searchMedicines } from '../../services/medicineService'

export default function CustomerOCR() {
  const [file, setFile] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [location, setLocation] = useState({ lat: null, lon: null, status: 'idle' })

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

      <PharmacyList results={results} />
    </div>
  )
}
