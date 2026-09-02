import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import PrototypeNotice from '../components/PrototypeNotice'
import RiskBadge from '../components/RiskBadge'
import RiskLegend from '../components/RiskLegend'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

const RISK_MARKER_COLORS = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }

// Roughly centers the map over North East India
const NER_CENTER = [25.8, 92.5]

export default function RiskMap() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stateFilter, setStateFilter] = useState('All')
  const [riskFilter, setRiskFilter] = useState('All')
  const navigate = useNavigate()

  const fetchLocations = () => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE_URL}/locations`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`)
        return res.json()
      })
      .then((data) => setLocations(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(fetchLocations, [])

  const states = useMemo(
    () => ['All', ...new Set(locations.map((l) => l.state))].sort(),
    [locations]
  )

  const filtered = locations.filter((l) => {
    const stateMatch = stateFilter === 'All' || l.state === stateFilter
    const riskMatch = riskFilter === 'All' || l.risk_level === riskFilter
    return stateMatch && riskMatch
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <PrototypeNotice />

      <div className="flex flex-wrap gap-4 items-end justify-between mb-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by state</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by risk level</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {['All', 'High', 'Medium', 'Low'].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <RiskLegend />
      </div>

      {loading && <LoadingState message="Loading map data..." />}
      {error && <ErrorState message={error} onRetry={fetchLocations} />}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          No locations match the selected filters.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <MapContainer center={NER_CENTER} zoom={7} className="leaflet-map-container">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((loc) => (
              <CircleMarker
                key={loc.id}
                center={[loc.latitude, loc.longitude]}
                radius={12}
                pathOptions={{
                  color: RISK_MARKER_COLORS[loc.risk_level] || '#666',
                  fillColor: RISK_MARKER_COLORS[loc.risk_level] || '#666',
                  fillOpacity: 0.8,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-navy">{loc.name}, {loc.state}</p>
                    <p>Sample rainfall: {loc.rainfall_mm} mm</p>
                    <p>Sample slope: {loc.slope_degrees}&deg;</p>
                    <p>Past landslide: {loc.past_landslide ? 'Yes' : 'No'}</p>
                    <div className="my-1"><RiskBadge level={loc.risk_level} /></div>
                    <p className="text-xs text-gray-600">{loc.safety_recommendation}</p>
                    <button
                      onClick={() => navigate(`/locations/${loc.id}`)}
                      className="mt-2 px-3 py-1.5 bg-navy text-white rounded-lg text-xs font-medium hover:bg-navy-light"
                    >
                      View location details
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
