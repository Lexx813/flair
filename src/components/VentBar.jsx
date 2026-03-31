import { Wind } from 'lucide-react'
import { useUpdateVent } from '../hooks/useFlair'
import Tooltip from './Tooltip'

const STEPS = [0, 25, 50, 75, 100]

export default function VentBar({ vent, roomId }) {
  const attrs = vent.attributes
  const percent = attrs['percent-open'] ?? 0
  const name = attrs.name || 'Vent'
  const inactive = attrs['inactive'] === true

  const { mutate, isPending } = useUpdateVent(vent.id, roomId)

  return (
    <div className="flex items-center gap-3 py-1">
      <Wind size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <span className="text-xs truncate w-20" style={{ color: 'var(--text-muted)' }}>{name}</span>
      <div className="flex gap-1.5 flex-1">
        {STEPS.map(step => (
          <Tooltip key={step} text={step === 0 ? 'Close vent' : `Open vent to ${step}%`}>
            <button
              disabled={isPending || inactive}
              onClick={() => mutate({ 'percent-open': step })}
              className="flex-1 min-h-[44px] rounded-xl text-[10px] font-semibold cursor-pointer
                transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed border active:scale-95"
              style={
                step > 0 && percent >= step
                  ? { background: 'var(--vent-on-bg)', color: 'var(--vent-on-color)', borderColor: 'var(--vent-on-border)' }
                  : step === 0 && percent === 0
                    ? { background: 'var(--vent-off-bg)', color: 'var(--vent-off-color)', borderColor: 'var(--vent-off-border)' }
                    : { background: 'var(--vent-inactive-bg)', color: 'var(--vent-inactive-color)', borderColor: 'var(--vent-inactive-border)' }
              }
            >
              {step === 0 ? '✕' : `${step}`}
            </button>
          </Tooltip>
        ))}
      </div>
      <span
        className="text-[10px] w-7 text-right"
        style={{ color: 'var(--text-muted)', fontFamily: 'Fira Code, monospace' }}
      >
        {percent}%
      </span>
    </div>
  )
}
