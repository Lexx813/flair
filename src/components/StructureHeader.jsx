import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Home, RefreshCw, Settings2, ChevronDown, Calendar, Thermometer,
  Minus, Plus, Cloud, ToggleRight, X,
} from 'lucide-react'
import { formatTemp } from './TempDisplay'
import { useQueryClient } from '@tanstack/react-query'

function Divider() {
  return (
    <div
      className="self-stretch flex-shrink-0"
      style={{ width: '1px', background: 'var(--divider)', margin: '10px 0' }}
    />
  )
}

function Section({ icon, label, children, minWidth }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 flex-1"
      style={{ minWidth: minWidth ?? 100 }}
    >
      <div className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--accent)' }}>
          {label}
        </p>
        <div className="mt-0.5">
          {children}
        </div>
      </div>
    </div>
  )
}

// Shared portal dropdown — renders options list into document.body
function InlineDropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function handleOpen() {
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX })
    setOpen(o => !o)
  }

  return (
    <div ref={triggerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1 cursor-pointer"
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {selected?.label ?? placeholder ?? '—'}
        </span>
        <ChevronDown
          size={11}
          style={{
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        />
      </button>

      {open && createPortal(
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            minWidth: 100,
            zIndex: 9999,
            background: 'var(--dropdown-bg)',
            border: '1px solid var(--dropdown-border)',
            boxShadow: 'var(--dropdown-shadow)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          {options.map(opt => {
            const isActive = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-xs font-semibold cursor-pointer transition-colors duration-100"
                style={{
                  background: isActive ? 'var(--dropdown-active-bg)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--dropdown-hover)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

const SYSTEM_OPTIONS = [
  { value: 'auto',   label: 'Auto'   },
  { value: 'manual', label: 'Manual' },
]

const CLIMATE_OPTIONS = [
  { value: 'cool', label: 'Cool' },
  { value: 'heat', label: 'Heat' },
]

const HOLD_OPTIONS = [
  { value: '1h',      label: 'Hold 1 hour'   },
  { value: '2h',      label: 'Hold 2 hours'  },
  { value: '4h',      label: 'Hold 4 hours'  },
  { value: 'tonight', label: 'Until tonight' },
]

function SetPointSection({ setPointC, unit, onSetPointChange, holdUntil, onHold }) {
  const [adjusting, setAdjusting] = useState(false)
  const [holdOpen, setHoldOpen] = useState(false)
  const [holdPos, setHoldPos] = useState({ top: 0, left: 0 })
  const holdRef = useRef(null)

  useEffect(() => {
    if (!holdOpen) return
    function onOutside(e) {
      if (holdRef.current && !holdRef.current.contains(e.target)) setHoldOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [holdOpen])

  function openHold() {
    const rect = holdRef.current.getBoundingClientRect()
    setHoldPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX })
    setHoldOpen(o => !o)
  }

  function adjust(delta) {
    const stepC = unit === 'F' ? 5 / 9 : 0.5
    const next = (setPointC ?? 21) + delta * stepC
    onSetPointChange(Math.round(next * 2) / 2)
  }

  function formatHoldTime(iso) {
    const d = new Date(iso)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    return isToday
      ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <Section icon={<Thermometer size={18} />} label={`Set: ${formatTemp(setPointC, unit)}`} minWidth={140}>
      {adjusting ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => adjust(-1)}
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{ background: 'var(--btn-minus-bg)', border: '1px solid var(--btn-minus-border)' }}
          >
            <Minus size={10} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={() => adjust(1)}
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{ background: 'var(--btn-plus-bg)', border: '1px solid var(--btn-plus-border)' }}
          >
            <Plus size={10} style={{ color: 'var(--accent)' }} />
          </button>
          <button
            onClick={() => setAdjusting(false)}
            className="text-[10px] cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            Done
          </button>
        </div>
      ) : holdUntil ? (
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--hold-bg)', color: 'var(--hold-color)', border: '1px solid var(--hold-border)' }}
          >
            Until {formatHoldTime(holdUntil)}
          </span>
          <button
            onClick={() => onHold('clear')}
            title="Clear hold"
            className="cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdjusting(true)}
            className="text-xs cursor-pointer transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Adjust
          </button>
          <span style={{ color: 'var(--divider)' }}>·</span>
          <div ref={holdRef} className="relative">
            <button
              onClick={openHold}
              className="flex items-center gap-0.5 text-xs cursor-pointer transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Hold
              <ChevronDown size={10} style={{ transform: holdOpen ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }} />
            </button>
            {holdOpen && createPortal(
              <div
                role="listbox"
                style={{
                  position: 'absolute',
                  top: holdPos.top,
                  left: holdPos.left,
                  minWidth: 120,
                  zIndex: 9999,
                  background: 'var(--dropdown-bg)',
                  border: '1px solid var(--dropdown-border)',
                  boxShadow: 'var(--dropdown-shadow)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                }}
              >
                {HOLD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onHold(opt.value); setHoldOpen(false) }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold cursor-pointer transition-colors duration-100"
                    style={{ background: 'transparent', color: 'var(--text-primary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--dropdown-hover)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>
        </div>
      )}
    </Section>
  )
}

export default function StructureHeader({
  structure,
  unit,
  weather,
  schedules,
  onModeChange,
  onSetPointChange,
  onHomeAwayChange,
  onHeatCoolChange,
  onHold,
}) {
  const qc = useQueryClient()
  const attrs = structure.attributes
  const name = attrs.name || 'My Home'
  const mode = attrs.mode
  const setPoint = attrs['set-point-temperature-c']
  const homeAwayMode = attrs['home-away-mode'] ?? 'home'
  const heatCoolMode = attrs['structure-heat-cool-mode']?.toLowerCase() ?? 'cool'
  const holdUntil = attrs['hold-until']
  const isAuto = mode === 'auto'
  const isHome = homeAwayMode !== 'away'

  const activeSchedule = schedules?.find(s => s.attributes['is-active'])
    ?? schedules?.find(s => s.attributes.enabled !== false)
    ?? null

  // Weather — Flair may use different field names; handle defensively
  const wAttrs = weather?.attributes
  const wTempC = wAttrs?.['temperature-c'] ?? wAttrs?.['outdoor-temperature-c'] ?? null
  const wHumidity = wAttrs?.humidity ?? wAttrs?.['outdoor-humidity'] ?? null
  const wCondition = wAttrs?.conditions ?? wAttrs?.condition ?? wAttrs?.description ?? null

  return (
    <div
      className="rounded-2xl flex items-stretch overflow-x-auto"
      style={{
        background: 'var(--card-gradient)',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Structure name */}
      <Section icon={<Home size={18} />} label={name} minWidth={120}>
        <button
          onClick={() => onHomeAwayChange?.(isHome ? 'away' : 'home')}
          className="text-xs px-2 py-0.5 rounded-full cursor-pointer transition-all"
          style={isHome
            ? { background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
            : { background: 'var(--btn-ghost-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
          }
        >
          {isHome ? 'Home' : 'Away'}
        </button>
      </Section>

      <Divider />

      {/* Weather */}
      <Section icon={<Cloud size={18} />} label={wCondition ?? 'Weather'} minWidth={110}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {wTempC != null ? formatTemp(wTempC, unit) : '—'}
          {wHumidity != null ? ` · ${Math.round(wHumidity)}%` : ''}
        </span>
      </Section>

      <Divider />

      {/* Set point — Auto mode only */}
      {isAuto && setPoint != null && onSetPointChange && (
        <>
          <SetPointSection
            setPointC={setPoint}
            unit={unit}
            onSetPointChange={onSetPointChange}
            holdUntil={holdUntil}
            onHold={onHold}
          />
          <Divider />
        </>
      )}

      {/* System: Heat/Cool + Auto/Manual */}
      <Section icon={<Settings2 size={18} />} label="System" minWidth={130}>
        <div className="flex items-center gap-2">
          <InlineDropdown
            value={heatCoolMode}
            options={CLIMATE_OPTIONS}
            onChange={onHeatCoolChange}
          />
          <span style={{ color: 'var(--divider)', fontSize: 10 }}>·</span>
          <InlineDropdown
            value={mode}
            options={SYSTEM_OPTIONS}
            onChange={onModeChange}
          />
        </div>
      </Section>

      <Divider />

      {/* Schedule */}
      <Section icon={<Calendar size={18} />} label="Schedule" minWidth={110}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {activeSchedule
            ? (activeSchedule.attributes.name || 'Active')
            : schedules?.length
              ? `${schedules.length} schedule${schedules.length !== 1 ? 's' : ''}`
              : 'No Schedule'}
        </span>
      </Section>

      <Divider />

      {/* Refresh */}
      <div className="flex items-center px-4 flex-shrink-0">
        <button
          onClick={() => qc.invalidateQueries()}
          title="Refresh all"
          aria-label="Refresh all data"
          className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150"
          style={{ background: 'var(--btn-ghost-bg)', border: '1px solid var(--border-default)' }}
        >
          <RefreshCw size={13} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </div>
  )
}
