// package com.car_rental_system.backend.car.service;

// import com.car_rental_system.backend.auth.model.Users;
// import com.car_rental_system.backend.car.dto.CarResponseDTO;
// import com.car_rental_system.backend.car.dto.RegisterCarDTO;
// import com.car_rental_system.backend.car.model.Car;
// import com.car_rental_system.backend.car.repository.CarRepository;
// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Service;
// import org.springframework.web.server.ResponseStatusException;

// import java.util.List;

// @Service
// public class CarService {

//     private final CarRepository carRepository;

//     public CarService(CarRepository carRepository) {
//         this.carRepository = carRepository;
//     }

//     public void registerCar(RegisterCarDTO dto, Users owner) {
//         if (carRepository.existsByLicensePlate(dto.licensePlate()) || carRepository.existsByRegistration(dto.registration())) {
//             throw new ResponseStatusException(HttpStatus.CONFLICT, "Automóvel com esta matrícula ou placa já registado.");
//         }

//         Car newCar = new Car(
//                 dto.registration(),
//                 dto.brand(),
//                 dto.model(),
//                 dto.fabricationYear(),
//                 dto.licensePlate(),
//                 owner
//         );

//         carRepository.save(newCar);
//     }

//     public List<CarResponseDTO> listAllCars() {
//         // Busca todos os carros, converte cada um para CarResponseDTO e retorna uma lista
//         return carRepository.findAll()
//                 .stream()
//                 .map(CarResponseDTO::new)
//                 .toList();
//     }
// }