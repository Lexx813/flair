import { Droplets, Minus, Plus, Power, Wind, Thermometer } from 'lucide-react'
import { formatTemp } from './TempDisplay'
import { usePuck2HvacUnits, useUpdateHvacUnit } from '../hooks/useFlair'
import Spinner from './Spinner'

const MODES = ['Cool', 'Heat', 'Fan', 'Dry']
const FAN_SPEEDS = ['Auto', 'Fan Hi', 'Fan Mid', 'Fan Low']
const FAN_LABELS = ['Auto', 'Hi', 'Mid', 'Low']

function hvacTempDisplay(tempF, unit) {
  if (tempF == null) return '—'
  if (unit === 'F') return `${tempF}°F`
  return `${Math.round((tempF - 32) * 5 / 9)}°C`
}

const MODE_COLORS = {
  Cool: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Heat: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  Fan:  'bg-slate-500/20 text-slate-300 border-slate-500/40',
  Dry:  'bg-teal-500/20 text-teal-300 border-teal-500/40',
}

export default function Puck2Card({ puck2, unit = 'F' }) {
  const attrs = puck2.attributes
  const name = attrs.name || 'Puck'
  const currentTempC = attrs['current-temperature-c']
  const humidity = attrs['current-humidity']
  const inactive = attrs['inactive'] === true

  const { data: hvacUnits, isLoading } = usePuck2HvacUnits(puck2.id)
  const hvac = hvacUnits?.[0]
  const hvacAttrs = hvac?.attributes

  const { mutate: updateHvac, isPending: saving } = useUpdateHvacUnit(hvac?.id, puck2.id)

  const isOn = hvacAttrs?.power === 'On'
  const currentMode = hvacAttrs?.mode
  const currentFan = hvacAttrs?.['fan-speed']
  const tempF = hvacAttrs?.temperature

  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(145deg, #1E293B 0%, #162032 100%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        opacity: inactive ? 0.55 : 1,
      }}
    >
      {/* Top section: sensor readings */}
      <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: '#94A3B8' }}
          >
            {name}
          </span>
          <span className="text-xs" style={{ color: '#64748B' }}>
            Puck 2 · Standalone
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className="text-5xl font-bold leading-none"
            style={{ fontFamily: 'Fira Code, monospace', color: '#F8FAFC' }}
          >
            {formatTemp(currentTempC, unit)}
          </span>
          {humidity != null && (
            <div className="flex items-center gap-1.5" style={{ color: '#64748B' }}>
              <Droplets size={12} />
              <span className="text-xs font-medium">{Math.round(humidity)}% RH</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 24px' }} />

      {/* HVAC controls */}
      <div className="px-6 py-5 flex flex-col gap-5">
        {isLoading && (
          <div className="flex justify-center py-3"><Spinner size={20} /></div>
        )}

        {hvac && (
          <>
            {/* Header row: unit name + power */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: '#CBD5E1' }}>
                {hvacAttrs?.name || 'AC Unit'}
              </span>
              <button
                disabled={saving}
                onClick={() => updateHvac({ power: isOn ? 'Off' : 'On' })}
                aria-label={isOn ? 'Turn off' : 'Turn on'}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold
                  cursor-pointer transition-all duration-200 disabled:opacity-50 border"
                style={isOn
                  ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.3)' }
                  : { background: 'rgba(100,116,139,0.15)', color: '#64748B', borderColor: 'rgba(100,116,139,0.25)' }
                }
              >
                <Power size={12} />
                {isOn ? 'On' : 'Off'}
              </button>
            </div>

            {/* Setpoint control */}
            <div
              className="rounded-2xl px-4 py-4 flex items-center justify-between"
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#475569' }}>
                  Set point
                </span>
                <span
                  className="text-3xl font-bold leading-none"
                  style={{ fontFamily: 'Fira Code, monospace', color: isOn ? '#F8FAFC' : '#475569' }}
                >
                  {saving ? '…' : hvacTempDisplay(tempF, unit)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={saving || !isOn}
                  onClick={() => updateHvac({ temperature: (tempF ?? 72) - 1 })}
                  aria-label="Decrease temperature"
                  className="w-10 h-10 rounded-full flex items-center justify-center
                    cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                >
                  <Minus size={16} color="#94A3B8" />
                </button>
                <button
                  disabled={saving || !isOn}
                  onClick={() => updateHvac({ temperature: (tempF ?? 72) + 1 })}
                  aria-label="Increase temperature"
                  className="w-10 h-10 rounded-full flex items-center justify-center
                    cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(34,197,94,0.25)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}
                >
                  <Plus size={16} color="#22C55E" />
                </button>
              </div>
            </div>

            {/* Mode pills */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#475569' }}>Mode</span>
              <div className="grid grid-cols-4 gap-2">
                {MODES.map(m => (
                  <button
                    key={m}
                    disabled={saving || !isOn}
                    onClick={() => updateHvac({ mode: m })}
                    className="py-2 rounded-xl text-xs font-semibold cursor-pointer
                      transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border"
                    style={currentMode === m
                      ? { ...(MODE_COLORS[m] ? {} : {}), background: 'rgba(34,197,94,0.2)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.4)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#64748B', borderColor: 'rgba(255,255,255,0.07)' }
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Fan speed */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#475569' }}>Fan</span>
              <div className="grid grid-cols-4 gap-2">
                {FAN_SPEEDS.map((f, i) => (
                  <button
                    key={f}
                    disabled={saving || !isOn}
                    onClick={() => updateHvac({ 'fan-speed': f })}
                    className="py-2 rounded-xl text-xs font-semibold cursor-pointer
                      transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border"
                    style={currentFan === f
                      ? { background: 'rgba(99,102,241,0.2)', color: '#818CF8', borderColor: 'rgba(99,102,241,0.4)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#64748B', borderColor: 'rgba(255,255,255,0.07)' }
                    }
                  >
                    {FAN_LABELS[i]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
