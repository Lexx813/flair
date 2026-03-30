import { Home, ChevronRight } from 'lucide-react'
import { useStructures } from '../hooks/useFlair'
import { formatTemp } from './TempDisplay'

export default function StructureList({ unit, onSelect }) {
  const { data: structures, isLoading, error, refetch } = useStructures()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: 'var(--bg-surface)' }} />
        {[1, 2].map(i => (
          <div
            key={i}
            className="rounded-3xl px-6 py-5 flex items-center gap-5 animate-pulse"
            style={{ background: 'var(--card-gradient)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--card-shadow)' }}
          >
            <div className="rounded-2xl shrink-0" style={{ width: 52, height: 52, background: 'var(--bg-surface-2)' }} />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-32 rounded-full" style={{ background: 'var(--bg-surface-2)' }} />
              <div className="h-3 w-16 rounded-full" style={{ background: 'var(--bg-surface-2)' }} />
            </div>
          </div>
        ))}
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
              cursor-pointer transition-all duration-200 group"
            style={{
              background: 'var(--card-gradient)',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-border-strong)'
              e.currentTarget.style.boxShadow = 'var(--card-shadow), 0 0 0 1px var(--accent-border)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.boxShadow = 'var(--card-shadow)'
            }}
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

            <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: 'var(--text-label)' }} />
          </button>
        )
      })}
    </div>
  )
}
