package com.mandiconnect.api.service;

import com.mandiconnect.api.dto.BookingRequest;
import com.mandiconnect.api.dto.BookingResponse;
import com.mandiconnect.api.exception.BadRequestException;
import com.mandiconnect.api.exception.ForbiddenException;
import com.mandiconnect.api.exception.ResourceNotFoundException;
import com.mandiconnect.api.model.Booking;
import com.mandiconnect.api.model.Crop;
import com.mandiconnect.api.model.Farmer;
import com.mandiconnect.api.model.Mandi;
import com.mandiconnect.api.repository.BookingRepository;
import com.mandiconnect.api.repository.CropRepository;
import com.mandiconnect.api.repository.FarmerRepository;
import com.mandiconnect.api.security.AuthUser;
import com.mandiconnect.api.security.CurrentUser;
import java.time.LocalDate;
import java.util.List;
import com.mandiconnect.api.repository.MandiRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {
  private static final List<String> VALID_STATUSES =
      List.of("BOOKED", "CHECKED_IN", "COMPLETED", "CANCELLED");

  private final BookingRepository bookingRepository;
  private final FarmerRepository farmerRepository;
  private final MandiRepository mandiRepository;
  private final CropRepository cropRepository;

  public BookingService(BookingRepository bookingRepository, FarmerRepository farmerRepository,
                        MandiRepository mandiRepository, CropRepository cropRepository) {
    this.bookingRepository = bookingRepository;
    this.farmerRepository = farmerRepository;
    this.mandiRepository = mandiRepository;
    this.cropRepository = cropRepository;
  }

  /** A farmer books a slot. The farmer is the logged-in user. */
  @Transactional
  public BookingResponse create(BookingRequest request) {
    Long farmerId = CurrentUser.get().farmerId();
    if (farmerId == null) {
      throw new ForbiddenException("Only farmers can book a slot");
    }
    Farmer farmer = farmerRepository.findById(farmerId)
        .orElseThrow(() -> new ResourceNotFoundException("Farmer not found: " + farmerId));
    Mandi mandi = mandiRepository.findById(request.mandiId())
        .orElseThrow(() -> new ResourceNotFoundException("Mandi not found: " + request.mandiId()));
    Crop crop = cropRepository.findById(request.cropId())
        .orElseThrow(() -> new ResourceNotFoundException("Crop not found: " + request.cropId()));

    if (!"OPEN".equals(mandi.getStatus())) {
      throw new BadRequestException(mandi.getName() + " is closed right now");
    }
    if (request.slotDate().isBefore(LocalDate.now())) {
      throw new BadRequestException("Slot date cannot be in the past");
    }
    long alreadyBooked = bookingRepository
        .countByMandiIdAndSlotDateAndStatusNot(mandi.getId(), request.slotDate(), "CANCELLED");
    if (alreadyBooked >= mandi.getDailyCapacity()) {
      throw new BadRequestException("No slots left in " + mandi.getName() + " on this date");
    }

    Booking booking = new Booking();
    booking.setFarmer(farmer);
    booking.setMandi(mandi);
    booking.setCrop(crop);
    booking.setQuantityQuintals(request.quantityQuintals());
    booking.setSlotDate(request.slotDate());
    booking.setSlotTime(request.slotTime());
    booking.setStatus("BOOKED");
    booking = bookingRepository.save(booking);

    // token = first 3 letters of the mandi name + booking number, e.g. BAR-0007
    String prefix = mandi.getName().substring(0, 3).toUpperCase();
    booking.setToken(prefix + "-" + String.format("%04d", booking.getId()));
    return toResponse(bookingRepository.save(booking));
  }

  /** Bookings of the logged-in farmer. */
  public List<BookingResponse> getMyBookings() {
    Long farmerId = CurrentUser.get().farmerId();
    if (farmerId == null) {
      throw new ForbiddenException("Only farmers have bookings");
    }
    return bookingRepository.findByFarmerIdOrderBySlotDateDesc(farmerId)
        .stream().map(this::toResponse).toList();
  }

  /** A farmer cancels his or her own booking (only while it is still BOOKED). */
  @Transactional
  public BookingResponse cancelMine(Long id) {
    Long farmerId = CurrentUser.get().farmerId();
    Booking booking = findBooking(id);
    if (farmerId == null || !booking.getFarmer().getId().equals(farmerId)) {
      throw new ForbiddenException("This is not your booking");
    }
    if (!"BOOKED".equals(booking.getStatus())) {
      throw new BadRequestException("Only a booked slot can be cancelled");
    }
    booking.setStatus("CANCELLED");
    return toResponse(bookingRepository.save(booking));
  }

  /** Officer or admin: bookings of one mandi on one day. */
  public List<BookingResponse> getByMandiAndDate(Long mandiId, LocalDate date) {
    checkMandiAccess(mandiId);
    return bookingRepository.findByMandiIdAndSlotDateOrderBySlotTimeAsc(mandiId, date)
        .stream().map(this::toResponse).toList();
  }

  /** Officer or admin: change the status of a booking. */
  @Transactional
  public BookingResponse updateStatus(Long id, String status) {
    String newStatus = status == null ? "" : status.trim().toUpperCase();
    if (!VALID_STATUSES.contains(newStatus)) {
      throw new BadRequestException("Status must be one of " + VALID_STATUSES);
    }
    Booking booking = findBooking(id);
    checkMandiAccess(booking.getMandi().getId());
    booking.setStatus(newStatus);
    return toResponse(bookingRepository.save(booking));
  }

  // An officer can work only on his own mandi, the admin can work on every mandi.
  private void checkMandiAccess(Long mandiId) {
    AuthUser user = CurrentUser.get();
    if ("OFFICER".equals(user.role()) && !mandiId.equals(user.mandiId())) {
      throw new ForbiddenException("This is not your mandi");
    }
  }

  private Booking findBooking(Long id) {
    return bookingRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
  }

  private BookingResponse toResponse(Booking b) {
    return new BookingResponse(b.getId(), b.getToken(), b.getFarmer().getName(),
        b.getMandi().getName(), b.getCrop().getName(), b.getQuantityQuintals(),
        b.getSlotDate(), b.getSlotTime(), b.getStatus());
  }
}
