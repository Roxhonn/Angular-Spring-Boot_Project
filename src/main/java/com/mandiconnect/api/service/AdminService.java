package com.mandiconnect.api.service;

import com.mandiconnect.api.dto.AdminSummaryDto;
import com.mandiconnect.api.dto.MandiDto;
import com.mandiconnect.api.dto.MandiRequest;
import com.mandiconnect.api.dto.MandiUpdateRequest;
import com.mandiconnect.api.dto.OfficerRequest;
import com.mandiconnect.api.dto.UserDto;
import com.mandiconnect.api.exception.BadRequestException;
import com.mandiconnect.api.exception.ResourceNotFoundException;
import com.mandiconnect.api.model.Farmer;
import com.mandiconnect.api.model.Mandi;
import com.mandiconnect.api.model.User;
import com.mandiconnect.api.repository.BookingRepository;
import com.mandiconnect.api.repository.FarmerRepository;
import com.mandiconnect.api.repository.MandiPriceRepository;
import com.mandiconnect.api.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.mandiconnect.api.repository.MandiRepository;
import org.springframework.stereotype.Service;

/** Work done by the admin: mandis, officers, farmers and the summary numbers. */
@Service
public class AdminService {
  private final MandiRepository mandiRepository;
  private final UserRepository userRepository;
  private final FarmerRepository farmerRepository;
  private final BookingRepository bookingRepository;
  private final MandiPriceRepository priceRepository;
  private final PasswordEncoder passwordEncoder;
  private final MandiService mandiService;

  public AdminService(MandiRepository mandiRepository, UserRepository userRepository,
                      FarmerRepository farmerRepository, BookingRepository bookingRepository,
                      MandiPriceRepository priceRepository, PasswordEncoder passwordEncoder,
                      MandiService mandiService) {
    this.mandiRepository = mandiRepository;
    this.userRepository = userRepository;
    this.farmerRepository = farmerRepository;
    this.bookingRepository = bookingRepository;
    this.priceRepository = priceRepository;
    this.passwordEncoder = passwordEncoder;
    this.mandiService = mandiService;
  }

  public AdminSummaryDto getSummary() {
    return new AdminSummaryDto(
        mandiRepository.count(),
        farmerRepository.count(),
        userRepository.countByRole("OFFICER"),
        bookingRepository.countBySlotDateAndStatusNot(LocalDate.now(), "CANCELLED"),
        priceRepository.count());
  }

  public MandiDto createMandi(MandiRequest request) {
    if (mandiRepository.existsByNameIgnoreCase(request.name().trim())) {
      throw new BadRequestException("A mandi with this name already exists");
    }
    Mandi mandi = mandiRepository.save(
        new Mandi(request.name().trim(), request.district().trim(), request.dailyCapacity(), "OPEN"));
    return mandiService.getMandi(mandi.getId());
  }

  public MandiDto updateMandi(Long id, MandiUpdateRequest request) {
    String status = request.status().trim().toUpperCase();
    if (!status.equals("OPEN") && !status.equals("CLOSED")) {
      throw new BadRequestException("Status must be OPEN or CLOSED");
    }
    Mandi mandi = mandiRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Mandi not found: " + id));
    mandi.setDailyCapacity(request.dailyCapacity());
    mandi.setStatus(status);
    mandiRepository.save(mandi);
    return mandiService.getMandi(id);
  }

  public List<UserDto> getOfficers() {
    return userRepository.findByRole("OFFICER").stream().map(this::toDto).toList();
  }

  public UserDto createOfficer(OfficerRequest request) {
    if (userRepository.existsByUsername(request.username())) {
      throw new BadRequestException("This username is already taken");
    }
    Mandi mandi = mandiRepository.findById(request.mandiId())
        .orElseThrow(() -> new ResourceNotFoundException("Mandi not found: " + request.mandiId()));

    User user = new User();
    user.setName(request.name().trim());
    user.setUsername(request.username());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setRole("OFFICER");
    user.setMandi(mandi);
    return toDto(userRepository.save(user));
  }

  public List<Farmer> getFarmers() {
    return farmerRepository.findAll();
  }

  private UserDto toDto(User user) {
    String mandiName = user.getMandi() == null ? null : user.getMandi().getName();
    return new UserDto(user.getId(), user.getName(), user.getUsername(), user.getRole(), mandiName);
  }
}
