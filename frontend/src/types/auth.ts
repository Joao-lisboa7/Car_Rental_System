export type UserRole = 'CLIENT' | 'COMPANY' | 'Bank' 

export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  id?: number
  email: string
  password: string
  role: UserRole
}

export interface IncomeSource {
  employerName: string
  income: number
}

export interface ClientUser extends User {
  role: 'CLIENT'
  name: string
  cpf: string
  rg: string
  profession: string
  incomeSources?: IncomeSource[]
}

export interface CompanyUser extends User {
  role: 'COMPANY'
  companyName: string
  cnpj: string
}

export interface BankUser extends User {
  role: 'Bank'
  bankName: string
  cnpj: string
  codeBank: string
}

export type AuthUser = ClientUser | CompanyUser | BankUser

// Registration requires email, password, role and the non-null fields for the
// selected role: name/cpf/rg/profession, companyName/cnpj, or bankName/cnpj/codeBank.
