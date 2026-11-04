import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { orderService } from '../services/orderService'
import type { EvaluateRentalOrder, OrderStatus, RentalOrder } from '../types/order'
import './AgentOrdersPage.css'

type FilterStatus = 'ALL' | OrderStatus

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Criado', value: 'CRIADO' },
  { label: 'Em Análise', value: 'EM_ANALISE' },
  { label: 'Aprovado', value: 'APROVADO' },
  { label: 'Rejeitado', value: 'REJEITADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return isoString
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return isoString
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'CRIADO':
      return 'Criado'
    case 'EM_ANALISE':
      return 'Em Análise'
    case 'APROVADO':
      return 'Aprovado'
    case 'REJEITADO':
      return 'Rejeitado'
    case 'CANCELADO':
      return 'Cancelado'
    default:
      return status
  }
}

function isForbiddenError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('403') ||
      error.message.toLowerCase().includes('não autorizado') ||
      error.message.toLowerCase().includes('acesso negado') ||
      error.message.toLowerCase().includes('proibido')
    )
  }
  return false
}

export default function AgentOrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState<RentalOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL')
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true)
  const [listError, setListError] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState<boolean>(false)

  // Evaluation form state
  const [agentOpinion, setAgentOpinion] = useState<string>('')
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  const [evalError, setEvalError] = useState<string | null>(null)
  const [evalSuccess, setEvalSuccess] = useState<string | null>(null)

  function handleLogout() {
    authService.logout()
    navigate('/login', { replace: true })
  }

  function handleSelectOrder(order: RentalOrder) {
    setSelectedOrder(order)
    setAgentOpinion(order.agentOpinion ?? '')
    setEvalError(null)
    setEvalSuccess(null)
  }

  const loadOrders = useCallback(async (filter: FilterStatus) => {
    setIsLoadingList(true)
    setListError(null)
    setIsForbidden(false)

    try {
      const param = filter === 'ALL' ? undefined : filter
      const data = await orderService.listForAgent(param)
      setOrders(data)
      // Keep selected order updated or clear if not present
      setSelectedOrder((current) => {
        if (!current) {
          const first = data.length > 0 ? data[0] : null
          if (first) {
            setAgentOpinion(first.agentOpinion ?? '')
          }
          return first
        }
        const updated = data.find((o) => o.id === current.id)
        const target = updated ?? (data.length > 0 ? data[0] : null)
        if (target) {
          setAgentOpinion(target.agentOpinion ?? '')
        }
        return target
      })
    } catch (err) {
      if (isForbiddenError(err)) {
        setIsForbidden(true)
        setListError(
          'Acesso restrito: seu perfil de usuário não possui permissão para visualizar a área de agentes (Empresa/Banco).'
        )
      } else {
        const msg = err instanceof Error ? err.message : 'Falha ao carregar a lista de pedidos.'
        setListError(msg)
      }
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const param = statusFilter === 'ALL' ? undefined : statusFilter

    orderService
      .listForAgent(param)
      .then((data) => {
        if (!active) return
        setOrders(data)
        setSelectedOrder((current) => {
          if (!current) {
            const first = data.length > 0 ? data[0] : null
            if (first) setAgentOpinion(first.agentOpinion ?? '')
            return first
          }
          const updated = data.find((o) => o.id === current.id)
          const target = updated ?? (data.length > 0 ? data[0] : null)
          if (target) setAgentOpinion(target.agentOpinion ?? '')
          return target
        })
        setIsLoadingList(false)
      })
      .catch((err) => {
        if (!active) return
        if (isForbiddenError(err)) {
          setIsForbidden(true)
          setListError(
            'Acesso restrito: seu perfil de usuário não possui permissão para visualizar a área de agentes (Empresa/Banco).'
          )
        } else {
          const msg = err instanceof Error ? err.message : 'Falha ao carregar a lista de pedidos.'
          setListError(msg)
        }
        setIsLoadingList(false)
      })

    return () => {
      active = false
    }
  }, [statusFilter])

  async function handleEvaluate(targetStatus: EvaluateRentalOrder['status']) {
    if (!selectedOrder) return

    setIsEvaluating(true)
    setEvalError(null)
    setEvalSuccess(null)

    try {
      const payload: EvaluateRentalOrder = {
        status: targetStatus,
        agentOpinion: agentOpinion.trim() ? agentOpinion.trim() : undefined,
      }

      const updated = await orderService.evaluate(selectedOrder.id, payload)
      setSelectedOrder(updated)
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setEvalSuccess(`Pedido #${updated.id} atualizado para status "${getStatusLabel(updated.status)}" com sucesso.`)
    } catch (err) {
      if (isForbiddenError(err)) {
        setEvalError('Ação negada (403): seu perfil não tem permissão para avaliar este pedido.')
      } else {
        const msg = err instanceof Error ? err.message : 'Falha ao avaliar o pedido.'
        setEvalError(msg)
      }
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <main className="agent-orders-page">
      <header className="agent-orders-header">
        <Link className="wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <nav className="agent-orders-nav" aria-label="Navegação da área de agentes">
          <Link to="/">Início</Link>
          <Link to="/cars">Veículos</Link>
          <button className="logout-button" type="button" onClick={handleLogout}>
            Sair
          </button>
        </nav>
      </header>

      <div className="agent-orders-content">
        <section className="agent-orders-intro">
          <p className="eyebrow"><span /> PAINEL CORPORATIVO & FINANCEIRO</p>
          <h1>Avaliação de <em>Pedidos de Aluguel</em></h1>
          <p>
            Consulte os pedidos submetidos para locação, analise o perfil financeiro consolidado do solicitante
            e registre o parecer formal da sua instituição.
          </p>
        </section>

        {isForbidden ? (
          <div className="agent-orders-error-panel" role="alert">
            <h3>Acesso Não Autorizado (HTTP 403)</h3>
            <p>{listError}</p>
            <p>
              A área de agentes é exclusiva para contas jurídicas ou bancárias devidamente autenticadas.
            </p>
            <Link to="/cars" className="refresh-button">
              Voltar para Veículos
            </Link>
          </div>
        ) : (
          <>
            <div className="agent-orders-toolbar">
              <div className="status-filter-group" role="group" aria-label="Filtrar por status">
                <span className="filter-label">Status:</span>
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`filter-chip ${statusFilter === opt.value ? 'active' : ''}`}
                    onClick={() => setStatusFilter(opt.value)}
                    disabled={isLoadingList}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="refresh-button"
                onClick={() => void loadOrders(statusFilter)}
                disabled={isLoadingList}
              >
                Atualizar lista ↻
              </button>
            </div>

            {listError && (
              <div className="agent-orders-error-panel" role="alert">
                <h3>Erro ao carregar pedidos</h3>
                <p>{listError}</p>
                <button
                  type="button"
                  className="refresh-button"
                  onClick={() => void loadOrders(statusFilter)}
                >
                  Tentar novamente ↻
                </button>
              </div>
            )}

            <div className="orders-main-layout">
              {/* Left Column: Orders List */}
              <div className="orders-list-column">
                {isLoadingList ? (
                  <div className="orders-grid">
                    <div className="car-skeleton">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="car-skeleton">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="cars-message cars-empty">
                    <span className="cars-message-icon" aria-hidden="true">✳</span>
                    <div>
                      <h3>Nenhum pedido encontrado</h3>
                      <p>
                        {statusFilter === 'ALL'
                          ? 'Não existem pedidos de aluguel registrados no sistema até o momento.'
                          : `Não há pedidos com o status "${getStatusLabel(statusFilter as OrderStatus)}".`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="orders-grid" role="list" aria-label="Lista de pedidos de aluguel">
                    {orders.map((order) => (
                      <article
                        key={order.id}
                        role="listitem"
                        tabIndex={0}
                        className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                        onClick={() => handleSelectOrder(order)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSelectOrder(order)
                          }
                        }}
                      >
                        <div className="order-card-header">
                          <span className="order-id-badge">PEDIDO #{order.id}</span>
                          <span className={`order-badge badge-${order.status}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <h3 className="order-card-title">
                          {order.car.brand} <em>{order.car.model}</em>
                        </h3>
                        <p className="order-card-subtitle">
                          Cliente: {order.clientName}
                        </p>

                        <div className="order-card-footer">
                          <span className="order-income-preview">
                            Renda:{' '}
                            {order.clientSummary
                              ? formatCurrency(order.clientSummary.totalIncome)
                              : 'Não informada'}
                          </span>
                          <span className="order-date-preview">{formatDate(order.createdAt)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Order Details & Evaluation */}
              <div className="orders-detail-column">
                {selectedOrder ? (
                  <div className="detail-panel" aria-labelledby="order-detail-title">
                    <div className="detail-header">
                      <div>
                        <span className="eyebrow"><span /> DETALHES DA ANÁLISE</span>
                        <h2 id="order-detail-title">Pedido #{selectedOrder.id}</h2>
                      </div>
                      <span className={`order-badge badge-${selectedOrder.status}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>

                    {/* Section: Vehicle Info */}
                    <div className="detail-section">
                      <h4 className="detail-section-title">Veículo Solicitado</h4>
                      <div className="detail-field-grid">
                        <div className="detail-field">
                          <span className="field-label">Modelo</span>
                          <span className="field-value">
                            {selectedOrder.car.brand} {selectedOrder.car.model}
                          </span>
                        </div>
                        <div className="detail-field">
                          <span className="field-label">Ano de Fabricação</span>
                          <span className="field-value">{selectedOrder.car.fabricationYear}</span>
                        </div>
                        <div className="detail-field">
                          <span className="field-label">Placa</span>
                          <span className="field-value">{selectedOrder.car.licensePlate}</span>
                        </div>
                        <div className="detail-field">
                          <span className="field-label">Matrícula</span>
                          <span className="field-value">{selectedOrder.car.registration}</span>
                        </div>
                        <div className="detail-field full-width">
                          <span className="field-label">Proprietário</span>
                          <span className="field-value">{selectedOrder.car.ownerName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section: Financial & Client Summary */}
                    <div className="detail-section">
                      <h4 className="detail-section-title">Perfil do Solicitante (Privacidade Preservada)</h4>
                      <div className="detail-field-grid">
                        <div className="detail-field">
                          <span className="field-label">Nome</span>
                          <span className="field-value">{selectedOrder.clientName}</span>
                        </div>
                        <div className="detail-field">
                          <span className="field-label">Profissão</span>
                          <span className="field-value">
                            {selectedOrder.clientSummary?.profession || 'Não declarada'}
                          </span>
                        </div>
                        <div className="detail-field full-width">
                          <span className="field-label">Rendimento Total Declarado</span>
                          <span className="field-value highlight">
                            {selectedOrder.clientSummary
                              ? formatCurrency(selectedOrder.clientSummary.totalIncome)
                              : 'Nenhuma renda associada'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section: Client Notes */}
                    {selectedOrder.clientNotes && (
                      <div className="detail-section">
                        <h4 className="detail-section-title">Observações do Cliente</h4>
                        <p className="field-value">{selectedOrder.clientNotes}</p>
                      </div>
                    )}

                    {/* Section: Audit & Evaluation History */}
                    <div className="detail-section">
                      <h4 className="detail-section-title">Histórico de Análise</h4>
                      <div className="detail-field-grid">
                        <div className="detail-field">
                          <span className="field-label">Data de Criação</span>
                          <span className="field-value">{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        <div className="detail-field">
                          <span className="field-label">Última Atualização</span>
                          <span className="field-value">{formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                        {selectedOrder.evaluatedByName && (
                          <div className="detail-field full-width">
                            <span className="field-label">Avaliador Responsável</span>
                            <span className="field-value">{selectedOrder.evaluatedByName}</span>
                          </div>
                        )}
                        {selectedOrder.agentOpinion && (
                          <div className="detail-field full-width">
                            <span className="field-label">Parecer Registrado</span>
                            <span className="field-value">{selectedOrder.agentOpinion}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section: Evaluation Actions */}
                    <div className="detail-section">
                      <h4 className="detail-section-title">Parecer e Modificação de Status</h4>

                      {evalSuccess && (
                        <div className="eval-alert success" role="status">
                          {evalSuccess}
                        </div>
                      )}

                      {evalError && (
                        <div className="eval-alert error" role="alert">
                          {evalError}
                        </div>
                      )}

                      {selectedOrder.status === 'CRIADO' && (
                        <div className="evaluation-box">
                          <p className="evaluation-instruction">
                            Etapa 1: Iniciar a análise do pedido para reservar o processo de avaliação.
                          </p>
                          <div className="opinion-input-group">
                            <label htmlFor="agent-opinion-input" className="field-label">
                              Parecer inicial (opcional):
                            </label>
                            <textarea
                              id="agent-opinion-input"
                              className="opinion-textarea"
                              placeholder="Observações ou notas iniciais sobre a verificação..."
                              value={agentOpinion}
                              onChange={(e) => setAgentOpinion(e.target.value)}
                              disabled={isEvaluating}
                            />
                          </div>
                          <div className="evaluation-actions">
                            <button
                              type="button"
                              className="btn-start-analysis"
                              onClick={() => void handleEvaluate('EM_ANALISE')}
                              disabled={isEvaluating}
                            >
                              {isEvaluating ? 'Processando...' : 'Iniciar Análise (EM_ANALISE)'}
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedOrder.status === 'EM_ANALISE' && (
                        <div className="evaluation-box">
                          <p className="evaluation-instruction">
                            Etapa 2: Concluir a avaliação aprovando ou rejeitando a solicitação de locação.
                          </p>
                          <div className="opinion-input-group">
                            <label htmlFor="agent-opinion-input-stage2" className="field-label">
                              Parecer do Agente:
                            </label>
                            <textarea
                              id="agent-opinion-input-stage2"
                              className="opinion-textarea"
                              placeholder="Justificativa da aprovação ou motivo da rejeição..."
                              value={agentOpinion}
                              onChange={(e) => setAgentOpinion(e.target.value)}
                              disabled={isEvaluating}
                            />
                          </div>
                          <div className="evaluation-actions">
                            <button
                              type="button"
                              className="btn-approve"
                              onClick={() => void handleEvaluate('APROVADO')}
                              disabled={isEvaluating}
                            >
                              {isEvaluating ? 'Aprovando...' : 'Aprovar Pedido'}
                            </button>
                            <button
                              type="button"
                              className="btn-reject"
                              onClick={() => void handleEvaluate('REJEITADO')}
                              disabled={isEvaluating}
                            >
                              {isEvaluating ? 'Rejeitando...' : 'Rejeitar Pedido'}
                            </button>
                          </div>
                        </div>
                      )}

                      {(selectedOrder.status === 'APROVADO' ||
                        selectedOrder.status === 'REJEITADO' ||
                        selectedOrder.status === 'CANCELADO') && (
                        <div className="evaluation-box">
                          <p className="evaluation-instruction">
                            Este pedido já foi finalizado com o status{' '}
                            <strong>{getStatusLabel(selectedOrder.status)}</strong> e não aceita novas modificações.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="detail-panel-placeholder">
                    <span className="cars-message-icon" aria-hidden="true">ℹ</span>
                    <p>Selecione um pedido na lista para visualizar detalhes e registrar parecer.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="agent-orders-footer">
        <Link className="wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <span>Painel do Agente • Decisões de Locação</span>
      </footer>
    </main>
  )
}
