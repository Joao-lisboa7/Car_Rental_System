package com.car_rental_system.backend.car.repository;

import com.car_rental_system.backend.car.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface CarRepository extends JpaRepository<Car, Long>{
  boolean existsByLicensePlate(String licensePlate);
  boolean existsByRegistration(String registration);
}
