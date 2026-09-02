import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import PrototypeNotice from '../components/PrototypeNotice'
import RiskBadge from '../components/RiskBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function LocationDetails() {
  const { id } = useParams()
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [alertStatus, setAlertStatus] = useState(null) // null | 'sending' | 'success' | 'error'
  const [alertError, setAlertError] = useState(null)

  const fetchLocation = () => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE_URL}/locations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`)
        return res.json()
      })
      .then((data) => setLocation(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(fetchLocation, [id])

  const createAlert = () => {
    setAlertStatus('sending')
    setAlertError(null)
    fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_id: Number(id) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`)
        return res.json()
      })
      .then(() => setAlertStatus('success'))
      .catch((err) => {
        setAlertError(err.message)
        setAlertStatus('error')
      })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PrototypeNotice />
      <Link to="/map" className="text-sm text-navy underline mb-4 inline-block">&larr; Back to Risk Map</Link>

      {loading && <LoadingState message="Loading location details..." />}
      {error && <ErrorState message={error} onRetry={fetchLocation} />}

      {location && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-navy">{location.name}</h1>
              <p className="text-gray-500">{location.state}</p>
            </div>
            <RiskBadge level={location.risk_level} size="lg" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500">Sample rainfall</p>
              <p className="font-semibold">{location.rainfall_mm} mm</p>
            </div>
            <div>
              <p className="text-gray-500">Sample slope</p>
              <p className="font-semibold">{location.slope_degrees}&deg;</p>
            </div>
            <div>
              <p className="text-gray-500">Past landslide</p>
              <p className="font-semibold">{location.past_landslide ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-gray-500">Last updated</p>
              <p className="font-semibold">{new Date(location.last_updated).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-1">Safety recommendation</p>
            <p className="text-sm text-gray-600">{location.safety_recommendation}</p>
          </div>

          <button
            onClick={createAlert}
            disabled={alertStatus === 'sending'}
            className="px-5 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light disabled:opacity-50"
          >
            {alertStatus === 'sending' ? 'Creating alert...' : 'Create Prototype Alert'}
          </button>

          {alertStatus === 'success' && (
            <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              Prototype alert created and saved. (This is a demo record only — no real
              SMS, WhatsApp, or email was sent.)
            </p>
          )}
          {alertStatus === 'error' && (
            <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              Could not create alert: {alertError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
