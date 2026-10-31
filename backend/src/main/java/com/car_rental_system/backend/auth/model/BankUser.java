package com.car_rental_system.backend.auth.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "banks")
public class BankUser extends Users {
  @Column(nullable = false, unique = true)
    private String bankName;

    @Column(nullable = false, unique = true)
    private String cnpj;

    @Column(nullable = false, unique = true)
    private String codeBank; // Ex: 001 (Banco do Brasil)

    public BankUser() {
      super();
    }

    public BankUser(String bankName, String cnpj, String codeBank) {
      this.bankName = bankName;
      this.cnpj = cnpj;
      this.codeBank = codeBank;
    }

    public String getBankName() {
      return bankName;
    }

    public void setBankName(String bankName) {
      this.bankName = bankName;
    }

    public String getCnpj() {
      return cnpj;
    }

    public void setCnpj(String cnpj) {
      this.cnpj = cnpj;
    }

    public String getCodeBank() {
      return codeBank;
    }

    public void setCodeBank(String codeBank) {
      this.codeBank = codeBank;
    }

    
}
