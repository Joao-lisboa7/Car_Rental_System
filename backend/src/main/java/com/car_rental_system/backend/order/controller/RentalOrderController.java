package com.car_rental_system.backend.order.controller;

import com.car_rental_system.backend.auth.model.Users;
import com.car_rental_system.backend.order.dto.*;
import com.car_rental_system.backend.order.enums.OrderStatus;
import com.car_rental_system.backend.order.service.RentalOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class RentalOrderController {

    private final RentalOrderService rentalOrderService;

    public RentalOrderController(RentalOrderService rentalOrderService) {
        this.rentalOrderService = rentalOrderService;
    }

    // --- Endpoints do Cliente ---

    @PostMapping
    public ResponseEntity<RentalOrderResponseDTO> createOrder(
            @RequestBody @Valid CreateRentalOrderDTO body,
            Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        RentalOrderResponseDTO response = rentalOrderService.createOrder(body, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<RentalOrderResponseDTO>> listMyOrders(Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        List<RentalOrderResponseDTO> orders = rentalOrderService.listMyOrders(currentUser);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<RentalOrderResponseDTO> getMyOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        RentalOrderResponseDTO order = rentalOrderService.getMyOrderById(id, currentUser);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/me/{id}")
    public ResponseEntity<RentalOrderResponseDTO> updateMyOrder(
            @PathVariable Long id,
            @RequestBody @Valid UpdateRentalOrderDTO body,
            Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        RentalOrderResponseDTO order = rentalOrderService.updateMyOrder(id, body, currentUser);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/me/{id}/cancel")
    public ResponseEntity<RentalOrderResponseDTO> cancelMyOrder(
            @PathVariable Long id,
            Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        RentalOrderResponseDTO order = rentalOrderService.cancelMyOrder(id, currentUser);
        return ResponseEntity.ok(order);
    }

    // --- Endpoints dos Agentes (Empresas e Bancos) ---

    @GetMapping("/agent")
    public ResponseEntity<List<AgentRentalOrderResponseDTO>> listOrdersForAgent(
            @RequestParam(required = false) OrderStatus status,
            Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        List<AgentRentalOrderResponseDTO> orders = rentalOrderService.listOrdersForAgent(status, currentUser);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/agent/{id}")
    public ResponseEntity<AgentRentalOrderResponseDTO> getOrderByIdForAgent(
            @PathVariable Long id,
            Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        AgentRentalOrderResponseDTO order = rentalOrderService.getOrderByIdForAgent(id, currentUser);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/agent/{id}/evaluate")
    public ResponseEntity<AgentRentalOrderResponseDTO> evaluateOrder(
            @PathVariable Long id,
            @RequestBody @Valid EvaluateRentalOrderDTO body,
            Authentication authentication) {
        Users currentUser = (Users) authentication.getPrincipal();
        AgentRentalOrderResponseDTO order = rentalOrderService.evaluateOrder(id, body, currentUser);
        return ResponseEntity.ok(order);
    }
}
