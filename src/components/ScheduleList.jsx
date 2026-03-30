import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatTemp } from './TempDisplay'
import { useScheduleEntries } from '../hooks/useFlair'
import Spinner from './Spinner'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_MAP = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
  // numeric or abbreviated forms
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
}

function formatTime(raw) {
  if (!raw) return '—'
  // Handle "HH:MM:SS" or "HH:MM"
  const [h, m] = raw.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function dayIndex(raw) {
  if (raw == null) return 99
  const key = typeof raw === 'string' ? raw.toLowerCase() : raw
  return DAY_MAP[key] ?? 99
}

function ScheduleCard({ schedule, unit }) {
  const [open, setOpen] = useState(false)
  const { data: entries, isLoading } = useScheduleEntries(open ? schedule.id : null)

  const attrs = schedule.attributes
  const name = attrs.name || 'Untitled Schedule'
  const isActive = attrs['is-active']
  const enabled = attrs.enabled !== false

  // Group entries by day
  const grouped = {}
  if (entries) {
    for (const entry of entries) {
      const ea = entry.attributes
      const day = ea['day-of-week'] ?? ea['day'] ?? ea['days']
      // day may be a string like "monday", a number, or an array
      const days = Array.isArray(day) ? day : [day]
      for (const d of days) {
        const idx = dayIndex(d)
        if (!grouped[idx]) grouped[idx] = []
        grouped[idx].push(ea)
      }
    }
    // Sort each day's entries by time
    for (const idx of Object.keys(grouped)) {
      grouped[idx].sort((a, b) => (a['time-of-day'] ?? '').localeCompare(b['time-of-day'] ?? ''))
    }
  }

  const sortedDays = Object.keys(grouped).map(Number).sort((a, b) => a - b)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--card-gradient)',
        border: '1px solid var(--border-subtle)',
        boxShadow: isActive ? 'var(--card-shadow)' : 'none',
        opacity: enabled ? 1 : 0.5,
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span>
            <div className="flex items-center gap-2">
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
              {entries && (
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
                </span>
              )}
            </div>
          </div>
        </div>
        {open
          ? <ChevronUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          : <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        }
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--divider)' }}>
          {isLoading && (
            <div className="flex justify-center py-4">
              <Spinner size={16} />
            </div>
          )}

          {!isLoading && entries?.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No entries</p>
          )}

          {!isLoading && sortedDays.length > 0 && (
            <div className="px-5 py-4 flex flex-col gap-4">
              {sortedDays.map(dayIdx => (
                <div key={dayIdx}>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {DAYS[dayIdx] ?? `Day ${dayIdx}`}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {grouped[dayIdx].map((ea, i) => {
                      const time = ea['time-of-day'] ?? ea.time
                      const tempC = ea['set-point-temperature-c'] ?? ea['temperature-c']
                      const label = ea.label ?? ea.name ?? null
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl px-3 py-2"
                          style={{ background: 'var(--setpoint-bg)', border: '1px solid var(--setpoint-border)' }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', minWidth: 64 }}>
                              {formatTime(time)}
                            </span>
                            {label && (
                              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                            )}
                          </div>
                          {tempC != null && (
                            <span
                              className="text-sm font-bold"
                              style={{ fontFamily: 'Fira Code, monospace', color: 'var(--text-primary)' }}
                            >
                              {formatTemp(tempC, unit)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ScheduleList({ schedules, unit }) {
  if (!schedules?.length) return null
  return (
    <div className="flex flex-col gap-2">
      {schedules.map(s => (
        <ScheduleCard key={s.id} schedule={s} unit={unit} />
      ))}
    </div>
  )
}
