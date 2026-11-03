import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { carService } from '../services/carService'
import type { Car } from '../types/car'
import './CarsPage.css'

type CarsState =
  | { status: 'loading'; cars: Car[] }
  | { status: 'success'; cars: Car[] }
  | { status: 'error'; cars: Car[]; message: string }

const loadingState: CarsState = { status: 'loading', cars: [] }

function fetchCarLists() {
  return Promise.allSettled([carService.getMyCars(), carService.getAvailableCars()])
}

function stateFromResult(result: PromiseSettledResult<Car[]>): CarsState {
  return result.status === 'fulfilled'
    ? { status: 'success', cars: result.value }
    : { status: 'error', cars: [], message: errorMessage(result.reason) }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao carregar os veículos.'
}

function CarsSection({
  title,
  description,
  state,
  kind,
  onRetry,
}: {
  title: string
  description: string
  state: CarsState
  kind: 'owned' | 'available'
  onRetry: () => void
}) {
  return (
    <section className="cars-section" aria-labelledby={`${kind}-cars-title`}>
      <div className="cars-section-heading">
        <div>
          <p className="eyebrow"><span /> {kind === 'owned' ? 'SUA GARAGEM' : 'ENCONTRE SEU PRÓXIMO CARRO'}</p>
          <h2 id={`${kind}-cars-title`}>{title}</h2>
          <p>{description}</p>
        </div>
        {state.status === 'success' && (
          <span className="cars-count">{state.cars.length.toString().padStart(2, '0')} veículos</span>
        )}
      </div>

      {state.status === 'loading' && (
        <div className="cars-grid" aria-label={`Carregando ${title.toLowerCase()}`} aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div className="car-skeleton" key={item}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="cars-message cars-error" role="alert">
          <span className="cars-message-icon" aria-hidden="true">!</span>
          <div>
            <h3>Não foi possível carregar esta lista</h3>
            <p>{state.message}</p>
            <button type="button" className="cars-text-button" onClick={onRetry}>Tentar novamente <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      )}

      {state.status === 'success' && state.cars.length === 0 && (
        <div className="cars-message cars-empty">
          <span className="cars-message-icon" aria-hidden="true">✳</span>
          <div>
            <h3>{kind === 'owned' ? 'Sua garagem está pronta para começar' : 'Nenhum carro disponível no momento'}</h3>
            <p>{kind === 'owned' ? 'Cadastre um veículo para organizar sua garagem.' : 'Volte em breve para conferir novas opções para sua próxima viagem.'}</p>
            {kind === 'owned' && <Link className="cars-text-button" to="/cars/register">Cadastrar meu carro <span aria-hidden="true">↗</span></Link>}
          </div>
        </div>
      )}

      {state.status === 'success' && state.cars.length > 0 && (
        <div className="cars-grid">
          {state.cars.map((car) => (
            <article className="car-card" key={car.id}>
              <div className="car-card-top">
                <span className="car-emblem" aria-hidden="true">V</span>
                <span className={`car-status ${kind === 'available' || car.available ? 'is-available' : 'is-unavailable'}`}>
                  <span aria-hidden="true" />
                  {kind === 'available' ? 'Disponível para aluguel' : car.available ? 'Disponível para aluguel' : 'Não disponível para aluguel'}
                </span>
              </div>
              <h3>{car.brand} <em>{car.model}</em></h3>
              <p className="car-owner">{kind === 'available' ? `Anunciado por ${car.ownerName}` : 'Cadastrado por você'}</p>
              <div className="car-details">
                <div><span>Ano</span><strong>{car.fabricationYear}</strong></div>
                <div><span>Placa</span><strong>{car.licensePlate}</strong></div>
                <div><span>Matrícula</span><strong>{car.registration}</strong></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function CarsPage() {
  const [myCars, setMyCars] = useState<CarsState>(loadingState)
  const [availableCars, setAvailableCars] = useState<CarsState>(loadingState)

  const retryCars = useCallback(() => {
    setMyCars(loadingState)
    setAvailableCars(loadingState)
    void fetchCarLists().then(([myCarsResult, availableCarsResult]) => {
      setMyCars(stateFromResult(myCarsResult))
      setAvailableCars(stateFromResult(availableCarsResult))
    })
  }, [])

  useEffect(() => {
    let isMounted = true
    void fetchCarLists().then(([myCarsResult, availableCarsResult]) => {
      if (!isMounted) return
      setMyCars(stateFromResult(myCarsResult))
      setAvailableCars(stateFromResult(availableCarsResult))
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="cars-page">
      <header className="cars-header">
        <Link className="wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <nav className="cars-nav" aria-label="Navegação da garagem">
          <Link to="/">Início</Link>
          <Link className="button-link" to="/cars/register">Registrar veículo <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <div className="cars-content">
        <section className="cars-intro">
          <p className="eyebrow"><span /> MOBILIDADE NO SEU TEMPO</p>
          <h1>Seu próximo caminho<br />começa <em>aqui.</em></h1>
          <p>Gerencie seus veículos e descubra carros disponíveis para uma nova jornada.</p>
        </section>

        <CarsSection
          title="Meus carros cadastrados"
          description="Veículos associados à sua conta."
          state={myCars}
          kind="owned"
          onRetry={retryCars}
        />
        <CarsSection
          title="Carros disponíveis para aluguel"
          description="Veículos que seus proprietários disponibilizaram para aluguel."
          state={availableCars}
          kind="available"
          onRetry={retryCars}
        />
      </div>

      <footer className="cars-footer">
        <Link className="wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <span>Liberdade em cada quilômetro.</span>
      </footer>
    </main>
  )
}

export default CarsPage
