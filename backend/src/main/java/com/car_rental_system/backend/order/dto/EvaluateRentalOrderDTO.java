package com.car_rental_system.backend.order.dto;

import com.car_rental_system.backend.order.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EvaluateRentalOrderDTO(
        @NotNull(message = "O status da avaliação é obrigatório.")
        OrderStatus status,

        @Size(max = 2000, message = "O parecer não pode ultrapassar 2000 caracteres.")
        String agentOpinion
) {
}
