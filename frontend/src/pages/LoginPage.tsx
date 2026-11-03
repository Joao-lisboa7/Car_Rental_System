import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'
import { authService } from '../services/authService'
import type { LoginRequest } from '../types/auth'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
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
      navigate('/cars', { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page login-page">
      <header className="login-header">
        <Link className="wordmark auth-wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <p className="login-header-note"><span aria-hidden="true" /> EXPERIÊNCIA DE DIREÇÃO, SEM LIMITES</p>
      </header>
      <div className="auth-layout login-layout">
        <section className="auth-aside login-aside">
          <p className="eyebrow"><span /> BEM-VINDO DE VOLTA</p>
          <h1>O caminho<br />é <em>seu.</em></h1>
          <p>Acesse sua conta e retome a liberdade de ir mais longe, no seu tempo.</p>
          <div className="aside-note"><span aria-hidden="true">✳</span> Sua próxima jornada está a poucos cliques.</div>
        </section>
        <section className="auth-card login-card" aria-labelledby="login-title">
          <div className="login-card-top">
            <span className="card-orb" aria-hidden="true">✳</span>
            <span className="login-secure"><span aria-hidden="true">✓</span> ACESSO SEGURO</span>
          </div>
          <p className="eyebrow">SUA CONTA VELOCE</p>
          <h2 id="login-title">Bem-vindo de volta</h2>
          <p className="auth-subtitle">Informe seus dados para acessar sua conta.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <FormField id="login-email" label="E-mail" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required />
            <FormField id="login-password" label="Senha" name="password" type="password" placeholder="Sua senha" autoComplete="current-password" required />
            <Link className="forgot-link" to="/login">Esqueceu sua senha?</Link>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar na minha conta'} <span aria-hidden="true">↗</span>
            </PrimaryButton>
          </form>
          {message && <p className="form-message login-message" role="status" aria-live="polite" aria-atomic="true">{message}</p>}
          <div className="auth-divider"><span>OU</span></div>
          <p className="auth-switch">Ainda não tem uma conta? <Link to="/register">Criar conta</Link></p>
          <Link className="back-link" to="/">← Voltar para o início</Link>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
