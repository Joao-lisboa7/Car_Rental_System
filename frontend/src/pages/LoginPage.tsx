import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'
import { authService } from '../services/authService'
import type { LoginRequest } from '../types/auth'

function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload: LoginRequest = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    }

    try {
      await authService.login(payload)
      setMessage('Login realizado com sucesso.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <Link className="wordmark auth-wordmark" to="/" aria-label="Veloce, início">
        <span className="wordmark-mark">V</span>
        <span>VELOCE<small>CAR RENTAL</small></span>
      </Link>
      <div className="auth-layout">
        <section className="auth-aside">
          <p className="eyebrow"><span /> BEM-VINDO DE VOLTA</p>
          <h1>Pronto para<br /><em>seguir viagem?</em></h1>
          <p>Acesse sua conta e continue de onde a próxima aventura começa.</p>
          <div className="aside-note"><span>✳</span> Sua próxima jornada está a poucos cliques.</div>
        </section>
        <section className="auth-card" aria-labelledby="login-title">
          <div className="card-orb" aria-hidden="true">✳</div>
          <p className="eyebrow">SUA CONTA VELOCE</p>
          <h2 id="login-title">Entrar</h2>
          <p className="auth-subtitle">Informe seus dados para acessar sua conta.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <FormField id="login-email" label="E-mail" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required />
            <FormField id="login-password" label="Senha" name="password" type="password" placeholder="Sua senha" autoComplete="current-password" required />
            <Link className="forgot-link" to="/login">Esqueceu sua senha?</Link>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar na minha conta'} <span aria-hidden="true">↗</span>
            </PrimaryButton>
          </form>
          {message && <p className="form-message" role="status">{message}</p>}
          <div className="auth-divider"><span>OU</span></div>
          <p className="auth-switch">Ainda não tem uma conta? <Link to="/register">Criar conta</Link></p>
          <Link className="back-link" to="/">← Voltar para o início</Link>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
