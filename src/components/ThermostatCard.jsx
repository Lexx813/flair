import { Droplets, Minus, Plus } from 'lucide-react'
import { formatTemp } from './TempDisplay'
import { useUpdateThermostat } from '../hooks/useFlair'
import CustomSelect from './CustomSelect'

const MODE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'cool', label: 'Cool' },
  { value: 'heat', label: 'Heat' },
  { value: 'fan',  label: 'Fan'  },
  { value: 'off',  label: 'Off'  },
]

export default function ThermostatCard({ thermostat, structureId, unit }) {
  const attrs = thermostat.attributes
  const name = attrs.name || 'Thermostat'
  const currentTempC = attrs['current-temperature-c']
  const setPointC = attrs['set-point-temperature-c']
  const humidity = attrs['current-humidity']
  const mode = attrs.mode?.toLowerCase()
  const active = attrs['is-active'] !== false

  const { mutate: updateThermostat, isPending: saving, error: saveError } = useUpdateThermostat(thermostat.id, structureId)

  function adjustSetPoint(delta) {
    const stepC = unit === 'F' ? 5 / 9 : 0.5
    const next = (setPointC ?? 21) + delta * stepC
    updateThermostat({ 'set-point-temperature-c': Math.round(next * 2) / 2 })
  }

  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: active ? 'var(--card-gradient)' : 'var(--card-bg-inactive)',
        boxShadow: active ? 'var(--card-shadow)' : 'none',
        border: '1px solid var(--border-subtle)',
        opacity: active ? 1 : 0.55,
      }}
    >
      {/* Header: name + current temp */}
      <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            {name}
          </span>
          <span className="text-xs font-medium" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-5xl font-bold leading-none"
            style={{ fontFamily: 'Fira Code, monospace', color: 'var(--text-primary)' }}
          >
            {formatTemp(currentTempC, unit)}
          </span>
          {humidity != null && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Droplets size={12} />
              <span className="text-xs font-medium">{Math.round(humidity)}% RH</span>
            </div>
          )}
        </div>
      </div>

      {/* Set point */}
      {setPointC != null && (
        <>
          <div style={{ height: '1px', background: 'var(--divider)', margin: '0 24px' }} />
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-label)' }}>
                Set point
              </p>
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: 'Fira Code, monospace', color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {saving ? '…' : formatTemp(setPointC, unit)}
              </span>
              {saveError && (
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--error)' }}>Failed to save</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={saving || !active}
                onClick={() => adjustSetPoint(-1)}
                aria-label="Decrease set point"
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
                  transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: 'var(--btn-minus-bg)', border: '1px solid var(--btn-minus-border)' }}
              >
                <Minus size={14} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button
                disabled={saving || !active}
                onClick={() => adjustSetPoint(1)}
                aria-label="Increase set point"
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
                  transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: 'var(--btn-plus-bg)', border: '1px solid var(--btn-plus-border)' }}
              >
                <Plus size={14} style={{ color: 'var(--accent)' }} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mode */}
      {mode != null && (
        <>
          <div style={{ height: '1px', background: 'var(--divider)', margin: '0 24px' }} />
          <div className="px-6 py-4 flex flex-col gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>Mode</span>
            <CustomSelect
              value={mode}
              options={MODE_OPTIONS}
              onChange={val => updateThermostat({ mode: val })}
              disabled={saving || !active}
            />
          </div>
        </>
      )}
    </div>
  )
}
