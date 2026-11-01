import type { AuthUser, LoginRequest } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function postJson(path: string, payload: LoginRequest | AuthUser): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`A solicitação falhou (HTTP ${response.status}).`)
  }
}

export const authService = {
  login(payload: LoginRequest) {
    return postJson('/auth/login', payload)
  },

  register(_payload: AuthUser): Promise<void> {
    return Promise.resolve()
  },
}
