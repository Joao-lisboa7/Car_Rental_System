package com.car_rental_system.backend.order.dto;

import jakarta.validation.constraints.Size;

public record UpdateRentalOrderDTO(
        @Size(max = 1000, message = "As observações não podem ultrapassar 1000 caracteres.")
        String clientNotes
) {
}
