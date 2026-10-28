package com.car_rental_system.backend.auth.model;

import java.math.BigDecimal;

public class IncomeSource {
  private String employerName;
  private BigDecimal income;
  
  public IncomeSource() {}

  public IncomeSource(String employerName, BigDecimal income) {
    this.employerName = employerName;
    this.income = income;
  }
  public String getEmployerName() {
    return employerName;
  }
  public void setEmployerName(String employerName) {
    this.employerName = employerName;
  }
  public BigDecimal getIncome() {
    return income;
  }
  public void setIncome(BigDecimal income) {
    this.income = income;
  }
}
