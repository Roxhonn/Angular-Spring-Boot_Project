package com.mandiconnect.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A mandi (market yard) where farmers sell their crops. */
@Entity
@Table(name = "mandis")
public class Mandi {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private String district;

  // maximum number of bookings (slots) the mandi accepts in one day
  private int dailyCapacity;

  // OPEN or CLOSED
  @Column(length = 10)
  private String status;

  public Mandi() {}

  public Mandi(String name, String district, int dailyCapacity, String status) {
    this.name = name;
    this.district = district;
    this.dailyCapacity = dailyCapacity;
    this.status = status;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getDistrict() { return district; }
  public void setDistrict(String district) { this.district = district; }
  public int getDailyCapacity() { return dailyCapacity; }
  public void setDailyCapacity(int dailyCapacity) { this.dailyCapacity = dailyCapacity; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
}
