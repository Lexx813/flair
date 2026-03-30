---
name: Flair Dashboard UI & Design System
description: Visual design conventions, theming architecture, component patterns, and known unused files
type: project
---

**Theming Architecture:**
- CSS custom properties defined in `src/index.css` on `:root` (dark defaults) and `[data-theme="light"]`
- Theme is toggled by setting `document.documentElement.dataset.theme` in `App.jsx`
- Smooth transitions via `.theme-transition` class added/removed for 300ms on toggle
- All color values in components use `var(--variable)` inline styles — never hardcoded hex
- `body { background: var(--bg-base); color: var(--text-primary); }` handles base theming

**Key CSS Variable Groups:**
- `--bg-*` backgrounds, `--text-*` text colors, `--border-*` borders
- `--accent`, `--accent-bg`, `--accent-border*` for green accent
- `--card-gradient`, `--card-shadow` for card surfaces
- `--dropdown-*` for CustomSelect styling
- `--pill-*`, `--setpoint-*`, `--power-*`, `--vent-*`, `--badge-*` for specific components

**Custom Dropdown:**
- `src/components/CustomSelect.jsx` — replaces native `<select>` in RoomCard HVAC controls
- Props: `{ value, options: [{value, label}], onChange, disabled }`
- Click-outside detection via `mousedown` listener on `document`
- Uses `--dropdown-*` CSS variables for styling in both themes

**Visual Style:**
- OLED dark theme (default) with green accent `#22C55E` / light mode accent `#16A34A`
- Glass-morphism navbar (backdrop blur)
- Gradient backgrounds on cards via `--card-gradient`
- Smooth transitions: 150–300ms on all interactive elements
- Fira Code (monospace) for temperatures/numbers, Fira Sans for body text

**Component Patterns:**
- Expandable room cards: Puck2/vent data lazy-loads when expanded
- Temperature fallback: room → Puck2 → Puck (priority order)
- Set point increments: 0.5°C steps (matches Flair API precision)
- Vent control: 5-step buttons (0%, 25%, 50%, 75%, 100%)

**Known Gaps / Unused Code:**
- `Puck2Card.jsx` — present but not imported anywhere (design exploration artifact)
- `App.css` — exists but unused; Tailwind handles all styling

**How to apply:** All new components must use `var(--...)` CSS variables. Follow MASTER.md for design decisions. Keep dark/OLED aesthetic as default. No slow animations or automation delays.
