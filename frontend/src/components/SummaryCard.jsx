// A single stat card used on the Dashboard (e.g. "3 High-Risk Locations")
export default function SummaryCard({ label, value, accentClass = 'text-navy' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-1 min-w-[160px]">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accentClass}`}>{value}</p>
    </div>
  )
}
