package com.car_rental_system.backend.infra.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // 1. Desabilita proteção CSRF (Padrão para APIs REST stateless)
                .csrf(csrf -> csrf.disable())
                
                // 2. Define a política de sessão como STATELESS (Sem estado/Sem guardar sessão)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // 3. Configuração de autorização de rotas
                .authorizeHttpRequests(authorize -> authorize
                        // Libera endpoints de login e cadastro para todos
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register/**").permitAll()
                        
                        // Exemplo de como restringir uma rota apenas para Bancos e Empresas no futuro:
                        // .requestMatchers(HttpMethod.PATCH, "/orders/*/evaluate").hasAnyRole("COMPANY", "BANK")
                        
                        // Qualquer outra requisição exigirá um token JWT válido
                        .anyRequest().authenticated()
                )
                
                // 4. Adiciona o filtro personalizado ANTES do filtro padrão do Spring
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                
                .build();
    }

    // Bean necessário para que o Spring consiga injetar o AuthenticationManager no AuthController
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // Bean do algoritmo de criptografia de senhas (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}