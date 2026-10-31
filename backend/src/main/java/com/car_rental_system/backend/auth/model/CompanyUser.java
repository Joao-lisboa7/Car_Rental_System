package com.car_rental_system.backend.auth.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "companies")
public class CompanyUser extends Users {

  @Column(nullable = false, unique = true)
  private String companyName;

  @Column(nullable = false, unique = true)
  private String cnpj;

  public CompanyUser() {
    super();
  }

  public CompanyUser(String companyName, String cnpj) {
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
