package com.car_rental_system.backend.car.service;

import com.car_rental_system.backend.auth.enums.UserRole;
import com.car_rental_system.backend.auth.model.ClientUser;
import com.car_rental_system.backend.auth.model.Users;
import com.car_rental_system.backend.car.dto.CarResponseDTO;
import com.car_rental_system.backend.car.dto.RegisterCarDTO;
import com.car_rental_system.backend.car.model.Car;
import com.car_rental_system.backend.car.repository.CarRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarServiceTest {

    @Mock
    private CarRepository carRepository;

    @InjectMocks
    private CarService carService;

    private Users userA;
    private Users userB;

    @BeforeEach
    void setUp() {
        userA = new ClientUser();
        userA.setId(1L);
        userA.setName("João Silva");
        userA.setEmail("joao@test.com");
        userA.setRole(UserRole.CLIENT);

        userB = new ClientUser();
        userB.setId(2L);
        userB.setName("Maria Souza");
        userB.setEmail("maria@test.com");
        userB.setRole(UserRole.CLIENT);
    }

    @Test
    void registerCar_shouldSaveSuccessfullyWithDefaultAvailableFalse() {
        RegisterCarDTO dto = new RegisterCarDTO("REG123", "Toyota", "Corolla", 2022, "ABC-1234", null);
        when(carRepository.existsByLicensePlate("ABC-1234")).thenReturn(false);
        when(carRepository.existsByRegistration("REG123")).thenReturn(false);

        carService.registerCar(dto, userA);

        ArgumentCaptor<Car> carCaptor = ArgumentCaptor.forClass(Car.class);
        verify(carRepository).save(carCaptor.capture());
        Car saved = carCaptor.getValue();
        assertEquals("REG123", saved.getRegistration());
        assertEquals("Toyota", saved.getBrand());
        assertEquals("Corolla", saved.getModel());
        assertEquals(2022, saved.getFabricationYear());
        assertEquals("ABC-1234", saved.getLicensePlate());
        assertFalse(saved.getAvailable());
        assertEquals(userA, saved.getOwner());
    }

    @Test
    void registerCar_shouldSaveSuccessfullyWithExplicitAvailableTrue() {
        RegisterCarDTO dto = new RegisterCarDTO("REG123", "Toyota", "Corolla", 2022, "ABC-1234", true);
        when(carRepository.existsByLicensePlate("ABC-1234")).thenReturn(false);
        when(carRepository.existsByRegistration("REG123")).thenReturn(false);

        carService.registerCar(dto, userA);

        ArgumentCaptor<Car> carCaptor = ArgumentCaptor.forClass(Car.class);
        verify(carRepository).save(carCaptor.capture());
        Car saved = carCaptor.getValue();
        assertTrue(saved.getAvailable());
    }

    @Test
    void registerCar_shouldThrowConflictWhenPlateOrRegistrationExists() {
        RegisterCarDTO dto = new RegisterCarDTO("REG123", "Toyota", "Corolla", 2022, "ABC-1234", false);
        when(carRepository.existsByLicensePlate("ABC-1234")).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> carService.registerCar(dto, userA));
        verify(carRepository, never()).save(any());
    }

    @Test
    void listMyCars_shouldReturnOnlyOwnerCars() {
        Car car1 = new Car(1L, "REG1", "Toyota", "Corolla", 2022, "ABC-1234", false, userA);
        when(carRepository.findByOwner(userA)).thenReturn(List.of(car1));

        List<CarResponseDTO> result = carService.listMyCars(userA);

        assertEquals(1, result.size());
        assertEquals("REG1", result.get(0).registration());
        assertFalse(result.get(0).available());
        assertEquals("João Silva", result.get(0).ownerName());
    }

    @Test
    void listAvailableCars_shouldReturnOnlyCarsWithAvailableTrueFromOtherOwners() {
        Car car2 = new Car(2L, "REG2", "Honda", "Civic", 2023, "XYZ-9876", true, userB);
        when(carRepository.findByAvailableTrueAndOwnerNot(userA)).thenReturn(List.of(car2));

        List<CarResponseDTO> result = carService.listAvailableCars(userA);

        assertEquals(1, result.size());
        assertEquals("REG2", result.get(0).registration());
        assertTrue(result.get(0).available());
        assertEquals("Maria Souza", result.get(0).ownerName());
    }
}
