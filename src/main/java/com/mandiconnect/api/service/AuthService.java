package com.mandiconnect.api.service;

import com.mandiconnect.api.dto.AuthResponse;
import com.mandiconnect.api.dto.LoginRequest;
import com.mandiconnect.api.dto.RegisterRequest;
import com.mandiconnect.api.exception.BadRequestException;
import com.mandiconnect.api.model.Farmer;
import com.mandiconnect.api.model.User;
import com.mandiconnect.api.repository.FarmerRepository;
import com.mandiconnect.api.repository.UserRepository;
import com.mandiconnect.api.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final FarmerRepository farmerRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository userRepository, FarmerRepository farmerRepository,
                     PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.farmerRepository = farmerRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByUsername(request.username().trim())
        .orElseThrow(() -> new BadRequestException("Wrong username or password"));
    if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new BadRequestException("Wrong username or password");
    }
    return toResponse(user);
  }

  /** A new farmer creates an account. A farmer record and a login account are saved together. */
  @Transactional
  public AuthResponse registerFarmer(RegisterRequest request) {
    if (farmerRepository.findByMobile(request.mobile()).isPresent()
        || userRepository.existsByUsername(request.mobile())) {
      throw new BadRequestException("This mobile number is already registered");
    }
    Farmer farmer = farmerRepository.save(new Farmer(request.name().trim(), request.mobile(),
        request.village(), request.district().trim()));

    User user = new User();
    user.setName(farmer.getName());
    user.setUsername(request.mobile());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setRole("FARMER");
    user.setFarmer(farmer);
    return toResponse(userRepository.save(user));
  }

  private AuthResponse toResponse(User user) {
    String token = jwtService.createToken(user.getUsername(), user.getRole());
    Long mandiId = user.getMandi() == null ? null : user.getMandi().getId();
    String mandiName = user.getMandi() == null ? null : user.getMandi().getName();
    Long farmerId = user.getFarmer() == null ? null : user.getFarmer().getId();
    return new AuthResponse(token, user.getRole(), user.getName(), user.getUsername(),
        mandiId, mandiName, farmerId);
  }
}
