package com.mandiconnect.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A login account. Role is FARMER, OFFICER (mandi officer) or ADMIN. */
@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true)
  private String username;

  // BCrypt hash, the real password is never stored
  @Column(nullable = false)
  private String passwordHash;

  @Column(nullable = false, length = 10)
  private String role;

  // only for OFFICER: the mandi he or she works in
  @ManyToOne
  @JoinColumn(name = "mandi_id")
  private Mandi mandi;

  // only for FARMER: the farmer record of this account
  @ManyToOne
  @JoinColumn(name = "farmer_id")
  private Farmer farmer;

  private boolean active = true;

  public User() {}

  public Long getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }
  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public String getRole() { return role; }
  public void setRole(String role) { this.role = role; }
  public Mandi getMandi() { return mandi; }
  public void setMandi(Mandi mandi) { this.mandi = mandi; }
  public Farmer getFarmer() { return farmer; }
  public void setFarmer(Farmer farmer) { this.farmer = farmer; }
  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }
}
