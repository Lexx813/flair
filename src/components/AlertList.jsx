import { AlertTriangle, Info } from 'lucide-react'

function severity(attrs) {
  const s = (attrs.severity ?? attrs.priority ?? '').toLowerCase()
  if (s === 'critical' || s === 'high' || s === 'error') return 'error'
  if (s === 'warning' || s === 'medium') return 'warning'
  return 'info'
}

export default function AlertList({ alerts }) {
  if (!alerts?.length) return null

  return (
    <div className="flex flex-col gap-2">
      {alerts.map(alert => {
        const attrs = alert.attributes
        const level = severity(attrs)
        const title = attrs.title ?? attrs.description ?? attrs.message ?? 'System Alert'
        const detail = attrs.title ? (attrs.description ?? attrs.message) : null

        const colors = level === 'error'
          ? { bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)', icon: 'var(--error)' }
          : level === 'warning'
            ? { bg: 'var(--warning-bg)', border: 'var(--warning-border)', icon: 'var(--warning)' }
            : { bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.25)', icon: 'var(--hold-color)' }

        const Icon = level === 'info' ? Info : AlertTriangle

        return (
          <div
            key={alert.id}
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <Icon size={15} className="flex-shrink-0 mt-0.5" style={{ color: colors.icon }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: colors.icon }}>{title}</p>
              {detail && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{detail}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
