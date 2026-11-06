package com.mandiconnect.api.controller;

import com.mandiconnect.api.dto.BookingRequest;
import com.mandiconnect.api.dto.BookingResponse;
import com.mandiconnect.api.service.BookingService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
  private final BookingService bookingService;

  public BookingController(BookingService bookingService) {
    this.bookingService = bookingService;
  }

  // FARMER: book a slot
  @PostMapping
  @PreAuthorize("hasRole('FARMER')")
  @ResponseStatus(HttpStatus.CREATED)
  public BookingResponse create(@Valid @RequestBody BookingRequest request) {
    return bookingService.create(request);
  }

  // FARMER: my bookings
  @GetMapping("/my")
  @PreAuthorize("hasRole('FARMER')")
  public List<BookingResponse> mine() {
    return bookingService.getMyBookings();
  }

  // FARMER: cancel my booking
  @PatchMapping("/{id}/cancel")
  @PreAuthorize("hasRole('FARMER')")
  public BookingResponse cancel(@PathVariable Long id) {
    return bookingService.cancelMine(id);
  }

  // OFFICER (own mandi) or ADMIN: bookings of one mandi on one day
  @GetMapping
  @PreAuthorize("hasAnyRole('OFFICER','ADMIN')")
  public List<BookingResponse> byMandi(
      @RequestParam Long mandiId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    return bookingService.getByMandiAndDate(mandiId, date);
  }

  // OFFICER (own mandi) or ADMIN: PATCH /api/bookings/5/status?status=CHECKED_IN
  @PatchMapping("/{id}/status")
  @PreAuthorize("hasAnyRole('OFFICER','ADMIN')")
  public BookingResponse updateStatus(@PathVariable Long id, @RequestParam String status) {
    return bookingService.updateStatus(id, status);
  }
}
