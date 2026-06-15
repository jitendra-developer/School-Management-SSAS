import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface AppearanceSettings {
  theme: Theme
  sidebarCompact: boolean
}

interface ThemeContextValue {
  settings: AppearanceSettings
  updateSettings: (patch: Partial<AppearanceSettings>) => void
}

const STORAGE_KEY = 'bright_future_settings'

const defaults: AppearanceSettings = {
  theme: 'light',
  sidebarCompact: false,
}

function load(): AppearanceSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        theme: parsed.appearance?.theme ?? defaults.theme,
        sidebarCompact: parsed.appearance?.sidebarCompact ?? defaults.sidebarCompact,
      }
    }
  } catch {}
  return defaults
}

function save(settings: AppearanceSettings) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    existing.appearance = settings
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {}
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(load)

  useEffect(() => {
    applyTheme(settings.theme)
    save(settings)
  }, [settings])

  useEffect(() => {
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.theme])

  const updateSettings = (patch: Partial<AppearanceSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }))

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
