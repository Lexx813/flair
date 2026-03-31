import { useEffect } from 'react'
import {
  Settings, BarChart, Wrench, BookOpen, Home,
  HelpCircle, Bell, User, Tag, LogOut, X, ToggleRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: Settings,   label: 'Home Settings' },
  { icon: BarChart,   label: 'Home Statistics' },
  { divider: true },
  { icon: Wrench,     label: 'Home Logs' },
  { icon: BookOpen,   label: 'Home Manual' },
  { icon: Home,       label: 'Occupancy Explanations' },
  { divider: true },
  { icon: HelpCircle, label: 'Get Support' },
  { icon: Bell,       label: 'Notifications' },
  { icon: User,       label: 'Account Settings' },
  { icon: Tag,        label: 'Offers & Deals' },
  { divider: true },
  { icon: LogOut,     label: 'Sign Out', danger: true },
]

export default function Sidebar({ open, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: 260,
          background: 'var(--card-gradient)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 h-14 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-bg)' }}
            >
              <ToggleRight size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Menu
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all active:scale-90"
            style={{ background: 'var(--btn-ghost-bg)', border: '1px solid var(--btn-ghost-border)' }}
          >
            <X size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map((item, i) => {
            if (item.divider) {
              return <div key={i} style={{ height: '1px', background: 'var(--divider)', margin: '6px 16px' }} />
            }
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-5 py-2.5 min-h-[44px] text-sm cursor-pointer transition-colors duration-150 text-left active:scale-[0.98]"
                style={{ color: item.danger ? 'var(--error)' : 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--dropdown-hover)'
                  e.currentTarget.style.color = item.danger ? 'var(--error)' : 'var(--text-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = item.danger ? 'var(--error)' : 'var(--text-secondary)'
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
