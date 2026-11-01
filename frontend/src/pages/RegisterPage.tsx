import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'
import { authService } from '../services/authService'
import type { AuthUser, UserRole } from '../types/auth'

function RegisterPage() {
  const [role, setRole] = useState<UserRole>('CLIENT')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const value = (name: string) => String(formData.get(name) ?? '').trim()
    const base = { email: value('email'), password: value('password') }
    let payload: AuthUser

    if (role === 'CLIENT') {
      payload = {
        ...base,
        role,
        name: value('name'),
        cpf: value('cpf'),
        rg: value('rg'),
        profession: value('profession'),
      }
    } else if (role === 'COMPANY') {
      payload = {
        ...base,
        role,
        companyName: value('companyName'),
        cnpj: value('cnpj'),
      }
    } else {
      payload = {
        ...base,
        role,
        bankName: value('bankName'),
        cnpj: value('cnpj'),
        codeBank: value('codeBank'),
      }
    }

    try {
      await authService.register(payload)
      setMessage('Formulário validado em modo de demonstração. Nenhum dado foi enviado ou salvo; a API de cadastro ainda não está disponível.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível criar sua conta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page register-page">
      <Link className="wordmark auth-wordmark" to="/" aria-label="Veloce, início">
        <span className="wordmark-mark">V</span>
        <span>VELOCE<small>CAR RENTAL</small></span>
      </Link>
      <div className="auth-layout">
        <section className="auth-aside">
          <p className="eyebrow"><span /> SUA JORNADA COMEÇA AQUI</p>
          <h1>O próximo capítulo<br /><em>é seu.</em></h1>
          <p>Crie sua conta e descubra como é fácil transformar planos em destinos.</p>
          <div className="aside-note"><span>✳</span> Uma conta. Infinitas possibilidades.</div>
        </section>
        <section className="auth-card register-card" aria-labelledby="register-title">
          <div className="card-orb" aria-hidden="true">✳</div>
          <p className="eyebrow">É RÁPIDO E GRATUITO</p>
          <h2 id="register-title">Criar conta</h2>
          <p className="auth-subtitle">Conte um pouco sobre você para começar.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Quero me cadastrar como</span>
              <select
                value={role}
                onChange={(event) => {
                  const nextRole = event.target.value
                  if (nextRole === 'CLIENT' || nextRole === 'COMPANY' || nextRole === 'Bank') {
                    setRole(nextRole)
                  }
                }}
                name="role"
              >
                <option value="CLIENT">Cliente</option>
                <option value="COMPANY">Empresa</option>
                <option value="Bank">Banco</option>
              </select>
            </label>
            {role === 'CLIENT' && (
              <>
                <FormField id="client-name" label="Nome completo" name="name" placeholder="Como podemos te chamar?" autoComplete="name" required />
                <div className="field-row">
                  <FormField id="client-cpf" label="CPF" name="cpf" placeholder="000.000.000-00" required />
                  <FormField id="client-rg" label="RG" name="rg" placeholder="Seu RG" required />
                </div>
                <FormField id="client-profession" label="Profissão" name="profession" placeholder="Sua profissão" required />
              </>
            )}
            {role === 'COMPANY' && (
              <>
                <FormField id="company-name" label="Nome da empresa" name="companyName" placeholder="Razão social" required />
                <FormField id="company-cnpj" label="CNPJ" name="cnpj" placeholder="00.000.000/0000-00" required />
              </>
            )}
            {role === 'Bank' && (
              <>
                <FormField id="bank-name" label="Nome do banco" name="bankName" placeholder="Nome da instituição" required />
                <div className="field-row">
                  <FormField id="bank-cnpj" label="CNPJ" name="cnpj" placeholder="00.000.000/0000-00" required />
                  <FormField id="bank-code" label="Código do banco" name="codeBank" placeholder="Ex.: 001" required />
                </div>
              </>
            )}
            <FormField id="register-email" label="E-mail" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required />
            <FormField id="register-password" label="Senha" name="password" type="password" placeholder="Crie uma senha" autoComplete="new-password" required />
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar minha conta'} <span aria-hidden="true">↗</span>
            </PrimaryButton>
          </form>
          {message && <p className="form-message" role="status">{message}</p>}
          <p className="auth-switch">Já tem uma conta? <Link to="/login">Entrar</Link></p>
          <Link className="back-link" to="/">← Voltar para o início</Link>
        </section>
      </div>
    </main>
  )
}

export default RegisterPage
