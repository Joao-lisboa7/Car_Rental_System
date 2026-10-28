package com.car_rental_system.backend.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "banks")
public class Bank extends Users {
    private String bankName;
    private String cnpj;
    private String codeBank; // Ex: 001 (Banco do Brasil)

    public Bank() {
      super();
    }

    public Bank(String bankName, String cnpj, String codeBank) {
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
