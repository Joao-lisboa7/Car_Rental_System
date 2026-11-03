package com.car_rental_system.backend.car.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterCarDTO(
  @NotBlank String registration,
  @NotBlank String brand,
  @NotBlank String model,
  @NotNull Integer fabricationYear,
  @NotBlank String licensePlate,
  Boolean available
){}
