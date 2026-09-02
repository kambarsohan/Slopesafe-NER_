// Shows the risk level as a colored badge WITH an icon and text label,
// so risk is never communicated by color alone (accessibility requirement).
const STYLES = {
  High: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: '▲' },
  Medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', icon: '●' },
  Low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: '✓' },
}

export default function RiskBadge({ level, size = 'md' }) {
  const style = STYLES[level] || STYLES.Low
  const sizeClasses = size === 'lg' ? 'text-lg px-4 py-2' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span aria-hidden="true">{style.icon}</span>
      {level} risk
    </span>
  )
}
