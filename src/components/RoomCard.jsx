import { useState } from 'react'
import { Droplets, Minus, Plus, ChevronDown, ChevronUp, Power } from 'lucide-react'
import { formatTemp } from './TempDisplay'
import { useRoomPucks, useRoomPuck2s, useRoomVents, useUpdateRoom, usePuck2HvacUnits, useUpdateHvacUnit } from '../hooks/useFlair'
import VentBar from './VentBar'
import Spinner from './Spinner'
import CustomSelect from './CustomSelect'
import Tooltip from './Tooltip'

// PATCH values use Flair's constraint/uppercase format.
// GET returns title-case ("Cool") but PATCH requires uppercase ("COOL").
const MODE_OPTIONS = [
  { value: 'COOL', label: 'Cool' },
  { value: 'HEAT', label: 'Heat' },
  { value: 'FAN',  label: 'Fan'  },
  { value: 'DRY',  label: 'Dry'  },
]
const FAN_OPTIONS = [
  { value: 'FAN AUTO', label: 'Auto' },
  { value: 'FAN HI',   label: 'Hi'   },
  { value: 'FAN MID',  label: 'Mid'  },
  { value: 'FAN LOW',  label: 'Low'  },
]
// Normalize GET response values to match option values for selected-state display
function normalizeMode(v) { return v?.toUpperCase() ?? '' }
function normalizeFan(v) {
  if (!v) return ''
  const up = v.toUpperCase()
  if (up === 'HIGH')   return 'FAN HI'
  if (up === 'MEDIUM') return 'FAN MID'
  if (up === 'LOW')    return 'FAN LOW'
  if (up === 'AUTO')   return 'FAN AUTO'
  return up.startsWith('FAN ') ? up : `FAN ${up}`
}

function HvacControls({ puck2Id, unit, saving: roomSaving }) {
  const { data: hvacUnits, isLoading } = usePuck2HvacUnits(puck2Id)
  const hvac = hvacUnits?.[0]
  const { mutate: updateHvac, isPending, error: hvacError } = useUpdateHvacUnit(hvac?.id, puck2Id)

  if (isLoading) return <div className="flex justify-center py-2"><Spinner size={16} /></div>
  if (!hvac) return null

  const saving = isPending || roomSaving
  const attrs = hvac.attributes
  const isOn = attrs.power === 'On'
  const currentMode = attrs.mode
  const currentFan = attrs['fan-speed']
  const tempF = attrs.temperature

  function hvacTempDisplay(f) {
    if (f == null) return '—'
    return unit === 'F' ? `${f}°F` : `${Math.round((f - 32) * 5 / 9)}°C`
  }

  return (
    <div className="flex flex-col gap-4 pt-1">
      {hvacError && (
        <p className="text-[10px] px-2 py-1.5 rounded-lg" style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {hvacError.message}
        </p>
      )}
      {/* Device name + power toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {attrs.name || 'AC Unit'}
        </span>
        <Tooltip text={isOn ? 'Turn AC off' : 'Turn AC on'}>
          <button
            disabled={saving}
            onClick={() => updateHvac({ power: isOn ? 'Off' : 'On' })}
            aria-label={isOn ? 'Turn off' : 'Turn on'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              cursor-pointer transition-all duration-200 disabled:opacity-50 border"
            style={isOn
              ? { background: 'var(--power-on-bg)', color: 'var(--power-on-color)', borderColor: 'var(--power-on-border)' }
              : { background: 'var(--power-off-bg)', color: 'var(--power-off-color)', borderColor: 'var(--power-off-border)' }
            }
          >
            <Power size={11} />
            {isOn ? 'On' : 'Off'}
          </button>
        </Tooltip>
      </div>

      {/* Set point */}
      <div
        className="rounded-2xl px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--setpoint-bg)', border: '1px solid var(--setpoint-border)' }}
      >
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-label)' }}>
            AC Set point
          </p>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: 'Fira Code, monospace', color: isOn ? 'var(--text-primary)' : 'var(--text-label)' }}
          >
            {saving ? '…' : hvacTempDisplay(tempF)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip text="Lower AC temperature">
            <button
              disabled={saving || !isOn}
              onClick={() => updateHvac({ temperature: (tempF ?? 72) - 1 })}
              aria-label="Decrease AC temperature"
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
                transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ background: 'var(--btn-minus-bg)', border: '1px solid var(--btn-minus-border)' }}
            >
              <Minus size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </Tooltip>
          <Tooltip text="Raise AC temperature">
            <button
              disabled={saving || !isOn}
              onClick={() => updateHvac({ temperature: (tempF ?? 72) + 1 })}
              aria-label="Increase AC temperature"
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
                transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ background: 'var(--btn-plus-bg)', border: '1px solid var(--btn-plus-border)' }}
            >
              <Plus size={14} style={{ color: 'var(--accent)' }} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Mode + Fan row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Tooltip text="Set cooling, heating, fan-only, or dry mode" className="flex flex-col gap-1.5 w-full">
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>Mode</span>
            <CustomSelect
              value={normalizeMode(currentMode)}
              options={MODE_OPTIONS}
              onChange={val => updateHvac({ mode: val })}
              disabled={saving || !isOn}
            />
          </Tooltip>
        </div>
        <div className="flex flex-col gap-1.5">
          <Tooltip text="Set fan speed" className="flex flex-col gap-1.5 w-full">
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>Fan</span>
            <CustomSelect
              value={normalizeFan(currentFan)}
              options={FAN_OPTIONS}
              onChange={val => updateHvac({ 'fan-speed': val })}
              disabled={saving || !isOn}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default function RoomCard({ room, structureId, unit = 'F' }) {
  const attrs = room.attributes
  const name = attrs.name || 'Room'
  const currentTempC = attrs['current-temperature-c']
  const setPointC = attrs['set-point-temperature-c']
  const humidity = attrs['current-humidity']
  const active = attrs['active'] !== false

  const [expanded, setExpanded] = useState(false)

  const { data: pucks, isLoading: pucksLoading } = useRoomPucks(expanded ? room.id : null)
  const { data: puck2s, isLoading: puck2sLoading } = useRoomPuck2s(expanded ? room.id : null)
  const { data: vents, isLoading: ventsLoading } = useRoomVents(expanded ? room.id : null)
  const { mutate: updateRoom, isPending: saving, error: saveError } = useUpdateRoom(room.id, structureId)

  const primaryPuck = pucks?.[0]
  const primaryPuck2 = puck2s?.[0]
  const displayTemp = currentTempC
    ?? primaryPuck2?.attributes?.['current-temperature-c']
    ?? primaryPuck?.attributes?.['current-temperature-c']
  const displayHumidity = humidity
    ?? primaryPuck2?.attributes?.['current-humidity']
    ?? primaryPuck?.attributes?.['current-humidity']

  function adjustSetPoint(delta) {
    const stepC = unit === 'F' ? 5 / 9 : 0.5
    const next = (setPointC ?? 21) + delta * stepC
    updateRoom({ 'set-point-temperature-c': Math.round(next * 2) / 2 })
  }

  const detailLoading = pucksLoading || puck2sLoading || ventsLoading
  const hasPuck2 = puck2s?.length > 0
  const hasVents = vents?.length > 0

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
      {/* Header: room name + current temp */}
      <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            {name}
          </span>
          <Tooltip text={active ? 'Deactivate this room (closes vents)' : 'Activate this room'}>
            <button
              onClick={() => updateRoom({ active: !active })}
              disabled={saving}
              className="text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer
                transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border w-fit"
              style={active
                ? { background: 'var(--accent-bg)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }
                : { background: 'var(--btn-ghost-bg)', color: 'var(--text-muted)', borderColor: 'var(--border-default)' }
              }
            >
              {active ? 'Active' : 'Inactive'}
            </button>
          </Tooltip>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-5xl font-bold leading-none"
            style={{ fontFamily: 'Fira Code, monospace', color: 'var(--text-primary)' }}
          >
            {formatTemp(displayTemp, unit)}
          </span>
          {displayHumidity != null && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Droplets size={12} />
              <span className="text-xs font-medium">{Math.round(displayHumidity)}% RH</span>
            </div>
          )}
        </div>
      </div>

      {/* Set point control */}
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
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--error)' }}>
                  {saveError.message.includes('422') ? 'Switch structure to Manual mode first' : 'Failed to save'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tooltip text="Lower room set point">
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
              </Tooltip>
              <Tooltip text="Raise room set point">
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
              </Tooltip>
            </div>
          </div>
        </>
      )}

      {/* Expand toggle */}
      <div style={{ height: '1px', background: 'var(--divider)', margin: '0 24px' }} />
      <Tooltip text={expanded ? 'Collapse device and vent controls' : 'Expand device and vent controls'} className="w-full">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full px-6 py-3 flex items-center justify-between cursor-pointer
            transition-colors duration-150 hover:bg-white/[0.02]"
          aria-expanded={expanded}
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-xs font-medium uppercase tracking-wider">
            Device &amp; Vents
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </Tooltip>

      {expanded && (
        <div className="px-6 pb-6 flex flex-col gap-4">
          {detailLoading && (
            <div className="flex justify-center py-3"><Spinner size={18} /></div>
          )}

          {!detailLoading && hasPuck2 && (
            <HvacControls puck2Id={primaryPuck2.id} unit={unit} saving={saving} />
          )}

          {!detailLoading && hasVents && (
            <div className="flex flex-col gap-0.5">
              {hasPuck2 && (
                <div style={{ height: '1px', background: 'var(--divider)', margin: '4px 0 10px' }} />
              )}
              <span className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-label)' }}>
                Vents
              </span>
              {vents.map(v => <VentBar key={v.id} vent={v} roomId={room.id} />)}
            </div>
          )}

          {!detailLoading && !hasPuck2 && !hasVents && (
            <p className="text-xs text-center py-2" style={{ color: 'var(--text-label)' }}>No devices or vents</p>
          )}
        </div>
      )}
    </div>
  )
}
