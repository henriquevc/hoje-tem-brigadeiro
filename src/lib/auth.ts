const SESSION_KEY = 'htb-auth'

export const appPassword = (import.meta.env.VITE_APP_PASSWORD as string | undefined)?.trim() ?? ''

export const isPasswordRequired = Boolean(appPassword)

export function hasActiveSession(): boolean {
  if (!isPasswordRequired) return true
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function createSession(): void {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function verifyPassword(password: string): boolean {
  if (!isPasswordRequired) return true
  return password === appPassword
}
