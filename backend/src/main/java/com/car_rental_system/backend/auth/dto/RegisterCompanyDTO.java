package com.car_rental_system.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterCompanyDTO(
  @NotBlank String name,
  @NotBlank @Email String email,
  @NotBlank String companyName,
  @NotBlank String password,
  @NotBlank String cnpj
){}