const PRESETS = [
  { label: '2× solar', solarMultiplier: 2.0, windMultiplier: 1.0 },
  { label: '3× wind',  solarMultiplier: 1.0, windMultiplier: 3.0 },
  { label: '2× both',  solarMultiplier: 2.0, windMultiplier: 2.0 },
]

export default function CounterfactualPanel({ multipliers, onChange, summary, baseSummary }) {
  const set = (key, val) => onChange({ ...multipliers, [key]: parseFloat(val) })
  const isBaseline = multipliers.solarMultiplier === 1.0 && multipliers.windMultiplier === 1.0
  const diff = baseSummary
    ? summary.confirmed_surplus_hours - baseSummary.confirmed_surplus_hours
    : null

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          What if Switzerland had more capacity?
        </h2>
        {diff !== null && !isBaseline && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            diff > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
            : diff < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}>
            {diff > 0 ? '+' : ''}{diff} confirmed green hours vs today's grid
          </span>
        )}
      </div>

      <label className="block text-sm text-gray-600 dark:text-gray-300">
        <span className="flex justify-between">
          <span>Solar capacity</span>
          <span className="font-mono tabular-nums">×{multipliers.solarMultiplier.toFixed(1)}</span>
        </span>
        <input
          type="range" min="0.5" max="3.0" step="0.1"
          value={multipliers.solarMultiplier}
          onChange={e => set('solarMultiplier', e.target.value)}
          className="w-full mt-1 accent-amber-500"
        />
      </label>

      <label className="block text-sm text-gray-600 dark:text-gray-300">
        <span className="flex justify-between">
          <span>Wind capacity</span>
          <span className="font-mono tabular-nums">×{multipliers.windMultiplier.toFixed(1)}</span>
        </span>
        <input
          type="range" min="0.5" max="3.0" step="0.1"
          value={multipliers.windMultiplier}
          onChange={e => set('windMultiplier', e.target.value)}
          className="w-full mt-1 accent-emerald-600"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.label}
            onClick={() => onChange({ solarMultiplier: p.solarMultiplier, windMultiplier: p.windMultiplier })}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            {p.label}
          </button>
        ))}
        <button
          onClick={() => onChange({ solarMultiplier: 1.0, windMultiplier: 1.0 })}
          disabled={isBaseline}
          className="text-xs px-2.5 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
          Reset to 1.0×
        </button>
      </div>
    </div>
  )
}
