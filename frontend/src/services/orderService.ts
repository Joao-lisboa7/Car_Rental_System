import type {
  ClientSummary,
  CreateRentalOrder,
  EvaluateRentalOrder,
  OrderStatus,
  RentalOrder,
  UpdateRentalOrder,
} from '../types/order'
import type { Car } from '../types/car'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function isCar(value: unknown): value is Car {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value && typeof value.id === 'number' &&
    'registration' in value && typeof value.registration === 'string' &&
    'brand' in value && typeof value.brand === 'string' &&
    'model' in value && typeof value.model === 'string' &&
    'fabricationYear' in value && typeof value.fabricationYear === 'number' &&
    'licensePlate' in value && typeof value.licensePlate === 'string' &&
    'available' in value && typeof value.available === 'boolean' &&
    'ownerName' in value && typeof value.ownerName === 'string'
  )
}

function isClientSummary(value: unknown): value is ClientSummary {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value && typeof value.name === 'string' &&
    'profession' in value && typeof value.profession === 'string' &&
    'totalIncome' in value && typeof value.totalIncome === 'number'
  )
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === 'CRIADO' ||
    value === 'EM_ANALISE' ||
    value === 'APROVADO' ||
    value === 'REJEITADO' ||
    value === 'CANCELADO'
  )
}

function isRentalOrder(value: unknown): value is RentalOrder {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'clientName' in value &&
    typeof value.clientName === 'string' &&
    'clientSummary' in value &&
    (value.clientSummary === null || isClientSummary(value.clientSummary)) &&
    'car' in value && isCar(value.car) &&
    'status' in value && isOrderStatus(value.status) &&
    'clientNotes' in value && (typeof value.clientNotes === 'string' || value.clientNotes === null) &&
    'agentOpinion' in value && (typeof value.agentOpinion === 'string' || value.agentOpinion === null) &&
    'evaluatedById' in value && (typeof value.evaluatedById === 'number' || value.evaluatedById === null) &&
    'evaluatedByName' in value && (typeof value.evaluatedByName === 'string' || value.evaluatedByName === null) &&
    'createdAt' in value &&
    typeof value.createdAt === 'string' &&
    'updatedAt' in value &&
    typeof value.updatedAt === 'string'
  )
}

async function request<T>(
  path: string,
  options: { method?: string; body?: object } = {},
  validate: (value: unknown) => value is T,
): Promise<T> {
  const token = sessionStorage.getItem('authToken')
  if (!token) throw new Error('Sua sessão expirou. Entre novamente para continuar.')

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (options.body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `A solicitação falhou (HTTP ${response.status}).`)
  }

  const result: unknown = await response.json()
  if (!validate(result)) {
    throw new Error('A resposta da API de pedidos é inválida.')
  }
  return result
}

function isOrderList(value: unknown): value is RentalOrder[] {
  return Array.isArray(value) && value.every(isRentalOrder)
}

export const orderService = {
  create(payload: CreateRentalOrder) {
    return request('/orders', { method: 'POST', body: payload }, isRentalOrder)
  },

  listMine() {
    return request('/orders/me', {}, isOrderList)
  },

  getMine(id: number) {
    return request(`/orders/me/${id}`, {}, isRentalOrder)
  },

  updateMine(id: number, payload: UpdateRentalOrder) {
    return request(`/orders/me/${id}`, { method: 'PUT', body: payload }, isRentalOrder)
  },

  cancelMine(id: number) {
    return request(`/orders/me/${id}/cancel`, { method: 'PATCH' }, isRentalOrder)
  },

  listForAgent(status?: OrderStatus) {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    return request(`/orders/agent${query}`, {}, isOrderList)
  },

  getForAgent(id: number) {
    return request(`/orders/agent/${id}`, {}, isRentalOrder)
  },

  evaluate(id: number, payload: EvaluateRentalOrder) {
    if (!isOrderStatus(payload.status)) throw new Error('Status de avaliação inválido.')
    return request(`/orders/agent/${id}/evaluate`, { method: 'PATCH', body: payload }, isRentalOrder)
  },
}
