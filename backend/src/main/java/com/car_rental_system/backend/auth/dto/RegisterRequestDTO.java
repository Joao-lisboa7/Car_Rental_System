package com.car_rental_system.backend.auth.dto;

import com.car_rental_system.backend.auth.enums.UserRole;

public record RegisterRequestDTO(
        String email, 
        String password, 
        UserRole role,
        
        // Campos de Cliente Individual
        String name, 
        String cpf, 
        String rg, 
        String profession,
        
        // Campos de Empresa
        String companyName, 
        String cnpj,
        
        // Campos de Banco
        String bankName, 
        String codeBank
) {
}