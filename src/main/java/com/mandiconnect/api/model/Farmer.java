package com.mandiconnect.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A registered farmer. */
@Entity
@Table(name = "farmers")
public class Farmer {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true, length = 10)
  private String mobile;

  private String village;

  @Column(nullable = false)
  private String district;

  public Farmer() {}

  public Farmer(String name, String mobile, String village, String district) {
    this.name = name;
    this.mobile = mobile;
    this.village = village;
    this.district = district;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getMobile() { return mobile; }
  public void setMobile(String mobile) { this.mobile = mobile; }
  public String getVillage() { return village; }
  public void setVillage(String village) { this.village = village; }
  public String getDistrict() { return district; }
  public void setDistrict(String district) { this.district = district; }
}
