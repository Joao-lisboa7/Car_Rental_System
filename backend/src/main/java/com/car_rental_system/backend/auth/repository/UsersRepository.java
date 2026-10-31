package com.car_rental_system.backend.auth.repository;

import java.util.Optional;
import com.car_rental_system.backend.auth.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    
    // Método auxiliar para validar se o e-mail já existe no registro
    boolean existsByEmail(String email);
}