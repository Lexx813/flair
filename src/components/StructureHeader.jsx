import { useState, useRef, useEffect } from 'react'
import { Home, RefreshCw, Settings2, ChevronDown, Calendar, Thermometer, Minus, Plus, Cloud } from 'lucide-react'
import { formatTemp } from './TempDisplay'
import { useQueryClient } from '@tanstack/react-query'

const SYSTEM_OPTIONS = [
  { value: 'auto',   label: 'Auto'   },
  { value: 'manual', label: 'Manual' },
]

function Divider() {
  return (
    <div
      className="self-stretch flex-shrink-0"
      style={{ width: '1px', background: 'var(--divider)', margin: '10px 0' }}
    />
  )
}

function Section({ icon, label, children }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 flex-1 min-w-0">
      <div className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <div>
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

function SystemDropdown({ mode, onModeChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  const selected = SYSTEM_OPTIONS.find(o => o.value === mode) ?? SYSTEM_OPTIONS[1]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 cursor-pointer"
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.label}</span>
        <ChevronDown
          size={11}
          style={{
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-50 min-w-[90px]"
          style={{
            background: 'var(--dropdown-bg)',
            border: '1px solid var(--dropdown-border)',
            boxShadow: 'var(--dropdown-shadow)',
          }}
        >
          {SYSTEM_OPTIONS.map(opt => {
            const isActive = opt.value === mode
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => { onModeChange(opt.value); setOpen(false) }}
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
        </div>
      )}
    </div>
  )
}

function SetPointSection({ setPointC, unit, onSetPointChange }) {
  const [adjusting, setAdjusting] = useState(false)

  function adjust(delta) {
    const stepC = unit === 'F' ? 5 / 9 : 0.5
    const next = (setPointC ?? 21) + delta * stepC
    onSetPointChange(Math.round(next * 2) / 2)
  }

  return (
    <Section icon={<Thermometer size={18} />} label={`Set: ${formatTemp(setPointC, unit)}`}>
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
      ) : (
        <button
          onClick={() => setAdjusting(true)}
          className="text-xs cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          Tap to Adjust
        </button>
      )}
    </Section>
  )
}

export default function StructureHeader({ structure, unit, onModeChange, onSetPointChange }) {
  const qc = useQueryClient()
  const attrs = structure.attributes
  const name = attrs.name || 'My Home'
  const mode = attrs.mode
  const setPoint = attrs['set-point-temperature-c']
  const isAuto = mode === 'auto'

  return (
    <div
      className="rounded-2xl flex items-stretch overflow-hidden"
      style={{
        background: 'var(--card-gradient)',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Structure name */}
      <Section icon={<Home size={18} />} label={name}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {isAuto ? 'Auto Mode' : 'Manual Mode'}
        </span>
      </Section>

      <Divider />

      {/* Weather placeholder */}

      <Section icon={<Cloud size={18} />} label="Partly Cloudy">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— °F / —%</span>
      </Section>

      <Divider />

      {/* Set point — only in Auto mode */}
      {isAuto && setPoint != null && onSetPointChange && (
        <>
          <SetPointSection setPointC={setPoint} unit={unit} onSetPointChange={onSetPointChange} />
          <Divider />
        </>
      )}

      {/* System dropdown */}
      <Section icon={<Settings2 size={18} />} label="System">
        <SystemDropdown mode={mode} onModeChange={onModeChange} />
      </Section>

      <Divider />

      {/* Schedule */}
      <Section icon={<Calendar size={18} />} label="Schedule">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {mode === 'schedule' ? 'Active' : 'No Schedule'}
        </span>
      </Section>

      <Divider />

      {/* Refresh */}
      <div className="flex items-center px-4">
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
