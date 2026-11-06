package com.mandiconnect.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

/** A slot booked by a farmer to sell a crop in a mandi. */
@Entity
@Table(name = "bookings")
public class Booking {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // example: BAR-0007 (first 3 letters of the mandi + booking number)
  @Column(length = 20)
  private String token;

  @ManyToOne(optional = false)
  @JoinColumn(name = "farmer_id")
  private Farmer farmer;

  @ManyToOne(optional = false)
  @JoinColumn(name = "mandi_id")
  private Mandi mandi;

  @ManyToOne(optional = false)
  @JoinColumn(name = "crop_id")
  private Crop crop;

  private double quantityQuintals;

  @Column(name = "slot_date", nullable = false)
  private LocalDate slotDate;

  // example: 10:00-11:00
  @Column(length = 20)
  private String slotTime;

  // BOOKED, CHECKED_IN, COMPLETED or CANCELLED
  @Column(length = 15)
  private String status;

  public Booking() {}

  public Long getId() { return id; }
  public String getToken() { return token; }
  public void setToken(String token) { this.token = token; }
  public Farmer getFarmer() { return farmer; }
  public void setFarmer(Farmer farmer) { this.farmer = farmer; }
  public Mandi getMandi() { return mandi; }
  public void setMandi(Mandi mandi) { this.mandi = mandi; }
  public Crop getCrop() { return crop; }
  public void setCrop(Crop crop) { this.crop = crop; }
  public double getQuantityQuintals() { return quantityQuintals; }
  public void setQuantityQuintals(double quantityQuintals) { this.quantityQuintals = quantityQuintals; }
  public LocalDate getSlotDate() { return slotDate; }
  public void setSlotDate(LocalDate slotDate) { this.slotDate = slotDate; }
  public String getSlotTime() { return slotTime; }
  public void setSlotTime(String slotTime) { this.slotTime = slotTime; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
}
