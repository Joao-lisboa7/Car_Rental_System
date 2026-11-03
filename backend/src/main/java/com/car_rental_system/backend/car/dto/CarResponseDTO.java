package com.car_rental_system.backend.car.dto;

import com.car_rental_system.backend.car.model.Car;

public record CarResponseDTO(
        Long id,
        String registration,
        String brand,
        String model,
        Integer fabricationYear,
        String licensePlate,
        Boolean available,
        String ownerName
) {
    public CarResponseDTO(Car car) {
        this(
                car.getId(),
                car.getRegistration(),
                car.getBrand(),
                car.getModel(),
                car.getFabricationYear(),
                car.getLicensePlate(),
                car.getAvailable(),
                car.getOwner().getName()
        );
    }
}
