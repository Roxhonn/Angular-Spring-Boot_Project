package com.mandiconnect.api.controller;

import com.mandiconnect.api.dto.AdminSummaryDto;
import com.mandiconnect.api.dto.MandiDto;
import com.mandiconnect.api.dto.MandiRequest;
import com.mandiconnect.api.dto.MandiUpdateRequest;
import com.mandiconnect.api.dto.OfficerRequest;
import com.mandiconnect.api.dto.UserDto;
import com.mandiconnect.api.model.Farmer;
import com.mandiconnect.api.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Everything in this controller is only for the ADMIN. */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping("/summary")
  public AdminSummaryDto summary() {
    return adminService.getSummary();
  }

  @PostMapping("/mandis")
  @ResponseStatus(HttpStatus.CREATED)
  public MandiDto createMandi(@Valid @RequestBody MandiRequest request) {
    return adminService.createMandi(request);
  }

  @PatchMapping("/mandis/{id}")
  public MandiDto updateMandi(@PathVariable Long id, @Valid @RequestBody MandiUpdateRequest request) {
    return adminService.updateMandi(id, request);
  }

  @GetMapping("/officers")
  public List<UserDto> officers() {
    return adminService.getOfficers();
  }

  @PostMapping("/officers")
  @ResponseStatus(HttpStatus.CREATED)
  public UserDto createOfficer(@Valid @RequestBody OfficerRequest request) {
    return adminService.createOfficer(request);
  }

  @GetMapping("/farmers")
  public List<Farmer> farmers() {
    return adminService.getFarmers();
  }
}
