import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const AUTH_TOKEN_KEY = 'authToken'

function isAuthResponse(value: unknown): value is AuthResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof value.name === 'string' &&
    'token' in value &&
    typeof value.token === 'string'
  )
}

async function postJson(path: string, payload: LoginRequest | RegisterRequest['payload']): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `A solicitação falhou (HTTP ${response.status}).`)
  }

  const result: unknown = await response.json()
  if (!isAuthResponse(result)) {
    throw new Error('A resposta da API de autenticação é inválida.')
  }

  sessionStorage.setItem(AUTH_TOKEN_KEY, result.token)
  return result
}

export const authService = {
  login(payload: LoginRequest) {
    return postJson('/auth/login', payload)
  },

  register({ role, payload }: RegisterRequest) {
    const paths = {
      CLIENT: '/auth/register/client',
      COMPANY: '/auth/register/company',
      Bank: '/auth/register/bank',
    } satisfies Record<RegisterRequest['role'], string>

    return postJson(paths[role], payload)
  },
}
