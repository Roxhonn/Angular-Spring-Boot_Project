
package com.mandiconnect.api.service;

import com.mandiconnect.api.dto.MandiDto;
import com.mandiconnect.api.exception.ResourceNotFoundException;
import com.mandiconnect.api.model.Crop;
import com.mandiconnect.api.model.Mandi;
import com.mandiconnect.api.repository.BookingRepository;
import com.mandiconnect.api.repository.CropRepository;
import com.mandiconnect.api.repository.MandiRepository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class MandiService {

  private final MandiRepository mandiRepository;
  private final CropRepository cropRepository;
  private final BookingRepository bookingRepository;

  public MandiService(
          MandiRepository mandiRepository,
          CropRepository cropRepository,
          BookingRepository bookingRepository) {

    this.mandiRepository = mandiRepository;
    this.cropRepository = cropRepository;
    this.bookingRepository = bookingRepository;
  }

  /** All mandis, or only the mandis of one district. */
  public List<MandiDto> getMandis(String district) {

    List<Mandi> mandis = (district == null || district.isBlank())
            ? mandiRepository.findAll()
            : mandiRepository.findByDistrictIgnoreCase(district);

    return mandis.stream().map(this::toDto).toList();
  }

  public MandiDto getMandi(Long id) {

    Mandi mandi = mandiRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Mandi not found: " + id));

    return toDto(mandi);
  }

  public List<Crop> getCrops() {
    return cropRepository.findAll();
  }

  private MandiDto toDto(Mandi mandi) {

    // Count today's and all future bookings, excluding CANCELLED
    long bookedToday = bookingRepository
            .countByMandiIdAndSlotDateGreaterThanEqualAndStatusNot(
                    mandi.getId(),
                    LocalDate.now(),
                    "CANCELLED"
            );

    return new MandiDto(
            mandi.getId(),
            mandi.getName(),
            mandi.getDistrict(),
            mandi.getDailyCapacity(),
            mandi.getStatus(),
            bookedToday
    );
  }
}
