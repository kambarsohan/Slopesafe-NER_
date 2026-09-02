import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { API_BASE_URL } from '../config'
import PrototypeNotice from '../components/PrototypeNotice'
import SummaryCard from '../components/SummaryCard'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

const RISK_COLORS = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = () => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE_URL}/dashboard-summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`)
        return res.json()
      })
      .then((data) => setSummary(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(fetchSummary, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <PrototypeNotice />

      {loading && <LoadingState message="Loading dashboard..." />}
      {error && <ErrorState message={error} onRetry={fetchSummary} />}

      {summary && (
        <>
          <div className="flex flex-wrap gap-4 mb-8">
            <SummaryCard label="High-Risk Locations" value={summary.high_risk_count} accentClass="text-risk-high" />
            <SummaryCard label="Medium-Risk Locations" value={summary.medium_risk_count} accentClass="text-risk-medium" />
            <SummaryCard label="Field Reports Received" value={summary.field_reports_count} accentClass="text-navy" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rainfall vs risk chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="font-semibold text-navy mb-4">Sample rainfall by location, colored by risk</h2>
              {summary.rainfall_chart_data.length === 0 ? (
                <p className="text-gray-500 text-sm">No location data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summary.rainfall_chart_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={70} />
                    <YAxis label={{ value: 'Rainfall (mm, sample)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                    <Tooltip formatter={(value, name, props) => [`${value} mm`, `Risk: ${props.payload.risk_level}`]} />
                    <Bar dataKey="rainfall_mm">
                      {summary.rainfall_chart_data.map((entry, index) => (
                        <Cell key={index} fill={RISK_COLORS[entry.risk_level] || '#999'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Latest alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="font-semibold text-navy mb-4">Latest alerts</h2>
              {summary.latest_alerts.length === 0 ? (
                <p className="text-gray-500 text-sm">No prototype alerts have been created yet.</p>
              ) : (
                <ul className="space-y-3">
                  {summary.latest_alerts.map((alert) => (
                    <li key={alert.id} className="border-b border-gray-100 pb-3 last:border-0">
                      <p className="text-sm text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* How the prototype calculates risk */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mt-6">
            <h2 className="font-semibold text-navy mb-3">How this prototype calculates risk</h2>
            <p className="text-sm text-gray-600 mb-3">
              This is a transparent, rule-based calculation — not a machine learning model. Whenever
              a location's sample rainfall, slope, or past-landslide flag changes, the backend re-runs
              these rules automatically:
            </p>
            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
              <li><strong>High</strong> — sample rainfall ≥ 100mm AND slope ≥ 30°, OR a past landslide is recorded AND rainfall ≥ 90mm.</li>
              <li><strong>Medium</strong> — exactly one major warning indicator is present (high rainfall, high slope, or a past landslide).</li>
              <li><strong>Low</strong> — none of the above indicators are present.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
