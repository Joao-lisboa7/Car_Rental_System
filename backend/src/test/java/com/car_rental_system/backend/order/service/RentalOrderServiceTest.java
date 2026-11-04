package com.car_rental_system.backend.order.service;

import com.car_rental_system.backend.auth.enums.UserRole;
import com.car_rental_system.backend.auth.model.BankUser;
import com.car_rental_system.backend.auth.model.ClientUser;
import com.car_rental_system.backend.auth.model.CompanyUser;
import com.car_rental_system.backend.auth.model.IncomeSource;
import com.car_rental_system.backend.auth.model.Users;
import com.car_rental_system.backend.auth.repository.UsersRepository;
import com.car_rental_system.backend.car.model.Car;
import com.car_rental_system.backend.car.repository.CarRepository;
import com.car_rental_system.backend.order.dto.AgentRentalOrderResponseDTO;
import com.car_rental_system.backend.order.dto.CreateRentalOrderDTO;
import com.car_rental_system.backend.order.dto.EvaluateRentalOrderDTO;
import com.car_rental_system.backend.order.dto.RentalOrderResponseDTO;
import com.car_rental_system.backend.order.dto.UpdateRentalOrderDTO;
import com.car_rental_system.backend.order.enums.OrderStatus;
import com.car_rental_system.backend.order.model.RentalOrder;
import com.car_rental_system.backend.order.repository.RentalOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RentalOrderServiceTest {

    @Mock
    private RentalOrderRepository rentalOrderRepository;

    @Mock
    private CarRepository carRepository;

    @Mock
    private UsersRepository usersRepository;

    @InjectMocks
    private RentalOrderService rentalOrderService;

    private ClientUser client;
    private Users carOwner;
    private CompanyUser companyAgent;
    private BankUser bankAgent;
    private Car availableCar;
    private RentalOrder existingOrder;

    @BeforeEach
    void setUp() {
        client = new ClientUser();
        client.setId(10L);
        client.setName("Cliente Teste");
        client.setEmail("cliente@test.com");
        client.setRole(UserRole.CLIENT);
        client.setProfession("Engenheiro");
        client.setIncomeSources(new ArrayList<>(List.of(
                new IncomeSource("Empresa A", new BigDecimal("5000.00")),
                new IncomeSource("Empresa B", new BigDecimal("3000.00"))
        )));

        carOwner = new ClientUser();
        carOwner.setId(20L);
        carOwner.setName("Dono Carro");
        carOwner.setEmail("dono@test.com");
        carOwner.setRole(UserRole.CLIENT);

        companyAgent = new CompanyUser();
        companyAgent.setId(30L);
        companyAgent.setName("Locadora XYZ");
        companyAgent.setEmail("locadora@test.com");
        companyAgent.setRole(UserRole.COMPANY);

        bankAgent = new BankUser();
        bankAgent.setId(40L);
        bankAgent.setName("Banco ABC");
        bankAgent.setEmail("banco@test.com");
        bankAgent.setRole(UserRole.Bank);

        availableCar = new Car(
                1L,
                "REG-1234",
                "Toyota",
                "Corolla",
                2022,
                "ABC-1234",
                true,
                carOwner
        );

        existingOrder = new RentalOrder(client, availableCar, "Observacao inicial");
        existingOrder.setId(100L);
        existingOrder.setStatus(OrderStatus.CRIADO);
    }

    // --- Testes de Criação ---

    @Test
    @DisplayName("Cliente cria pedido com sucesso para carro elegível")
    void createOrder_Success() {
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(carRepository.findById(availableCar.getId())).thenReturn(Optional.of(availableCar));
        when(rentalOrderRepository.save(any(RentalOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateRentalOrderDTO dto = new CreateRentalOrderDTO(availableCar.getId(), "Preciso para viagem");
        RentalOrderResponseDTO response = rentalOrderService.createOrder(dto, client);

        assertNotNull(response);
        assertEquals(OrderStatus.CRIADO, response.status());
        assertEquals("Preciso para viagem", response.clientNotes());
        assertEquals(availableCar.getId(), response.car().id());
        assertEquals(client.getId(), response.clientId());
    }

    @Test
    @DisplayName("Deve rejeitar criação se cliente tiver mais de 3 fontes de renda")
    void createOrder_RejectMoreThan3IncomeSources() {
        client.getIncomeSources().add(new IncomeSource("Empresa C", new BigDecimal("1000.00")));
        client.getIncomeSources().add(new IncomeSource("Empresa D", new BigDecimal("1000.00")));
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));

        CreateRentalOrderDTO dto = new CreateRentalOrderDTO(availableCar.getId(), "Notas");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.createOrder(dto, client));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("mais de 3 fontes de renda"));
    }

    @Test
    @DisplayName("Deve rejeitar criação para carro indisponível")
    void createOrder_RejectUnavailableCar() {
        availableCar.setAvailable(false);
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(carRepository.findById(availableCar.getId())).thenReturn(Optional.of(availableCar));

        CreateRentalOrderDTO dto = new CreateRentalOrderDTO(availableCar.getId(), "Notas");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.createOrder(dto, client));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("não está disponível"));
    }

    @Test
    @DisplayName("Deve rejeitar criação se carro pertencer ao próprio cliente")
    void createOrder_RejectOwnCar() {
        availableCar.setOwner(client);
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(carRepository.findById(availableCar.getId())).thenReturn(Optional.of(availableCar));

        CreateRentalOrderDTO dto = new CreateRentalOrderDTO(availableCar.getId(), "Notas");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.createOrder(dto, client));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("próprio automóvel"));
    }

    @Test
    @DisplayName("Deve rejeitar criação se o usuário logado não for CLIENT")
    void createOrder_RejectNonClient() {
        CreateRentalOrderDTO dto = new CreateRentalOrderDTO(availableCar.getId(), "Notas");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.createOrder(dto, companyAgent));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    // --- Testes de Consulta Cliente ---

    @Test
    @DisplayName("Cliente lista apenas os próprios pedidos")
    void listMyOrders_Success() {
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(rentalOrderRepository.findByClientOrderByCreatedAtDesc(client)).thenReturn(List.of(existingOrder));

        List<RentalOrderResponseDTO> orders = rentalOrderService.listMyOrders(client);

        assertEquals(1, orders.size());
        assertEquals(existingOrder.getId(), orders.get(0).id());
    }

    @Test
    @DisplayName("Cliente consulta detalhes do próprio pedido")
    void getMyOrderById_Success() {
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));

        RentalOrderResponseDTO order = rentalOrderService.getMyOrderById(existingOrder.getId(), client);

        assertNotNull(order);
        assertEquals(existingOrder.getId(), order.id());
    }

    @Test
    @DisplayName("Deve impedir cliente de consultar pedido de terceiro (403)")
    void getMyOrderById_ForbiddenForOtherClient() {
        ClientUser otherClient = new ClientUser();
        otherClient.setId(99L);
        otherClient.setRole(UserRole.CLIENT);

        when(usersRepository.findById(otherClient.getId())).thenReturn(Optional.of(otherClient));
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.getMyOrderById(existingOrder.getId(), otherClient));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    // --- Testes de Edição Cliente ---

    @Test
    @DisplayName("Cliente edita pedido quando em estado CRIADO")
    void updateMyOrder_Success() {
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));
        when(rentalOrderRepository.save(any(RentalOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateRentalOrderDTO updateDTO = new UpdateRentalOrderDTO("Observacao alterada");
        RentalOrderResponseDTO updated = rentalOrderService.updateMyOrder(existingOrder.getId(), updateDTO, client);

        assertEquals("Observacao alterada", updated.clientNotes());
    }

    @Test
    @DisplayName("Deve impedir cliente de editar pedido que não esteja CRIADO")
    void updateMyOrder_RejectIfNotCreated() {
        existingOrder.setStatus(OrderStatus.EM_ANALISE);
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));

        UpdateRentalOrderDTO updateDTO = new UpdateRentalOrderDTO("Observacao alterada");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.updateMyOrder(existingOrder.getId(), updateDTO, client));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    // --- Testes de Cancelamento Cliente ---

    @Test
    @DisplayName("Cliente cancela pedido CRIADO com sucesso")
    void cancelMyOrder_SuccessWhenCreated() {
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));
        when(rentalOrderRepository.save(any(RentalOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RentalOrderResponseDTO response = rentalOrderService.cancelMyOrder(existingOrder.getId(), client);

        assertEquals(OrderStatus.CANCELADO, response.status());
    }

    @Test
    @DisplayName("Cliente cancela pedido EM_ANALISE com sucesso")
    void cancelMyOrder_SuccessWhenInAnalysis() {
        existingOrder.setStatus(OrderStatus.EM_ANALISE);
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));
        when(rentalOrderRepository.save(any(RentalOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RentalOrderResponseDTO response = rentalOrderService.cancelMyOrder(existingOrder.getId(), client);

        assertEquals(OrderStatus.CANCELADO, response.status());
    }

    @Test
    @DisplayName("Deve rejeitar cancelamento se pedido já estiver APROVADO")
    void cancelMyOrder_RejectIfApproved() {
        existingOrder.setStatus(OrderStatus.APROVADO);
        when(usersRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.cancelMyOrder(existingOrder.getId(), client));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    // --- Testes dos Agentes (Company / Bank) ---

    @Test
    @DisplayName("Agente lista pedidos com resumo agregado de renda do cliente")
    void listOrdersForAgent_SuccessWithAggregatedIncome() {
        when(rentalOrderRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(existingOrder));

        List<AgentRentalOrderResponseDTO> orders = rentalOrderService.listOrdersForAgent(null, companyAgent);

        assertEquals(1, orders.size());
        assertEquals("Cliente Teste", orders.get(0).clientName());
        assertNotNull(orders.get(0).clientSummary());
        assertEquals("Cliente Teste", orders.get(0).clientSummary().name());
        assertEquals("Engenheiro", orders.get(0).clientSummary().profession());
        assertEquals(new BigDecimal("8000.00"), orders.get(0).clientSummary().totalIncome());
    }

    @Test
    @DisplayName("Deve impedir cliente comum de acessar lista de agentes")
    void listOrdersForAgent_ForbiddenForClient() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.listOrdersForAgent(null, client));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    @DisplayName("Agente move CRIADO para EM_ANALISE com sucesso")
    void evaluateOrder_CRIADO_To_EM_ANALISE() {
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));
        when(rentalOrderRepository.save(any(RentalOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EvaluateRentalOrderDTO evalDTO = new EvaluateRentalOrderDTO(OrderStatus.EM_ANALISE, "Iniciando análise financeira");
        AgentRentalOrderResponseDTO result = rentalOrderService.evaluateOrder(existingOrder.getId(), evalDTO, companyAgent);

        assertEquals(OrderStatus.EM_ANALISE, result.status());
        assertEquals("Iniciando análise financeira", result.agentOpinion());
        assertEquals(companyAgent.getId(), result.evaluatedById());
    }

    @Test
    @DisplayName("Agente move EM_ANALISE para APROVADO com sucesso")
    void evaluateOrder_EM_ANALISE_To_APROVADO() {
        existingOrder.setStatus(OrderStatus.EM_ANALISE);
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));
        when(rentalOrderRepository.save(any(RentalOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EvaluateRentalOrderDTO evalDTO = new EvaluateRentalOrderDTO(OrderStatus.APROVADO, "Parecer positivo: crédito aprovado.");
        AgentRentalOrderResponseDTO result = rentalOrderService.evaluateOrder(existingOrder.getId(), evalDTO, bankAgent);

        assertEquals(OrderStatus.APROVADO, result.status());
        assertEquals("Parecer positivo: crédito aprovado.", result.agentOpinion());
        assertEquals(bankAgent.getId(), result.evaluatedById());
    }

    @Test
    @DisplayName("Deve rejeitar aprovação direta de pedido em estado CRIADO sem passar por EM_ANALISE")
    void evaluateOrder_RejectApprovedDirectlyFromCreated() {
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));

        EvaluateRentalOrderDTO evalDTO = new EvaluateRentalOrderDTO(OrderStatus.APROVADO, "Aprovado direto");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.evaluateOrder(existingOrder.getId(), evalDTO, companyAgent));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Apenas pedidos no estado EM_ANALISE podem ser APROVADOS"));
    }

    @Test
    @DisplayName("Deve rejeitar se agente tentar definir status inválido como CANCELADO ou CRIADO")
    void evaluateOrder_RejectInvalidAgentStatus() {
        when(rentalOrderRepository.findById(existingOrder.getId())).thenReturn(Optional.of(existingOrder));

        EvaluateRentalOrderDTO evalDTO = new EvaluateRentalOrderDTO(OrderStatus.CANCELADO, "Cancelando via agente");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                rentalOrderService.evaluateOrder(existingOrder.getId(), evalDTO, bankAgent));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }
}
