package com.car_rental_system.backend.order.dto;

import com.car_rental_system.backend.auth.model.ClientUser;
import com.car_rental_system.backend.auth.model.IncomeSource;
import com.car_rental_system.backend.car.dto.CarResponseDTO;
import com.car_rental_system.backend.order.enums.OrderStatus;
import com.car_rental_system.backend.order.model.RentalOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AgentRentalOrderResponseDTO(
        Long id,
        String clientName,
        ClientSummaryDTO clientSummary,
        CarResponseDTO car,
        OrderStatus status,
        String clientNotes,
        String agentOpinion,
        Long evaluatedById,
        String evaluatedByName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AgentRentalOrderResponseDTO fromEntity(RentalOrder order) {
        ClientSummaryDTO summary = null;
        if (order.getClient() != null) {
            ClientUser client = order.getClient();
            BigDecimal totalIncome = BigDecimal.ZERO;
            if (client.getIncomeSources() != null) {
                totalIncome = client.getIncomeSources().stream()
                        .map(IncomeSource::getIncome)
                        .filter(i -> i != null)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            summary = new ClientSummaryDTO(client.getName(), client.getProfession(), totalIncome);
        }

        Long evaluatedById = order.getEvaluatedBy() != null ? order.getEvaluatedBy().getId() : null;
        String evaluatedByName = order.getEvaluatedBy() != null ? order.getEvaluatedBy().getName() : null;

        return new AgentRentalOrderResponseDTO(
                order.getId(),
                order.getClient() != null ? order.getClient().getName() : null,
                summary,
                order.getCar() != null ? new CarResponseDTO(order.getCar()) : null,
                order.getStatus(),
                order.getClientNotes(),
                order.getAgentOpinion(),
                evaluatedById,
                evaluatedByName,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
