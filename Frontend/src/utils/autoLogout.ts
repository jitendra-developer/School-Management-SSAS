import { storage } from './storage'

export function scheduleAutoLogout(onExpired: () => void): number | undefined {
  const ms = storage.getTokenExpiresInMs()
  if (ms === null || ms <= 0) return undefined
  return window.setTimeout(() => {
    storage.clearAuth()
    onExpired()
    window.location.href = '/login'
  }, ms)
}
