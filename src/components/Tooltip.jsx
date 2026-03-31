import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Hover tooltip with 450ms delay.
 * Props:
 *   text      — tooltip string
 *   side      — 'top' (default) | 'bottom'
 *   className — wrapper display class (default: 'inline-flex')
 */
export default function Tooltip({ text, children, side = 'top', className = 'inline-flex' }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)
  const timer = useRef(null)

  function onEnter() {
    timer.current = setTimeout(() => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      setPos({
        left: r.left + r.width / 2 + window.scrollX,
        top: side === 'bottom'
          ? r.bottom + window.scrollY + 8
          : r.top  + window.scrollY - 8,
      })
      setShow(true)
    }, 450)
  }

  function onLeave() {
    clearTimeout(timer.current)
    setShow(false)
  }

  return (
    <span ref={ref} className={className} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {show && createPortal(
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            transform: side === 'bottom'
              ? 'translateX(-50%)'
              : 'translateX(-50%) translateY(-100%)',
            zIndex: 99999,
            background: 'var(--tooltip-bg)',
            color: 'var(--tooltip-text)',
            border: '1px solid var(--tooltip-border)',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: 'var(--tooltip-shadow)',
            letterSpacing: '0.01em',
            lineHeight: 1.5,
          }}
        >
          {text}
          {/* Arrow */}
          <span style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            ...(side === 'bottom' ? {
              top: -5,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid var(--tooltip-bg)',
            } : {
              bottom: -5,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid var(--tooltip-bg)',
            }),
          }} />
        </div>,
        document.body
      )}
    </span>
  )
}
