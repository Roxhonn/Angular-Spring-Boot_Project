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

/** Price of one crop in one mandi on one day (Rs per quintal). */
@Entity
@Table(name = "mandi_prices")
public class MandiPrice {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "mandi_id")
  private Mandi mandi;

  @ManyToOne(optional = false)
  @JoinColumn(name = "crop_id")
  private Crop crop;

  @Column(name = "price_date", nullable = false)
  private LocalDate priceDate;

  private double minPrice;
  private double maxPrice;
  private double modalPrice;

  public MandiPrice() {}

  public MandiPrice(Mandi mandi, Crop crop, LocalDate priceDate,
                    double minPrice, double maxPrice, double modalPrice) {
    this.mandi = mandi;
    this.crop = crop;
    this.priceDate = priceDate;
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.modalPrice = modalPrice;
  }

  public Long getId() { return id; }
  public Mandi getMandi() { return mandi; }
  public Crop getCrop() { return crop; }
  public LocalDate getPriceDate() { return priceDate; }
  public double getMinPrice() { return minPrice; }
  public double getMaxPrice() { return maxPrice; }
  public double getModalPrice() { return modalPrice; }

  public void setPrices(double minPrice, double maxPrice, double modalPrice) {
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.modalPrice = modalPrice;
  }
}
