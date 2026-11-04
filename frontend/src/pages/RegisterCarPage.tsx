import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'
import { authService } from '../services/authService'
import { carService } from '../services/carService'
import type { Car } from '../types/car'
import './RegisterCarPage.css'

type CarRegistration = Pick<
  Car,
  'registration' | 'brand' | 'model' | 'fabricationYear' | 'licensePlate' | 'available'
>

type FormFeedback =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }
  | null

function RegisterCarPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FormFeedback>(null)
  const submissionInProgress = useRef(false)

  function handleLogout() {
    authService.logout()
    navigate('/login', { replace: true })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submissionInProgress.current) return

    setFeedback(null)
    const formData = new FormData(event.currentTarget)
    const value = (name: string) => String(formData.get(name) ?? '').trim()
    const fabricationYear = Number(value('fabricationYear'))

    if (!value('registration') || !value('brand') || !value('model') || !value('licensePlate')) {
      setFeedback({ kind: 'error', message: 'Preencha todos os campos obrigatórios.' })
      return
    }

    if (!Number.isInteger(fabricationYear)) {
      setFeedback({ kind: 'error', message: 'Informe um ano de fabricação válido.' })
      return
    }

    const payload: CarRegistration = {
      registration: value('registration'),
      brand: value('brand'),
      model: value('model'),
      fabricationYear,
      licensePlate: value('licensePlate'),
      available: formData.get('available') === 'on',
    }

    submissionInProgress.current = true
    setIsSubmitting(true)

    try {
      await carService.createCar(payload)
      setFeedback({ kind: 'success', message: 'Veículo cadastrado com sucesso.' })
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível cadastrar o veículo. Tente novamente.',
      })
    } finally {
      submissionInProgress.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <main className="register-car-page">
      <header className="register-car-header">
        <Link className="wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <div className="register-car-actions">
          <Link className="register-car-back" to="/cars">← Voltar para meus carros</Link>
          <button className="logout-button" type="button" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <div className="register-car-content">
        <section className="register-car-intro">
          <p className="eyebrow"><span /> SUA GARAGEM</p>
          <h1>Um novo carro<br />na sua <em>jornada.</em></h1>
          <p>Cadastre os dados do veículo para adicioná-lo à sua garagem.</p>
        </section>

        <section className="register-car-card" aria-labelledby="register-car-title">
          <div className="register-car-orb" aria-hidden="true">✳</div>
          <p className="eyebrow">CADASTRO DE VEÍCULO</p>
          <h2 id="register-car-title">Adicionar carro</h2>
          <p className="register-car-subtitle">Informe os dados conforme constam nos documentos do veículo.</p>

          {feedback?.kind === 'success' ? (
            <div className="register-car-success" role="status">
              <p>{feedback.message}</p>
              <Link className="button-link" to="/cars">Ir para meus carros <span aria-hidden="true">↗</span></Link>
            </div>
          ) : (
            <form className="register-car-form" onSubmit={handleSubmit}>
              <FormField
                id="car-registration"
                label="Matrícula"
                name="registration"
                placeholder="Matrícula do veículo"
                autoComplete="off"
                required
              />
              <div className="register-car-field-row">
                <FormField
                  id="car-brand"
                  label="Marca"
                  name="brand"
                  placeholder="Ex.: Toyota"
                  autoComplete="off"
                  required
                />
                <FormField
                  id="car-model"
                  label="Modelo"
                  name="model"
                  placeholder="Ex.: Corolla"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="register-car-field-row">
                <FormField
                  id="car-year"
                  label="Ano de fabricação"
                  name="fabricationYear"
                  type="number"
                  step="1"
                  placeholder="Ex.: 2022"
                  required
                />
                <FormField
                  id="car-plate"
                  label="Placa"
                  name="licensePlate"
                  placeholder="Placa do veículo"
                  autoComplete="off"
                  required
                />
              </div>
              <label className="register-car-availability">
                <input type="checkbox" name="available" />
                <span>
                  <strong>Disponível para aluguel</strong>
                  <small>Opcional. Seu carro ficará indisponível por padrão.</small>
                </span>
              </label>

              {feedback?.kind === 'error' && <p className="register-car-feedback is-error" role="alert">{feedback.message}</p>}

              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Cadastrando veículo...' : 'Cadastrar veículo'} <span aria-hidden="true">↗</span>
              </PrimaryButton>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}

export default RegisterCarPage
