package com.car_rental_system.backend.infra.security;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.car_rental_system.backend.auth.model.Users;
import com.car_rental_system.backend.auth.repository.UsersRepository;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsersRepository usersRepository;

    public SecurityFilter(TokenService tokenService, UsersRepository usersRepository) {
        this.tokenService = tokenService;
        this.usersRepository = usersRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. Recupera o token do cabeçalho
        var token = this.recoverToken(request);

        if (token != null) {
            // 2. Valida o token e extrai o e-mail (subject)
            var email = tokenService.validateToken(token);

            if (email != null) {
                // 3. Busca o usuário no banco de dados (Serve para ClientUser, CompanyUser ou BankUser)
                Users user = usersRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

                // 4. Converte a Role do seu Enum para a autoridade do Spring Security (Ex: ROLE_CLIENT)
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

                // 5. Cria o objeto de autenticação
                var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);

                // 6. Força a autenticação no contexto do Spring Security
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // Continua o fluxo da requisição (passa para o próximo filtro ou para o Controller)
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        
        // Verifica se o cabeçalho existe e começa exatamente com "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        
        // Retira a palavra "Bearer " (com espaço) deixando apenas o hash do token
        return authHeader.replace("Bearer ", "");
    }
}