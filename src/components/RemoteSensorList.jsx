import { Thermometer, Droplets } from 'lucide-react'
import { formatTemp } from './TempDisplay'

function RemoteSensorRow({ sensor, unit }) {
  const attrs = sensor.attributes
  const name = attrs.name || 'Sensor'
  const tempC = attrs['current-temperature-c']
  const humidity = attrs['current-humidity']
  const active = attrs['is-active'] !== false

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center justify-between"
      style={{
        background: active ? 'var(--card-gradient)' : 'var(--card-bg-inactive)',
        border: '1px solid var(--border-subtle)',
        boxShadow: active ? 'var(--card-shadow)' : 'none',
        opacity: active ? 1 : 0.55,
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {name}
        </span>
        <span className="text-xs" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
          {active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex items-center gap-5">
        {tempC != null && (
          <div className="flex items-center gap-1.5">
            <Thermometer size={13} style={{ color: 'var(--text-muted)' }} />
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: 'Fira Code, monospace', color: 'var(--text-primary)' }}
            >
              {formatTemp(tempC, unit)}
            </span>
          </div>
        )}
        {humidity != null && (
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Droplets size={13} />
            <span className="text-sm font-medium">{Math.round(humidity)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RemoteSensorList({ sensors, unit }) {
  return (
    <div className="flex flex-col gap-2">
      {sensors.map(s => (
        <RemoteSensorRow key={s.id} sensor={s} unit={unit} />
      ))}
    </div>
  )
}
