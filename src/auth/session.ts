import type { AdminInfo } from '../api/types'

const TOKEN_KEY = 'sm_token'
const ADMIN_KEY = 'sm_admin'

// Hackathon: lưu localStorage cho đơn giản. Bản thật nên chuyển sang cookie httpOnly.
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getAdmin(): AdminInfo | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? (JSON.parse(raw) as AdminInfo) : null
  } catch {
    return null
  }
}

export function saveSession(token: string, admin: AdminInfo): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  } catch {
    /* bỏ qua: trình duyệt chặn storage */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  } catch {
    /* bỏ qua */
  }
}
