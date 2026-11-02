package com.car_rental_system.backend.car.model;

import com.car_rental_system.backend.auth.model.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cars")
public class Car {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String registration;

  @Column(nullable = false)
  private String brand; 

  @Column(nullable = false)
  private String model;

  @Column(nullable = false)
  private Integer fabricationYear;

  @Column(nullable = false, unique = true)
  private String licensePlate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false)
  private Users owner;
  
  public Car() {}
  

  public Car(Long id, String registration, String brand, String model, Integer fabricationYear, String licensePlate,
    Users owner) {
    this.id = id;
    this.registration = registration;
    this.brand = brand;
    this.model = model;
    this.fabricationYear = fabricationYear;
    this.licensePlate = licensePlate;
    this.owner = owner;
  }


  public Long getId() {
    return id;
  }


  public void setId(Long id) {
    this.id = id;
  }


  public String getRegistration() {
    return registration;
  }


  public void setRegistration(String registration) {
    this.registration = registration;
  }


  public String getBrand() {
    return brand;
  }


  public void setBrand(String brand) {
    this.brand = brand;
  }


  public String getModel() {
    return model;
  }


  public void setModel(String model) {
    this.model = model;
  }


  public Integer getFabricationYear() {
    return fabricationYear;
  }


  public void setFabricationYear(Integer fabricationYear) {
    this.fabricationYear = fabricationYear;
  }


  public String getLicensePlate() {
    return licensePlate;
  }


  public void setLicensePlate(String licensePlate) {
    this.licensePlate = licensePlate;
  }


  public Users getOwner() {
    return owner;
  }


  public void setOwner(Users owner) {
    this.owner = owner;
  }
  
}