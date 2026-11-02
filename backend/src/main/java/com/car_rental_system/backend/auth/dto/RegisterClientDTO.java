package com.car_rental_system.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterClientDTO(
  @NotBlank String name,
  @NotBlank @Email String email,
  @NotBlank String password,
  @NotBlank String cpf,
  @NotBlank String rg,
  @NotBlank String profession
) 
{}