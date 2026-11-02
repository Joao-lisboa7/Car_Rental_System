// package com.car_rental_system.backend.car.controller;

// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.car_rental_system.backend.auth.model.Users;
// import com.car_rental_system.backend.car.dto.RegisterCarDTO;
// import com.car_rental_system.backend.car.model.Car;
// import com.car_rental_system.backend.car.repository.CarRepository;

// import jakarta.validation.Valid;

// @RestController 
// @RequestMapping("/cars")
// public class CarController {
//   private final CarRepository carRepository;

//   public CarController(CarRepository carRepository) {
//       this.carRepository = carRepository;
//   }

// @PostMapping
//     public ResponseEntity<?> registerCar(@RequestBody @Valid RegisterCarDTO body, Authentication authentication) {
        
//         // Verifica se o carro já existe para evitar duplicações
//         if (carRepository.existsByLicensePlate(body.licensePlate()) || carRepository.existsByRegistration(body.registration())) {
//             return ResponseEntity.status(HttpStatus.CONFLICT).body("Automóvel com esta matrícula ou placa já registado.");
//         }

//         // Recupera o utilizador autenticado a partir do Token JWT
//         Users loggedInUser = (Users) authentication.getPrincipal();

//         Car newCar = new Car(
//                 body.registration(),
//                 body.brand(),
//                 body.model(),
//                 body.fabricationYear(),
//                 body.licensePlate(),
//                 loggedInUser // Define o dono do carro automaticamente!
//         );

//         carRepository.save(newCar);

//         return ResponseEntity.status(HttpStatus.CREATED).body("Automóvel registado com sucesso!");
//     }
  

// }
