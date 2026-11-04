package com.car_rental_system.backend.order.dto;

import com.car_rental_system.backend.car.dto.CarResponseDTO;
import com.car_rental_system.backend.order.enums.OrderStatus;
import com.car_rental_system.backend.order.model.RentalOrder;

import java.time.LocalDateTime;

public record RentalOrderResponseDTO(
        Long id,
        Long clientId,
        String clientName,
        CarResponseDTO car,
        OrderStatus status,
        String clientNotes,
        String agentOpinion,
        Long evaluatedById,
        String evaluatedByName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static RentalOrderResponseDTO fromEntity(RentalOrder order) {
        Long evaluatedById = order.getEvaluatedBy() != null ? order.getEvaluatedBy().getId() : null;
        String evaluatedByName = order.getEvaluatedBy() != null ? order.getEvaluatedBy().getName() : null;
        Long clientId = order.getClient() != null ? order.getClient().getId() : null;
        String clientName = order.getClient() != null ? order.getClient().getName() : null;

        return new RentalOrderResponseDTO(
                order.getId(),
                clientId,
                clientName,
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
