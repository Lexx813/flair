import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Home, Settings2, ChevronDown, Calendar, Thermometer,
  Minus, Plus, Cloud, X,
} from 'lucide-react'
import { formatTemp } from './TempDisplay'

// Desktop-only vertical rule between sections
function Divider() {
  return (
    <div
      className="hidden md:block self-stretch flex-shrink-0"
      style={{ width: '1px', background: 'var(--divider)', margin: '10px 0' }}
    />
  )
}

// Mobile-only full-width horizontal rule between grid rows
function RowBreak() {
  return (
    <div
      className="col-span-2 md:hidden"
      style={{ height: '1px', background: 'var(--divider)' }}
    />
  )
}

// className is forwarded so callers can add col-span-2 etc. for grid layout
function Section({ icon, label, children, className = '' }) {
  return (
    <div className={`flex items-center gap-2 md:gap-3 px-4 md:px-5 py-3 md:py-3.5 w-full md:flex-1 md:w-auto min-w-0 ${className}`}>
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
        className="flex items-center gap-1 cursor-pointer rounded-lg px-1.5 py-0.5 transition-all duration-150 active:scale-95"
        style={{ background: open ? 'var(--btn-ghost-bg)' : 'transparent' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--btn-ghost-bg)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        <span className="text-xs font-medium" style={{ color: open ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {selected?.label ?? (value || placeholder || '—')}
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
          onMouseDown={e => e.stopPropagation()}
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
  { value: 'cool',       label: 'Cool'       },
  { value: 'heat',       label: 'Heat'       },
  { value: 'heat_cool',  label: 'Heat & Cool' },
  { value: 'auto',       label: 'Auto'       },
  { value: 'fan_only',   label: 'Fan Only'   },
  { value: 'dry',        label: 'Dry'        },
  { value: 'off',        label: 'Off'        },
]

const HOLD_OPTIONS = [
  { value: '1h',      label: 'Hold 1 hour'   },
  { value: '2h',      label: 'Hold 2 hours'  },
  { value: '4h',      label: 'Hold 4 hours'  },
  { value: 'tonight', label: 'Until tonight' },
]

function SetPointSection({ setPointC, unit, onSetPointChange, holdUntil, onHold, className }) {
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
    <Section icon={<Thermometer size={18} />} label={`Set: ${formatTemp(setPointC, unit)}`} className={className}>
      {adjusting ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => adjust(-1)}
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
            style={{ background: 'var(--btn-minus-bg)', border: '1px solid var(--btn-minus-border)' }}
          >
            <Minus size={10} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={() => adjust(1)}
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
            style={{ background: 'var(--btn-plus-bg)', border: '1px solid var(--btn-plus-border)' }}
          >
            <Plus size={10} style={{ color: 'var(--accent)' }} />
          </button>
          <button onClick={() => setAdjusting(false)} className="text-[10px] cursor-pointer" style={{ color: 'var(--text-muted)' }}>
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
          <button onClick={() => onHold('clear')} title="Clear hold" className="cursor-pointer" style={{ color: 'var(--text-muted)' }}>
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
                onMouseDown={e => e.stopPropagation()}
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
  structure, unit, weather, schedules,
  onModeChange, onSetPointChange, onHeatCoolChange, onHold,
}) {
  const [expanded, setExpanded] = useState(false)
  const attrs = structure.attributes
  const name = attrs.name || 'My Home'
  const mode = attrs.mode
  const setPoint = attrs['set-point-temperature-c']
  const homeAwayMode = attrs['home-away-mode'] ?? 'home'
  const heatCoolMode = (attrs['structure-heat-cool-mode'] ?? 'cool').toLowerCase()
  const holdUntil = attrs['hold-until']
  const isAuto = mode === 'auto'
  const isHome = homeAwayMode?.toLowerCase() !== 'away'

  const activeSchedule = schedules?.find(s => s.attributes['is-active'])
    ?? schedules?.find(s => s.attributes.enabled !== false)
    ?? null

  const wAttrs = weather?.attributes
  const wTempC = wAttrs?.['temperature-c'] ?? wAttrs?.['outdoor-temperature-c'] ?? null
  const wHumidity = wAttrs?.humidity ?? wAttrs?.['outdoor-humidity'] ?? null
  const wCondition = wAttrs?.conditions ?? wAttrs?.condition ?? wAttrs?.description ?? null

  return (
    <div
      className="rounded-2xl overflow-hidden md:grid-cols-none md:flex md:items-stretch md:overflow-x-auto"
      style={{
        background: 'var(--card-gradient)',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Always-visible top row on mobile: Name + toggle + Refresh */}
      <div className="flex items-center md:contents">
        {/* Name + Home/Away */}
        <Section icon={<Home size={18} />} label={name} className="flex-1">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={isHome
              ? { background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
              : { background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }
            }
          >
            ● {isHome ? 'Home' : 'Away'}
          </span>
        </Section>

        {/* Mobile-only: collapse toggle in top-right */}
        <div className="flex items-center gap-1 pr-3 md:hidden flex-shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150"
            style={{ background: 'var(--btn-ghost-bg)', border: '1px solid var(--border-default)' }}
          >
            <ChevronDown
              size={14}
              style={{
                color: 'var(--text-muted)',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
            />
          </button>
        </div>

        <Divider />
      </div>

      {/* Collapsible body — always visible on desktop, toggled on mobile */}
      <div className={`${expanded ? 'grid' : 'hidden'} grid-cols-2 md:contents`}>
        {/* Weather */}
        <Section icon={<Cloud size={18} />} label={wCondition ?? 'Weather'}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {wTempC != null ? formatTemp(wTempC, unit) : '—'}
            {wHumidity != null ? ` · ${Math.round(wHumidity)}%` : ''}
          </span>
        </Section>

        <RowBreak />

        {/* Set point — Auto mode only, full width on mobile */}
        {isAuto && setPoint != null && onSetPointChange && (
          <>
            <SetPointSection
              className="col-span-2"
              setPointC={setPoint}
              unit={unit}
              onSetPointChange={onSetPointChange}
              holdUntil={holdUntil}
              onHold={onHold}
            />
            <RowBreak />
            <Divider />
          </>
        )}

        {/* Mode: Cool/Heat */}
        <Section icon={<Settings2 size={18} />} label="Mode">
          <InlineDropdown value={heatCoolMode} options={CLIMATE_OPTIONS} onChange={onHeatCoolChange} />
        </Section>

        <Divider />

        {/* System: Auto/Manual */}
        <Section icon={<Settings2 size={18} />} label="System">
          <InlineDropdown value={mode} options={SYSTEM_OPTIONS} onChange={onModeChange} />
        </Section>

        <Divider />

        {/* Schedule */}
        <Section icon={<Calendar size={18} />} label="Schedule">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {activeSchedule
              ? (activeSchedule.attributes.name || 'Active')
              : schedules?.length
                ? `${schedules.length} schedule${schedules.length !== 1 ? 's' : ''}`
                : 'No Schedule'}
          </span>
        </Section>

        <Divider />

      </div>
    </div>
  )
}
