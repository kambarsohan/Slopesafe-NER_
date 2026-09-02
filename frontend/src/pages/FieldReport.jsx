import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config'
import PrototypeNotice from '../components/PrototypeNotice'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

const REPORT_TYPES = [
  'Road blockage',
  'Slope crack',
  'Water seepage',
  'Debris flow',
  'Landslide observed',
  'Other',
]
const SEVERITY_LEVELS = ['Low', 'Medium', 'High']

const EMPTY_FORM = {
  reporter_name: '',
  phone_optional: '',
  location_id: '',
  report_type: '',
  severity: '',
  description: '',
  image_url_optional: '',
}

export default function FieldReport() {
  const [locations, setLocations] = useState([])
  const [locationsError, setLocationsError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitStatus, setSubmitStatus] = useState(null) // null | 'submitting' | 'success' | 'error'
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/locations`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`)
        return res.json()
      })
      .then((data) => setLocations(data))
      .catch((err) => setLocationsError(err.message))
  }, [])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const validate = () => {
    const errors = {}
    if (!form.reporter_name.trim()) errors.reporter_name = 'Your name is required.'
    if (!form.location_id) errors.location_id = 'Please choose a location.'
    if (!form.report_type) errors.report_type = 'Please choose a report type.'
    if (!form.severity) errors.severity = 'Please choose a severity.'
    if (!form.description.trim()) errors.description = 'Please describe what you observed.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitStatus('submitting')
    setSubmitError(null)

    fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporter_name: form.reporter_name,
        phone_optional: form.phone_optional || null,
        location_id: Number(form.location_id),
        report_type: form.report_type,
        severity: form.severity,
        description: form.description,
        image_url_optional: form.image_url_optional || null,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.detail || `Server responded with status ${res.status}`)
        }
        return res.json()
      })
      .then(() => {
        setSubmitStatus('success')
        setForm(EMPTY_FORM)
      })
      .catch((err) => {
        setSubmitError(err.message)
        setSubmitStatus('error')
      })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PrototypeNotice />
      <h1 className="text-2xl font-bold text-navy mb-1">Field Report Prototype</h1>
      <p className="text-gray-500 text-sm mb-6">
        Submit what you've observed on the ground. This demo does not verify reports automatically —
        an admin reviews them on the Admin page.
      </p>

      {locationsError && <ErrorState message={locationsError} />}

      {submitStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          Report submitted successfully. Thank you — it will appear in the Admin page for review.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reporter name *</label>
          <input
            type="text"
            value={form.reporter_name}
            onChange={handleChange('reporter_name')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          />
          {fieldErrors.reporter_name && <p className="text-red-600 text-xs mt-1">{fieldErrors.reporter_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone number (optional)</label>
          <input
            type="tel"
            value={form.phone_optional}
            onChange={handleChange('phone_optional')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <select
            value={form.location_id}
            onChange={handleChange('location_id')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          >
            <option value="">Select a location...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}, {loc.state}</option>
            ))}
          </select>
          {fieldErrors.location_id && <p className="text-red-600 text-xs mt-1">{fieldErrors.location_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report type *</label>
          <select
            value={form.report_type}
            onChange={handleChange('report_type')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          >
            <option value="">Select a type...</option>
            {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {fieldErrors.report_type && <p className="text-red-600 text-xs mt-1">{fieldErrors.report_type}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
          <div className="flex gap-3">
            {SEVERITY_LEVELS.map((level) => (
              <label key={level} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="severity"
                  value={level}
                  checked={form.severity === level}
                  onChange={handleChange('severity')}
                />
                {level}
              </label>
            ))}
          </div>
          {fieldErrors.severity && <p className="text-red-600 text-xs mt-1">{fieldErrors.severity}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={handleChange('description')}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          />
          {fieldErrors.description && <p className="text-red-600 text-xs mt-1">{fieldErrors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input
            type="url"
            value={form.image_url_optional}
            onChange={handleChange('image_url_optional')}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          />
        </div>

        {submitStatus === 'error' && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            Could not submit report: {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitStatus === 'submitting'}
          className="w-full px-5 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light disabled:opacity-50"
        >
          {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}
