package com.car_rental_system.backend.auth.controller;

import com.car_rental_system.backend.auth.dto.LoginRequestDTO;
import com.car_rental_system.backend.auth.dto.RegisterBankDTO;
import com.car_rental_system.backend.auth.dto.RegisterClientDTO;
import com.car_rental_system.backend.auth.dto.RegisterCompanyDTO;
import com.car_rental_system.backend.auth.dto.ResponseDTO;
import com.car_rental_system.backend.auth.enums.UserRole;
import com.car_rental_system.backend.auth.model.BankUser;
import com.car_rental_system.backend.auth.model.ClientUser;
import com.car_rental_system.backend.auth.model.CompanyUser;
import com.car_rental_system.backend.auth.model.Users;
import com.car_rental_system.backend.auth.repository.UsersRepository;
import com.car_rental_system.backend.infra.security.TokenService;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO body) {
        if (body == null || body.email() == null || body.password() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas");
        }

        Optional<Users> user = repository.findByEmail(body.email());
        if (user.isEmpty() || !passwordEncoder.matches(body.password(), user.orElseThrow().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas");
        }

        Users authenticatedUser = user.orElseThrow();
        String token = tokenService.generateToken(authenticatedUser);
        return ResponseEntity.ok(new ResponseDTO(authenticatedUser.getName(), token));
    }

    @PostMapping("/register/client")
    public ResponseEntity<?> registerClient(@RequestBody @Valid RegisterClientDTO body) {
        if (repository.existsByEmail(body.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já está em uso.");
        }

        ClientUser newUser = new ClientUser();
        setCommonUserData(newUser, body.name(), body.email(), body.password(), UserRole.CLIENT);
        newUser.setCpf(body.cpf());
        newUser.setRg(body.rg());
        newUser.setProfession(body.profession());

        this.repository.save(newUser);
        String token = tokenService.generateToken(newUser);
        return ResponseEntity.ok(new ResponseDTO(newUser.getName(), token));
    }

    @PostMapping("/register/company")
    public ResponseEntity<?> registerCompany(@RequestBody @Valid RegisterCompanyDTO body) {
        if (repository.existsByEmail(body.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já está em uso.");
        }

        CompanyUser newUser = new CompanyUser();
        setCommonUserData(newUser, body.name(), body.email(), body.password(), UserRole.COMPANY);
        newUser.setCompanyName(body.companyName());
        newUser.setCnpj(body.cnpj());

        this.repository.save(newUser);
        String token = tokenService.generateToken(newUser);
        return ResponseEntity.ok(new ResponseDTO(newUser.getName(), token));
    }

    @PostMapping("/register/bank")
    public ResponseEntity<?> registerBank(@RequestBody @Valid RegisterBankDTO body) {
        if (repository.existsByEmail(body.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já está em uso.");
        }

        BankUser newUser = new BankUser();
        setCommonUserData(newUser, body.name(), body.email(), body.password(), UserRole.Bank);
        newUser.setBankName(body.bankName());
        newUser.setCnpj(body.cnpj());
        newUser.setCodeBank(body.codeBank());

        this.repository.save(newUser);
        String token = tokenService.generateToken(newUser);
        return ResponseEntity.ok(new ResponseDTO(newUser.getName(), token));
    }

    private void setCommonUserData(Users user, String name, String email, String password, UserRole role) {
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
    }
}