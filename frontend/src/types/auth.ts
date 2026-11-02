export type UserRole = 'CLIENT' | 'COMPANY' | 'Bank' 

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  name: string
  token: string
}

interface RegisterBase {
  name: string
  email: string
  password: string
}

export interface RegisterClientRequest extends RegisterBase {
  cpf: string
  rg: string
  profession: string
}

export interface RegisterCompanyRequest extends RegisterBase {
  companyName: string
  cnpj: string
}

export interface RegisterBankRequest extends RegisterBase {
  bankName: string
  cnpj: string
  codeBank: string
}

export type RegisterRequest =
  | { role: 'CLIENT'; payload: RegisterClientRequest }
  | { role: 'COMPANY'; payload: RegisterCompanyRequest }
  | { role: 'Bank'; payload: RegisterBankRequest }
