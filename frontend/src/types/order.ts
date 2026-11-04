import type { Car } from './car'

export type OrderStatus = 'CRIADO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO'

export interface ClientSummary {
  name: string
  profession: string
  totalIncome: number
}

export interface RentalOrder {
  id: number
  clientName: string
  clientSummary: ClientSummary | null
  car: Car
  status: OrderStatus
  clientNotes: string | null
  agentOpinion: string | null
  evaluatedById: number | null
  evaluatedByName: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRentalOrder {
  carId: number
  clientNotes?: string
}

export interface UpdateRentalOrder {
  clientNotes?: string
}

export interface EvaluateRentalOrder {
  status: Extract<OrderStatus, 'EM_ANALISE' | 'APROVADO' | 'REJEITADO'>
  agentOpinion?: string
}
