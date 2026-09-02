// A color + icon + text legend, shown wherever risk-coded markers/badges appear,
// so risk is never communicated by color alone.
const ITEMS = [
  { level: 'High', color: 'bg-risk-high', icon: '▲' },
  { level: 'Medium', color: 'bg-risk-medium', icon: '●' },
  { level: 'Low', color: 'bg-risk-low', icon: '✓' },
]

export default function RiskLegend() {
  return (
    <div className="flex flex-wrap gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm">
      <span className="font-semibold text-gray-700">Legend:</span>
      {ITEMS.map((item) => (
        <span key={item.level} className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${item.color} inline-block`} aria-hidden="true" />
          <span aria-hidden="true">{item.icon}</span>
          {item.level}
        </span>
      ))}
    </div>
  )
}
