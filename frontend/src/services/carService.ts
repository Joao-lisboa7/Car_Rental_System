import type { Car } from '../types/car'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

type CarRegistration = Pick<
  Car,
  'registration' | 'brand' | 'model' | 'fabricationYear' | 'licensePlate' | 'available'
>

function isCar(value: unknown): value is Car {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'registration' in value &&
    typeof value.registration === 'string' &&
    'brand' in value &&
    typeof value.brand === 'string' &&
    'model' in value &&
    typeof value.model === 'string' &&
    'fabricationYear' in value &&
    typeof value.fabricationYear === 'number' &&
    'licensePlate' in value &&
    typeof value.licensePlate === 'string' &&
    'available' in value &&
    typeof value.available === 'boolean' &&
    'ownerName' in value &&
    typeof value.ownerName === 'string'
  )
}

async function getCars(path: '/cars/me' | '/cars/available'): Promise<Car[]> {
  const token = sessionStorage.getItem('authToken')
  if (!token) {
    throw new Error('Sua sessão expirou. Entre novamente para consultar os veículos.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Não foi possível carregar os veículos (HTTP ${response.status}).`)
  }

  const result: unknown = await response.json()
  if (!Array.isArray(result) || !result.every(isCar)) {
    throw new Error('A resposta da API de veículos é inválida.')
  }

  return result
}

async function postCar(payload: CarRegistration): Promise<void> {
  const token = sessionStorage.getItem('authToken')
  if (!token) {
    throw new Error('Sua sessão expirou. Entre novamente para cadastrar um veículo.')
  }

  const response = await fetch(`${API_BASE_URL}/cars`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Não foi possível cadastrar o veículo (HTTP ${response.status}).`)
  }
}

export const carService = {
  createCar(payload: CarRegistration) {
    return postCar(payload)
  },

  getMyCars() {
    return getCars('/cars/me')
  },

  getAvailableCars() {
    return getCars('/cars/available')
  },
}
