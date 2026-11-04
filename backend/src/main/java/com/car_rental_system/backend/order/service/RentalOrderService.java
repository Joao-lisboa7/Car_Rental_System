package com.car_rental_system.backend.order.service;

import com.car_rental_system.backend.auth.enums.UserRole;
import com.car_rental_system.backend.auth.model.ClientUser;
import com.car_rental_system.backend.auth.model.Users;
import com.car_rental_system.backend.auth.repository.UsersRepository;
import com.car_rental_system.backend.car.model.Car;
import com.car_rental_system.backend.car.repository.CarRepository;
import com.car_rental_system.backend.order.dto.*;
import com.car_rental_system.backend.order.enums.OrderStatus;
import com.car_rental_system.backend.order.model.RentalOrder;
import com.car_rental_system.backend.order.repository.RentalOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RentalOrderService {

    private final RentalOrderRepository rentalOrderRepository;
    private final CarRepository carRepository;
    private final UsersRepository usersRepository;

    public RentalOrderService(RentalOrderRepository rentalOrderRepository,
                              CarRepository carRepository,
                              UsersRepository usersRepository) {
        this.rentalOrderRepository = rentalOrderRepository;
        this.carRepository = carRepository;
        this.usersRepository = usersRepository;
    }

    @Transactional
    public RentalOrderResponseDTO createOrder(CreateRentalOrderDTO dto, Users currentUser) {
        ClientUser client = getAuthenticatedClient(currentUser);

        // Validar no máximo 3 fontes de renda do cliente
        if (client.getIncomeSources() != null && client.getIncomeSources().size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cliente possui mais de 3 fontes de renda cadastradas, o que não é permitido para solicitação de aluguel.");
        }

        Car car = carRepository.findById(dto.carId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Automóvel não encontrado."));

        // Validar se automóvel está disponível
        if (car.getAvailable() == null || !car.getAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Automóvel não está disponível para aluguel.");
        }

        // Validar que o automóvel pertence a outro usuário (não ao próprio cliente)
        if (car.getOwner() != null && car.getOwner().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido alugar o próprio automóvel.");
        }

        RentalOrder order = new RentalOrder(client, car, dto.clientNotes());
        RentalOrder saved = rentalOrderRepository.save(order);

        return RentalOrderResponseDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<RentalOrderResponseDTO> listMyOrders(Users currentUser) {
        ClientUser client = getAuthenticatedClient(currentUser);
        return rentalOrderRepository.findByClientOrderByCreatedAtDesc(client)
                .stream()
                .map(RentalOrderResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public RentalOrderResponseDTO getMyOrderById(Long orderId, Users currentUser) {
        ClientUser client = getAuthenticatedClient(currentUser);
        RentalOrder order = rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        if (!order.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao pedido de outro cliente.");
        }

        return RentalOrderResponseDTO.fromEntity(order);
    }

    @Transactional
    public RentalOrderResponseDTO updateMyOrder(Long orderId, UpdateRentalOrderDTO dto, Users currentUser) {
        ClientUser client = getAuthenticatedClient(currentUser);
        RentalOrder order = rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        if (!order.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao pedido de outro cliente.");
        }

        if (order.getStatus() != OrderStatus.CRIADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Apenas pedidos no estado CRIADO podem ser modificados pelo cliente.");
        }

        order.setClientNotes(dto.clientNotes());
        RentalOrder saved = rentalOrderRepository.save(order);
        return RentalOrderResponseDTO.fromEntity(saved);
    }

    @Transactional
    public RentalOrderResponseDTO cancelMyOrder(Long orderId, Users currentUser) {
        ClientUser client = getAuthenticatedClient(currentUser);
        RentalOrder order = rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        if (!order.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao pedido de outro cliente.");
        }

        if (order.getStatus() != OrderStatus.CRIADO && order.getStatus() != OrderStatus.EM_ANALISE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Apenas pedidos no estado CRIADO ou EM_ANALISE podem ser cancelados pelo cliente.");
        }

        order.setStatus(OrderStatus.CANCELADO);
        RentalOrder saved = rentalOrderRepository.save(order);
        return RentalOrderResponseDTO.fromEntity(saved);
    }

    // --- Métodos dos Agentes (COMPANY / BANK) ---

    @Transactional(readOnly = true)
    public List<AgentRentalOrderResponseDTO> listOrdersForAgent(OrderStatus statusFilter, Users currentUser) {
        assertIsAgent(currentUser);

        List<RentalOrder> orders;
        if (statusFilter != null) {
            orders = rentalOrderRepository.findByStatusOrderByCreatedAtDesc(statusFilter);
        } else {
            orders = rentalOrderRepository.findAllByOrderByCreatedAtDesc();
        }

        return orders.stream()
                .map(AgentRentalOrderResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public AgentRentalOrderResponseDTO getOrderByIdForAgent(Long orderId, Users currentUser) {
        assertIsAgent(currentUser);

        RentalOrder order = rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        return AgentRentalOrderResponseDTO.fromEntity(order);
    }

    @Transactional
    public AgentRentalOrderResponseDTO evaluateOrder(Long orderId, EvaluateRentalOrderDTO dto, Users currentUser) {
        assertIsAgent(currentUser);

        RentalOrder order = rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

        OrderStatus targetStatus = dto.status();

        if (targetStatus == OrderStatus.EM_ANALISE) {
            if (order.getStatus() != OrderStatus.CRIADO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Apenas pedidos no estado CRIADO podem ser colocados em EM_ANALISE.");
            }
        } else if (targetStatus == OrderStatus.APROVADO || targetStatus == OrderStatus.REJEITADO) {
            if (order.getStatus() != OrderStatus.EM_ANALISE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Apenas pedidos no estado EM_ANALISE podem ser APROVADOS ou REJEITADOS.");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transição inválida para o agente: status permitido são EM_ANALISE, APROVADO ou REJEITADO.");
        }

        order.setStatus(targetStatus);
        order.setAgentOpinion(dto.agentOpinion());
        order.setEvaluatedBy(currentUser);

        RentalOrder saved = rentalOrderRepository.save(order);
        return AgentRentalOrderResponseDTO.fromEntity(saved);
    }

    // --- Helpers de autorização ---

    private ClientUser getAuthenticatedClient(Users currentUser) {
        if (currentUser == null || currentUser.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Operação permitida apenas para clientes.");
        }

        Users managedUser = usersRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        if (!(managedUser instanceof ClientUser clientUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Perfil de cliente inválido.");
        }

        return clientUser;
    }

    private void assertIsAgent(Users currentUser) {
        if (currentUser == null ||
                (currentUser.getRole() != UserRole.COMPANY && currentUser.getRole() != UserRole.Bank)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Operação permitida apenas para agentes (empresas ou bancos).");
        }
    }
}
