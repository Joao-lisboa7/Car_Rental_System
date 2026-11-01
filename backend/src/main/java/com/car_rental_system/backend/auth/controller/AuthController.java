package com.car_rental_system.backend.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.car_rental_system.backend.auth.dto.LoginRequestDTO;
import com.car_rental_system.backend.auth.dto.ResponseDTO;
import com.car_rental_system.backend.auth.model.Users;
import com.car_rental_system.backend.auth.repository.UsersRepository;
import com.car_rental_system.backend.infra.security.TokenService;

@RestController 
@RequestMapping("/auth")
public class AuthController {
  private final UsersRepository repository;
  private final PasswordEncoder passwordEncoder;
  private final TokenService tokenService;

  public AuthController(UsersRepository repository, PasswordEncoder passwordEncoder, TokenService tokenService) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
    this.tokenService = tokenService;
  }


  @PostMapping("/login")
  public ResponseEntity login(@RequestBody LoginRequestDTO body){
    Users user = this.repository.findByEmail(body.email()).orElseThrow(() -> new RuntimeException("User not found"));
    if(passwordEncoder.matches(user.getPassword(), body.password())){
      String token = this.tokenService.generateToken(user);
      return ResponseEntity.ok(new ResponseDTO(user.getEmail(), token));
    }
    return ResponseEntity.badRequest().build();
  }

  @PostMapping("/register")
  public ResponseEntity register(@RequestBody LoginRequestDTO body){
    Users user = this.repository.findByEmail(body.email()).orElseThrow(() -> new RuntimeException("User not found"));
    if(passwordEncoder.matches(user.getPassword(), body.password())){
      String token = this.tokenService.generateToken(user);
      return ResponseEntity.ok(new ResponseDTO(user.getName(), token));
    }
    return ResponseEntity.badRequest().build();
  }

}
