import { Home, ChevronRight } from 'lucide-react'
import { useStructures } from '../hooks/useFlair'
import { formatTemp } from './TempDisplay'
import Spinner from './Spinner'

export default function StructureList({ unit, onSelect }) {
  const { data: structures, isLoading, error, refetch } = useStructures()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="font-semibold" style={{ color: 'var(--error)' }}>Failed to load homes</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{error.message}</p>
        <button
          onClick={refetch}
          className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer
            transition-all duration-150"
          style={{ background: 'var(--retry-bg)', color: 'var(--retry-color)', border: '1px solid var(--retry-border)' }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!structures?.length) {
    return <p className="text-center py-16" style={{ color: 'var(--text-label)' }}>No homes found on this account.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-medium uppercase tracking-widest px-1" style={{ color: 'var(--text-label)' }}>
        Your Homes
      </p>
      {structures.map(s => {
        const attrs = s.attributes
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="rounded-3xl px-6 py-5 flex items-center gap-5 text-left w-full
              cursor-pointer transition-all duration-200"
            style={{
              background: 'var(--card-gradient)',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                width: '52px', height: '52px',
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
              }}
            >
              <Home size={24} style={{ color: 'var(--accent)' }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                {attrs.name || 'Home'}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className="text-xs capitalize px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--badge-mode-bg)', color: 'var(--badge-mode-color)' }}
                >
                  {attrs.mode || 'auto'}
                </span>
                {attrs['set-point-temperature-c'] != null && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Fira Code, monospace' }}>
                    {formatTemp(attrs['set-point-temperature-c'], unit)}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight size={18} style={{ color: 'var(--text-label)', transition: 'color 200ms' }} />
          </button>
        )
      })}
    </div>
  )
}
