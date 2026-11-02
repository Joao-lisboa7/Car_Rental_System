package com.car_rental_system.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterBankDTO(
  @NotBlank String name,
  @NotBlank @Email String email,
  @NotBlank String bankName,
  @NotBlank String password,
  @NotBlank String cnpj,
  @NotBlank String codeBank
) {}