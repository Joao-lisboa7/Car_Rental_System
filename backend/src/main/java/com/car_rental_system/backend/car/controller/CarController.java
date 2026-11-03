package com.car_rental_system.backend.car.controller;

import com.car_rental_system.backend.auth.model.Users;
import com.car_rental_system.backend.car.dto.CarResponseDTO;
import com.car_rental_system.backend.car.dto.RegisterCarDTO;
import com.car_rental_system.backend.car.service.CarService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cars")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping
    public ResponseEntity<String> registerCar(@RequestBody @Valid RegisterCarDTO body, Authentication authentication) {
        Users loggedInUser = (Users) authentication.getPrincipal();
        carService.registerCar(body, loggedInUser);
        
        return ResponseEntity.status(HttpStatus.CREATED).body("Automóvel registado com sucesso!");
    }

    @GetMapping
    public ResponseEntity<List<CarResponseDTO>> listAllCars() {
        List<CarResponseDTO> cars = carService.listAllCars();
        return ResponseEntity.ok(cars);
    }

    @GetMapping("/me")
    public ResponseEntity<List<CarResponseDTO>> listMyCars(Authentication authentication) {
        Users loggedInUser = (Users) authentication.getPrincipal();
        List<CarResponseDTO> cars = carService.listMyCars(loggedInUser);
        return ResponseEntity.ok(cars);
    }

    @GetMapping("/available")
    public ResponseEntity<List<CarResponseDTO>> listAvailableCars(Authentication authentication) {
        Users loggedInUser = (Users) authentication.getPrincipal();
        List<CarResponseDTO> cars = carService.listAvailableCars(loggedInUser);
        return ResponseEntity.ok(cars);
    }
}
