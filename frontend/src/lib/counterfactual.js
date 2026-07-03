// Apply capacity multipliers to a base (1.0x) forecast client side.
// Mirrors the API logic: scale solar/wind points and bounds, then rebuild
// the supply gap, coverage status and summary.

const classify = (gapPt, gapHi) =>
  gapHi < 0 ? 'confirmed_surplus' : gapPt < 0 ? 'possible_surplus' : 'deficit'

const scale = (iv, m) => ({ point: iv.point * m, lower: iv.lower * m, upper: iv.upper * m })

export function applyMultipliers(base, { solarMultiplier = 1, windMultiplier = 1 } = {}) {
  if (!base) return null
  if (solarMultiplier === 1 && windMultiplier === 1) return base

  const forecasts = base.forecasts.map(f => {
    const solar = scale(f.solar, solarMultiplier)
    const wind = scale(f.wind, windMultiplier)
    const supply_gap = {
      point: f.demand.point - (solar.point + wind.point),
      lower: f.demand.lower - (solar.upper + wind.upper),
      upper: f.demand.upper - (solar.lower + wind.lower),
    }
    return { ...f, solar, wind, supply_gap, coverage_status: classify(supply_gap.point, supply_gap.upper) }
  })

  const count = s => forecasts.filter(f => f.coverage_status === s).length
  return {
    ...base,
    solar_multiplier: solarMultiplier,
    wind_multiplier: windMultiplier,
    forecasts,
    summary: {
      confirmed_surplus_hours: count('confirmed_surplus'),
      possible_surplus_hours: count('possible_surplus'),
      deficit_hours: count('deficit'),
    },
  }
}
