package com.mandiconnect.api.repository;

import com.mandiconnect.api.model.Booking;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

  List<Booking> findByMandiIdAndSlotDateOrderBySlotTimeAsc(Long mandiId, LocalDate slotDate);

  List<Booking> findByFarmerIdOrderBySlotDateDesc(Long farmerId);

  // Bookings of a mandi on a particular date, ignoring CANCELLED
  long countByMandiIdAndSlotDateAndStatusNot(Long mandiId, LocalDate slotDate, String status);

  // All bookings of a day in every mandi, ignoring CANCELLED
  long countBySlotDateAndStatusNot(LocalDate slotDate, String status);

  // All bookings from today onwards for a particular mandi, ignoring CANCELLED
  long countByMandiIdAndSlotDateGreaterThanEqualAndStatusNot(
          Long mandiId, LocalDate slotDate, String status
  );
}