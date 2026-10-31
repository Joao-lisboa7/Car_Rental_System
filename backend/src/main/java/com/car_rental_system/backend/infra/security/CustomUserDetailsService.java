package com.car_rental_system.backend.infra.security;

import java.util.ArrayList;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.car_rental_system.backend.auth.repository.UsersRepository;
import com.car_rental_system.backend.auth.model.Users;

public class CustomUserDetailsService implements UserDetailsService{
  private final UsersRepository repository;

  public CustomUserDetailsService(UsersRepository repository){
    this.repository = repository;
  }

  @Override 
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
    Users user = this.repository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), new ArrayList<>());
  }
}
