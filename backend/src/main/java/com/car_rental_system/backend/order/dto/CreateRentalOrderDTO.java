package com.car_rental_system.backend.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateRentalOrderDTO(
        @NotNull(message = "O ID do automóvel é obrigatório.")
        Long carId,

        @Size(max = 1000, message = "As observações não podem ultrapassar 1000 caracteres.")
        String clientNotes
) {
}
