import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { carService } from '../services/carService'
import { orderService } from '../services/orderService'
import type { Car } from '../types/car'
import type { OrderStatus, RentalOrder } from '../types/order'
import './ClientOrdersPage.css'

interface OrderListState {
  status: 'idle' | 'loading' | 'success' | 'error'
  orders: RentalOrder[]
  errorMessage?: string
}

interface AvailableCarsState {
  status: 'idle' | 'loading' | 'success' | 'error'
  cars: Car[]
  errorMessage?: string
}

export function ClientOrdersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [orderList, setOrderList] = useState<OrderListState>({
    status: 'loading',
    orders: [],
  })

  // Creation State & Available Cars explicit state
  const [availableCarsState, setAvailableCarsState] = useState<AvailableCarsState>({
    status: 'loading',
    cars: [],
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState<number | ''>('')
  const [createNotes, setCreateNotes] = useState('')
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  // Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // Edit State (inside Modal or inline)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editNotesValue, setEditNotesValue] = useState('')
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Cancel Confirmation Modal State
  const [orderToCancel, setOrderToCancel] = useState<RentalOrder | null>(null)
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  // Feedback banner
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLogout = () => {
    authService.logout()
    navigate('/login', { replace: true })
  }

  const loadMyOrders = useCallback(async () => {
    setOrderList((prev) => ({ ...prev, status: 'loading', errorMessage: undefined }))
    try {
      const orders = await orderService.listMine()
      setOrderList({ status: 'success', orders })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível carregar os pedidos.'
      setOrderList({ status: 'error', orders: [], errorMessage: msg })
    }
  }, [])

  const loadAvailableCars = useCallback(async () => {
    setAvailableCarsState((prev) => ({ ...prev, status: 'loading', errorMessage: undefined }))
    try {
      const cars = await carService.getAvailableCars()
      setAvailableCarsState({ status: 'success', cars })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível carregar os veículos disponíveis.'
      setAvailableCarsState({ status: 'error', cars: [], errorMessage: msg })
    }
  }, [])

  useEffect(() => {
    void loadMyOrders()
    void loadAvailableCars()
  }, [loadMyOrders, loadAvailableCars])

  // Checar se veio com carId na URL para abrir fluxo de criação direto
  useEffect(() => {
    const carIdParam = searchParams.get('carId')
    if (carIdParam) {
      const parsed = Number(carIdParam)
      if (!Number.isNaN(parsed) && parsed > 0) {
        setSelectedCarId(parsed)
        setShowCreateForm(true)
      }
    }
  }, [searchParams])

  const handleOpenCreate = () => {
    setCreateError(null)
    setCreateSuccess(null)
    setShowCreateForm(true)
  }

  const handleCancelCreate = () => {
    setShowCreateForm(false)
    setCreateError(null)
    setCreateSuccess(null)
    setCreateNotes('')
    searchParams.delete('carId')
    setSearchParams(searchParams)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCarId) {
      setCreateError('Selecione um veículo disponível.')
      return
    }

    setIsSubmittingCreate(true)
    setCreateError(null)
    setCreateSuccess(null)

    try {
      await orderService.create({
        carId: Number(selectedCarId),
        clientNotes: createNotes.trim() ? createNotes.trim() : undefined,
      })
      setCreateSuccess('Pedido criado com sucesso!')
      setCreateNotes('')
      setSelectedCarId('')
      searchParams.delete('carId')
      setSearchParams(searchParams)
      setShowCreateForm(false)
      setBannerMessage({ type: 'success', text: 'Pedido de locação solicitado com sucesso!' })
      await loadMyOrders()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Falha ao solicitar pedido.')
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  // Abrir Detalhes
  const handleOpenDetails = async (orderId: number) => {
    setIsLoadingDetail(true)
    setDetailError(null)
    setIsEditingNotes(false)
    try {
      const order = await orderService.getMine(orderId)
      setSelectedOrder(order)
      setEditNotesValue(order.clientNotes ?? '')
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Não foi possível carregar os detalhes do pedido.')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
    setIsEditingNotes(false)
    setEditError(null)
    setDetailError(null)
  }

  // Salvar Edição de Notas (apenas status CRIADO)
  const handleSaveNotes = async () => {
    if (!selectedOrder) return
    setIsSubmittingEdit(true)
    setEditError(null)

    try {
      const updated = await orderService.updateMine(selectedOrder.id, {
        clientNotes: editNotesValue.trim() ? editNotesValue.trim() : undefined,
      })
      setSelectedOrder(updated)
      setIsEditingNotes(false)
      setBannerMessage({ type: 'success', text: 'Observações do pedido atualizadas.' })
      await loadMyOrders()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Falha ao atualizar observações.')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Abrir Confirmação de Cancelamento
  const handlePromptCancel = (order: RentalOrder) => {
    setOrderToCancel(order)
    setCancelError(null)
  }

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return
    setIsSubmittingCancel(true)
    setCancelError(null)

    try {
      const cancelled = await orderService.cancelMine(orderToCancel.id)
      setOrderToCancel(null)
      if (selectedOrder && selectedOrder.id === cancelled.id) {
        setSelectedOrder(cancelled)
      }
      setBannerMessage({ type: 'success', text: `Pedido #${cancelled.id} cancelado.` })
      await loadMyOrders()
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Não foi possível cancelar o pedido.')
    } finally {
      setIsSubmittingCancel(false)
    }
  }

  const selectedCarObj = availableCarsState.cars.find((c) => c.id === Number(selectedCarId))

  const canEditOrder = (status: OrderStatus) => status === 'CRIADO'
  const canCancelOrder = (status: OrderStatus) => status === 'CRIADO' || status === 'EM_ANALISE'

  return (
    <main className="client-orders-page">
      <header className="client-orders-header">
        <Link className="wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <nav className="client-orders-nav" aria-label="Navegação">
          <Link to="/cars">Veículos</Link>
          <Link to="/orders/me" className="active">Meus Pedidos</Link>
          <button className="logout-button" type="button" onClick={handleLogout}>Sair</button>
        </nav>
      </header>

      <div className="client-orders-content">
        <section className="client-orders-intro">
          <p className="eyebrow"><span /> ÁREA DO CLIENTE</p>
          <h1>Meus <em>Pedidos de Locação</em></h1>
          <p>Acompanhe, gerencie e solicite novos pedidos de aluguel de automóveis.</p>
        </section>

        {bannerMessage && (
          <div className={`feedback-banner banner-${bannerMessage.type}`} role="alert">
            <span>{bannerMessage.text}</span>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setBannerMessage(null)}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        )}

        {/* Action Button to Open Creation Form */}
        <div className="client-orders-actions-bar">
          {!showCreateForm ? (
            <button
              type="button"
              className="action-btn-primary"
              onClick={handleOpenCreate}
            >
              + Solicitar Novo Pedido
            </button>
          ) : (
            <button
              type="button"
              className="action-btn-secondary"
              onClick={handleCancelCreate}
            >
              ← Cancelar Solicitação
            </button>
          )}
        </div>

        {/* Create Order Form */}
        {showCreateForm && (
          <section className="orders-panel" aria-labelledby="create-order-heading">
            <h2 id="create-order-heading">Nova Solicitação de Locação</h2>
            <p className="panel-subtext">
              Escolha um veículo disponível e envie suas observações para análise dos agentes.
            </p>

            {createError && (
              <div className="feedback-banner banner-error" role="alert">
                <span>{createError}</span>
              </div>
            )}
            {createSuccess && (
              <div className="feedback-banner banner-success" role="alert">
                <span>{createSuccess}</span>
              </div>
            )}

            {availableCarsState.status === 'loading' && (
              <div className="orders-panel" style={{ textAlign: 'center', padding: '20px', marginBottom: '20px' }}>
                <p style={{ margin: 0 }}>Carregando lista de veículos disponíveis...</p>
              </div>
            )}

            {availableCarsState.status === 'error' && (
              <div className="feedback-banner banner-error" role="alert" style={{ marginBottom: '20px' }}>
                <div>
                  <strong>Não foi possível carregar os veículos: </strong>
                  <span>{availableCarsState.errorMessage}</span>
                </div>
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={() => void loadAvailableCars()}
                  style={{ marginLeft: '12px' }}
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {availableCarsState.status === 'success' && availableCarsState.cars.length === 0 && (
              <div className="client-orders-empty" style={{ padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', margin: '0 0 6px' }}>Nenhum veículo disponível no momento</h3>
                <p style={{ margin: 0, fontSize: '12px' }}>
                  Não há veículos com status disponível para receber novas solicitações de locação agora.
                </p>
              </div>
            )}

            <form onSubmit={(e) => void handleCreateSubmit(e)}>
              <div className="form-group">
                <label htmlFor="select-car">Automóvel Desejado *</label>
                <select
                  id="select-car"
                  className="form-control"
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value ? Number(e.target.value) : '')}
                  disabled={
                    isSubmittingCreate ||
                    availableCarsState.status === 'loading' ||
                    availableCarsState.status === 'error' ||
                    availableCarsState.cars.length === 0
                  }
                  required
                >
                  <option value="">
                    {availableCarsState.status === 'loading'
                      ? '-- Carregando veículos... --'
                      : availableCarsState.status === 'error'
                      ? '-- Erro ao carregar veículos (tente novamente acima) --'
                      : availableCarsState.cars.length === 0
                      ? '-- Nenhum veículo disponível --'
                      : '-- Selecione um veículo disponível --'}
                  </option>
                  {availableCarsState.cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.brand} {car.model} ({car.fabricationYear}) - Placa {car.licensePlate} (Proprietário: {car.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCarObj && (
                <div className="car-selection-summary">
                  <div>
                    <div className="car-summary-title">
                      {selectedCarObj.brand} {selectedCarObj.model}
                    </div>
                    <div className="car-summary-meta">
                      Ano: {selectedCarObj.fabricationYear} • Placa: {selectedCarObj.licensePlate} • Registro: {selectedCarObj.registration}
                    </div>
                  </div>
                  <span className="status-pill status-APROVADO">Disponível</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="create-notes">Observações do Cliente (opcional)</label>
                <textarea
                  id="create-notes"
                  className="form-control"
                  placeholder="Informações adicionais para a solicitação de locação..."
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  disabled={isSubmittingCreate || availableCarsState.status !== 'success'}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="action-btn-primary"
                  disabled={
                    isSubmittingCreate ||
                    !selectedCarId ||
                    availableCarsState.status !== 'success'
                  }
                >
                  {isSubmittingCreate ? 'Enviando solicitação...' : 'Confirmar e Enviar Pedido'}
                </button>
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={handleCancelCreate}
                  disabled={isSubmittingCreate}
                >
                  Desistir
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Orders List Section */}
        <section aria-labelledby="my-orders-heading">
          {orderList.status === 'loading' && (
            <div className="orders-panel" style={{ textAlign: 'center', padding: '40px' }}>
              <p>Carregando seus pedidos...</p>
            </div>
          )}

          {orderList.status === 'error' && (
            <div className="feedback-banner banner-error" role="alert">
              <span>{orderList.errorMessage}</span>
              <button
                type="button"
                className="action-btn-secondary"
                style={{ marginLeft: '16px' }}
                onClick={() => void loadMyOrders()}
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {orderList.status === 'success' && orderList.orders.length === 0 && (
            <div className="client-orders-empty">
              <h3>Você ainda não possui pedidos de locação</h3>
              <p>Explore os veículos disponíveis para solicitar seu primeiro aluguel.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link to="/cars" className="action-btn-secondary">Ver Veículos Disponíveis</Link>
                <button type="button" className="action-btn-primary" onClick={handleOpenCreate}>
                  Solicitar Agora
                </button>
              </div>
            </div>
          )}

          {orderList.status === 'success' && orderList.orders.length > 0 && (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th># ID</th>
                    <th>Veículo</th>
                    <th>Status</th>
                    <th>Observações</th>
                    <th>Data Solicitação</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orderList.orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>
                        <strong>{order.car.brand} {order.car.model}</strong>
                        <div style={{ fontSize: '11px', color: '#8e8f90' }}>
                          Placa: {order.car.licensePlate} • Ano: {order.car.fabricationYear}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill status-${order.status}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.clientNotes ? order.clientNotes : <span style={{ color: '#666' }}>—</span>}
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="action-btn-secondary"
                            onClick={() => void handleOpenDetails(order.id)}
                          >
                            Detalhes
                          </button>
                          {canCancelOrder(order.status) && (
                            <button
                              type="button"
                              className="action-btn-danger"
                              onClick={() => handlePromptCancel(order)}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Details & Edit Modal */}
      {selectedOrder && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="detail-modal-title">Detalhes do Pedido #{selectedOrder.id}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseDetails}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {isLoadingDetail && <p>Carregando informações atualizadas...</p>}

            {detailError && (
              <div className="feedback-banner banner-error" role="alert">
                <span>{detailError}</span>
              </div>
            )}

            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Status do Pedido</span>
                <span className={`status-pill status-${selectedOrder.status}`}>
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>

              <div className="detail-item">
                <span className="label">Data de Criação</span>
                <strong className="val">
                  {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                </strong>
              </div>

              <div className="detail-item detail-full-width">
                <span className="label">Veículo</span>
                <strong className="val">
                  {selectedOrder.car.brand} {selectedOrder.car.model} ({selectedOrder.car.fabricationYear})
                </strong>
                <div style={{ fontSize: '12px', color: '#a5a6a7', marginTop: '4px' }}>
                  Placa: {selectedOrder.car.licensePlate} • Registro: {selectedOrder.car.registration} • Proprietário: {selectedOrder.car.ownerName}
                </div>
              </div>

              <div className="detail-item detail-full-width">
                <span className="label">Parecer do Agente Avaliador</span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: selectedOrder.agentOpinion ? '#e8e4da' : '#777' }}>
                  {selectedOrder.agentOpinion || 'Nenhum parecer emitido até o momento.'}
                </p>
                {selectedOrder.evaluatedByName && (
                  <div style={{ fontSize: '11px', color: '#8e8f90', marginTop: '6px' }}>
                    Avaliado por: {selectedOrder.evaluatedByName}
                  </div>
                )}
              </div>

              {/* Client Notes & Editing */}
              <div className="detail-item detail-full-width">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="label" style={{ margin: 0 }}>Observações do Cliente</span>
                  {canEditOrder(selectedOrder.status) && !isEditingNotes && (
                    <button
                      type="button"
                      className="action-btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      onClick={() => setIsEditingNotes(true)}
                    >
                      Editar Observações
                    </button>
                  )}
                </div>

                {!isEditingNotes ? (
                  <p style={{ margin: 0, fontSize: '13px', color: selectedOrder.clientNotes ? '#fff' : '#777' }}>
                    {selectedOrder.clientNotes || 'Nenhuma observação informada.'}
                  </p>
                ) : (
                  <div>
                    {editError && (
                      <div className="feedback-banner banner-error" role="alert" style={{ margin: '8px 0' }}>
                        <span>{editError}</span>
                      </div>
                    )}
                    <textarea
                      className="form-control"
                      value={editNotesValue}
                      onChange={(e) => setEditNotesValue(e.target.value)}
                      disabled={isSubmittingEdit}
                      rows={3}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        type="button"
                        className="action-btn-primary"
                        onClick={() => void handleSaveNotes()}
                        disabled={isSubmittingEdit}
                      >
                        {isSubmittingEdit ? 'Salvando...' : 'Salvar Alteração'}
                      </button>
                      <button
                        type="button"
                        className="action-btn-secondary"
                        onClick={() => {
                          setIsEditingNotes(false)
                          setEditNotesValue(selectedOrder.clientNotes ?? '')
                          setEditError(null)
                        }}
                        disabled={isSubmittingEdit}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '16px' }}>
              <div>
                {canCancelOrder(selectedOrder.status) && (
                  <button
                    type="button"
                    className="action-btn-danger"
                    onClick={() => {
                      handlePromptCancel(selectedOrder)
                    }}
                  >
                    Cancelar este Pedido
                  </button>
                )}
              </div>
              <button
                type="button"
                className="action-btn-secondary"
                onClick={handleCloseDetails}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {orderToCancel && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 id="cancel-modal-title">Confirmar Cancelamento</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOrderToCancel(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
              Tem certeza de que deseja cancelar a solicitação de locação do veículo{' '}
              <strong>{orderToCancel.car.brand} {orderToCancel.car.model}</strong> (Pedido #{orderToCancel.id})?
            </p>
            <p style={{ fontSize: '12px', color: '#8e8f90' }}>
              Esta ação alterará o status para CANCELADO de forma definitiva.
            </p>

            {cancelError && (
              <div className="feedback-banner banner-error" role="alert">
                <span>{cancelError}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="action-btn-secondary"
                onClick={() => setOrderToCancel(null)}
                disabled={isSubmittingCancel}
              >
                Voltar
              </button>
              <button
                type="button"
                className="action-btn-danger"
                onClick={() => void handleConfirmCancel()}
                disabled={isSubmittingCancel}
              >
                {isSubmittingCancel ? 'Cancelando...' : 'Sim, Cancelar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="client-orders-footer" style={{ marginTop: '60px' }}>
        <Link className="wordmark" to="/" aria-label="Veloce, início">
          <span className="wordmark-mark">V</span>
          <span>VELOCE<small>CAR RENTAL</small></span>
        </Link>
        <span style={{ fontSize: '12px', color: '#666' }}>Liberdade em cada quilômetro.</span>
      </footer>
    </main>
  )
}

export default ClientOrdersPage
