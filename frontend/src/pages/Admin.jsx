import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config'
import PrototypeNotice from '../components/PrototypeNotice'
import RiskBadge from '../components/RiskBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function Admin() {
  const [locations, setLocations] = useState([])
  const [reports, setReports] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingLocation, setEditingLocation] = useState(null) // location object or null
  const [editForm, setEditForm] = useState({ rainfall_mm: '', slope_degrees: '', past_landslide: false })
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchAll = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      fetch(`${API_BASE_URL}/locations`).then((r) => { if (!r.ok) throw new Error('Failed to load locations'); return r.json() }),
      fetch(`${API_BASE_URL}/reports`).then((r) => { if (!r.ok) throw new Error('Failed to load reports'); return r.json() }),
      fetch(`${API_BASE_URL}/alerts`).then((r) => { if (!r.ok) throw new Error('Failed to load alerts'); return r.json() }),
    ])
      .then(([locs, reps, als]) => {
        setLocations(locs)
        setReports(reps)
        setAlerts(als)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(fetchAll, [])

  const openEdit = (loc) => {
    setEditingLocation(loc)
    setSaveError(null)
    setEditForm({
      rainfall_mm: loc.rainfall_mm,
      slope_degrees: loc.slope_degrees,
      past_landslide: loc.past_landslide,
    })
  }

  const closeEdit = () => setEditingLocation(null)

  const saveEdit = () => {
    setSaving(true)
    setSaveError(null)
    fetch(`${API_BASE_URL}/locations/${editingLocation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfall_mm: Number(editForm.rainfall_mm),
        slope_degrees: Number(editForm.slope_degrees),
        past_landslide: editForm.past_landslide,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.detail || `Server responded with status ${res.status}`)
        }
        return res.json()
      })
      .then((updated) => {
        setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
        setEditingLocation(null)
      })
      .catch((err) => setSaveError(err.message))
      .finally(() => setSaving(false))
  }

  const markReviewed = (reportId) => {
    fetch(`${API_BASE_URL}/reports/${reportId}/review`, { method: 'PUT' })
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`)
        return res.json()
      })
      .then((updated) => {
        setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      })
      .catch((err) => setError(err.message))
  }

  const locationName = (id) => locations.find((l) => l.id === id)?.name || `#${id}`

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <PrototypeNotice />
      <h1 className="text-2xl font-bold text-navy mb-6">Admin</h1>

      {loading && <LoadingState message="Loading admin data..." />}
      {error && <ErrorState message={error} onRetry={fetchAll} />}

      {!loading && !error && (
        <div className="space-y-10">
          {/* Locations table */}
          <section>
            <h2 className="font-semibold text-navy mb-3">Locations</h2>
            {locations.length === 0 ? (
              <p className="text-gray-500 text-sm">No locations found.</p>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">State</th>
                      <th className="px-4 py-3">Rainfall (mm)</th>
                      <th className="px-4 py-3">Slope (&deg;)</th>
                      <th className="px-4 py-3">Past landslide</th>
                      <th className="px-4 py-3">Risk</th>
                      <th className="px-4 py-3">Last updated</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((loc) => (
                      <tr key={loc.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium">{loc.name}</td>
                        <td className="px-4 py-3">{loc.state}</td>
                        <td className="px-4 py-3">{loc.rainfall_mm}</td>
                        <td className="px-4 py-3">{loc.slope_degrees}</td>
                        <td className="px-4 py-3">{loc.past_landslide ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3"><RiskBadge level={loc.risk_level} /></td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(loc.last_updated).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEdit(loc)}
                            className="px-3 py-1.5 bg-navy text-white rounded-lg text-xs font-medium hover:bg-navy-light"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Field reports table */}
          <section>
            <h2 className="font-semibold text-navy mb-3">Field reports</h2>
            {reports.length === 0 ? (
              <p className="text-gray-500 text-sm">No field reports submitted yet.</p>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Reporter</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((rep) => (
                      <tr key={rep.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">{rep.reporter_name}</td>
                        <td className="px-4 py-3">{locationName(rep.location_id)}</td>
                        <td className="px-4 py-3">{rep.report_type}</td>
                        <td className="px-4 py-3">{rep.severity}</td>
                        <td className="px-4 py-3 max-w-xs truncate" title={rep.description}>{rep.description}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rep.status === 'Reviewed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {rep.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(rep.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          {rep.status !== 'Reviewed' && (
                            <button
                              onClick={() => markReviewed(rep.id)}
                              className="px-3 py-1.5 bg-navy text-white rounded-lg text-xs font-medium hover:bg-navy-light"
                            >
                              Mark Reviewed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Alert history */}
          <section>
            <h2 className="font-semibold text-navy mb-3">Alert history</h2>
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No prototype alerts created yet.</p>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Risk at time of alert</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">{locationName(alert.location_id)}</td>
                        <td className="px-4 py-3"><RiskBadge level={alert.risk_level} /></td>
                        <td className="px-4 py-3 max-w-sm truncate" title={alert.message}>{alert.message}</td>
                        <td className="px-4 py-3">{alert.status}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Edit location modal */}
      {editingLocation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="font-semibold text-navy mb-1">Edit {editingLocation.name}</h3>
            <p className="text-xs text-gray-500 mb-4">
              Risk level is recalculated automatically by the backend — you cannot set it directly.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sample rainfall (mm)</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.rainfall_mm}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, rainfall_mm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sample slope (degrees)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={editForm.slope_degrees}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, slope_degrees: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.past_landslide}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, past_landslide: e.target.checked }))}
                />
                Past landslide recorded
              </label>
            </div>

            {saveError && <p className="text-red-600 text-sm mt-3">{saveError}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeEdit} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-light disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save (recalculates risk)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
