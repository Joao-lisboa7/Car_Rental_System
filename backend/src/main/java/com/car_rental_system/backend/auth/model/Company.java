package com.car_rental_system.backend.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "companies")
public class Company extends Users {
  private String companyName;
  private String cnpj;

  public Company() {
    super();
  }

  public Company(String companyName, String cnpj) {
    this.companyName = companyName;
    this.cnpj = cnpj;
  }

  public String getCompanyName() {
    return companyName;
  }

  public void setCompanyName(String companyName) {
    this.companyName = companyName;
  }

  public String getCnpj() {
    return cnpj;
  }

  public void setCnpj(String cnpj) {
    this.cnpj = cnpj;
  }
}
