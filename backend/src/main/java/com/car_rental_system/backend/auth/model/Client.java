package com.car_rental_system.backend.auth.model;

import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "clients")
public class Client extends Users {
    private String name;
    private String cpf;
    private String rg;
    private String profession;
    
    @ElementCollection
    private List<IncomeSource> incomeSources;
     
    public Client() {
      super();
    }

    public Client(String name, String cpf, String rg, String profession, List<IncomeSource> incomeSources) {
      this.name = name;
      this.cpf = cpf;
      this.rg = rg;
      this.profession = profession;
      this.incomeSources = incomeSources;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getCpf() {
      return cpf;
    }

    public void setCpf(String cpf) {
      this.cpf = cpf;
    }

    public String getRg() {
      return rg;
    }

    public void setRg(String rg) {
      this.rg = rg;
    }

    public String getProfession() {
      return profession;
    }

    public void setProfession(String profession) {
      this.profession = profession;
    }

    public List<IncomeSource> getIncomeSources() {
      return incomeSources;
    }

    public void setIncomeSources(List<IncomeSource> incomeSources) {
      this.incomeSources = incomeSources;
    }
}
