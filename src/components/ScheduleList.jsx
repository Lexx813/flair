import { formatTemp } from './TempDisplay'

function formatTime(raw) {
  if (!raw) return null
  const [h, m] = raw.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function ScheduleList({ schedules, unit }) {
  if (!schedules?.length) return null

  return (
    <div className="flex flex-col gap-2">
      {schedules.map(s => {
        const a = s.attributes
        const name = a.name || 'Untitled'
        const isActive = a['is-active']
        const enabled = a.enabled !== false

        // Collect any timing/temp fields present on the schedule itself
        const setPointC = a['set-point-temperature-c']
        const startTime = formatTime(a['time-of-day'] ?? a['start-time'])
        const endTime   = formatTime(a['end-time'])

        return (
          <div
            key={s.id}
            className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{
              background: 'var(--card-gradient)',
              border: '1px solid var(--border-subtle)',
              boxShadow: isActive ? 'var(--card-shadow)' : 'none',
              opacity: enabled ? 1 : 0.5,
            }}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {name}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {isActive && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                  >
                    Active
                  </span>
                )}
                {!enabled && (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Disabled</span>
                )}
                {startTime && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {startTime}{endTime ? ` – ${endTime}` : ''}
                  </span>
                )}
              </div>
            </div>

            {setPointC != null && (
              <span
                className="text-xl font-bold flex-shrink-0"
                style={{ fontFamily: 'Fira Code, monospace', color: 'var(--text-primary)' }}
              >
                {formatTemp(setPointC, unit)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
