import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export default function CustomSelect({ value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function handleOpen() {
    if (disabled) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    })
    setOpen(o => !o)
  }

  const selected = options.find(o => o.value === value)

  return (
    <div ref={triggerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2
          text-xs font-semibold cursor-pointer transition-all duration-150
          disabled:opacity-25 disabled:cursor-not-allowed"
        style={{
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          outline: 'none',
        }}
      >
        <span>{selected?.label ?? value ?? '—'}</span>
        <ChevronDown
          size={12}
          style={{
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
            flexShrink: 0,
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
            width: pos.width,
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
                role="option"
                aria-selected={isActive}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-xs font-semibold cursor-pointer
                  transition-colors duration-100"
                style={{
                  background: isActive ? 'var(--dropdown-active-bg)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--dropdown-hover)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
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
