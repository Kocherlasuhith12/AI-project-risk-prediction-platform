export default function RiskBadge({ level, score }) {
  const styles = {
    High:   'risk-high',
    Medium: 'risk-medium',
    Low:    'risk-low',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${styles[level] || 'bg-slate-700 text-slate-300'}`}>
      <span className={`w-2 h-2 rounded-full ${level === 'High' ? 'bg-red-400' : level === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
      {level} Risk {score !== undefined && `(${score}/10)`}
    </span>
  )
}
