import { ApiError } from '../api/errors'
import type { BotStatus, LoginResponse } from '../api/types'

// Còn giữ mock cho phần BE chưa có: đăng nhập (POST /api/auth/login) và trạng thái bot (Sidebar).
// Các khối dashboard đã gọi API thật.
export const DEMO_EMAIL = 'admin@storagemate.vn'
export const DEMO_PASSWORD = 'storagemate123'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function login(email: string, password: string): Promise<LoginResponse> {
  await wait(500)
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new ApiError(401, 'Sai email hoặc mật khẩu.')
  }
  return {
    access_token: 'mock.' + btoa(email) + '.' + Date.now(),
    token_type: 'bearer',
    admin: { email: DEMO_EMAIL, name: 'Chủ quán' },
  }
}

export async function getBotStatus(): Promise<BotStatus> {
  await wait(250)
  return {
    botName: 'Bot Storagemate',
    webhookOk: true,
    lastMessageAt: '2026-10-31T17:12:00+07:00',
    queueSize: 0,
    pendingLabels: 14,
  }
}
