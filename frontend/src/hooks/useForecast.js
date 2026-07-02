import { useState, useEffect, useRef, useCallback } from 'react'

export function useForecast({ horizon = 48, solarMultiplier = 1.0, windMultiplier = 1.0 } = {}) {
  const [data, setData]       = useState(null)   // kept stale during refetch so the page doesn't flash
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const abortRef = useRef(null)

  const fetch_ = useCallback(async () => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError(null)
    try {
      const url = `/api/forecast?horizon=${horizon}&solar_multiplier=${solarMultiplier}&wind_multiplier=${windMultiplier}`
      const res = await fetch(url, { signal: ctrl.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
      setLoading(false)
    } catch (e) {
      if (e.name === 'AbortError') return  // superseded by a newer request
      setError(e.message)
      setLoading(false)
    }
  }, [horizon, solarMultiplier, windMultiplier])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refetch: fetch_ }
}

// Debounced mirror of a value. Sliders update instantly, fetches wait for the pause.
export function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}
