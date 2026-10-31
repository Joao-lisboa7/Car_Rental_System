package com.car_rental_system.backend.infra.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.car_rental_system.backend.auth.repository.UsersRepository;

@Component
public class SecurityFilter extends OncePerRequestFilter{
  TokenService tokenService = new TokenService();

  @Autowired 
  UsersRepository usersRepository; 
}
