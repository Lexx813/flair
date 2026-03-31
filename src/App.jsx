import { useState, useCallback } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { Wind, Sun, Moon, Menu } from 'lucide-react'
import Tooltip from './components/Tooltip'
import StructureList from './components/StructureList'
import StructureView from './components/StructureView'
import Sidebar from './components/Sidebar'

function StructureViewRoute({ unit }) {
  const { id } = useParams()
  const navigate = useNavigate()
  return <StructureView structureId={id} unit={unit} onBack={() => navigate('/')} />
}

export default function App() {
  const navigate = useNavigate()
  const [unit, setUnit] = useState('F')
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    const initial = saved === 'light' ? 'light' : 'dark'
    document.documentElement.dataset.theme = initial
    return initial
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleTheme = useCallback(() => {
    const html = document.documentElement
    html.classList.add('theme-transition')
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      html.dataset.theme = next
      localStorage.setItem('theme', next)
      return next
    })
    setTimeout(() => html.classList.remove('theme-transition'), 300)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Nav */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--nav-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Menu + Brand */}
          <div className="flex items-center gap-3">
          <Tooltip text="Navigation menu" side="bottom">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150"
              style={{ background: 'var(--btn-ghost-bg)', border: '1px solid var(--btn-ghost-border)' }}
            >
              <Menu size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </Tooltip>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-bg)' }}
            >
              <Wind size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Flair
            </span>
          </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Tooltip text={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} side="bottom">
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer
                  transition-all duration-150"
                style={{
                  background: 'var(--btn-ghost-bg)',
                  border: '1px solid var(--btn-ghost-border)',
                }}
              >
                {theme === 'dark'
                  ? <Sun size={15} style={{ color: 'var(--text-secondary)' }} />
                  : <Moon size={15} style={{ color: 'var(--text-secondary)' }} />
                }
              </button>
            </Tooltip>

            {/* Temp unit toggle */}
            <Tooltip text={`Switch to °${unit === 'F' ? 'C' : 'F'}`} side="bottom">
              <button
                onClick={() => setUnit(u => u === 'F' ? 'C' : 'F')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer
                  transition-all duration-150"
                style={{
                  background: 'var(--btn-ghost-bg)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--btn-ghost-border)',
                }}
              >
                °{unit === 'F' ? 'C' : 'F'}
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-5 py-7">
        <Routes>
          <Route path="/" element={<StructureList unit={unit} onSelect={id => navigate(`/structure/${id}`)} />} />
          <Route path="/structure/:id" element={<StructureViewRoute unit={unit} />} />
        </Routes>
      </main>
    </div>
  )
}
