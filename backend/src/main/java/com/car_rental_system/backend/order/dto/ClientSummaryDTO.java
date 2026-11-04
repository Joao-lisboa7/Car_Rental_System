package com.car_rental_system.backend.order.dto;

import java.math.BigDecimal;

public record ClientSummaryDTO(
        String name,
        String profession,
        BigDecimal totalIncome
) {
}
