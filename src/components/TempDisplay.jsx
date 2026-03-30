// Converts Celsius to Fahrenheit
export function cToF(c) {
  return c != null ? (c * 9) / 5 + 32 : null
}

export function formatTemp(c, unit = 'F') {
  if (c == null) return '—'
  const val = unit === 'F' ? cToF(c) : c
  return `${Math.round(val)}°${unit}`
}

export default function TempDisplay({ celsius, unit = 'F', large = false }) {
  const text = formatTemp(celsius, unit)
  return (
    <span className={large ? 'text-4xl font-bold tabular-nums' : 'text-xl font-semibold tabular-nums'}>
      {text}
    </span>
  )
}
