package com.mandiconnect.api.service;

import com.mandiconnect.api.dto.LatestPriceDto;
import com.mandiconnect.api.dto.PricePointDto;
import com.mandiconnect.api.dto.PriceRequest;
import com.mandiconnect.api.exception.BadRequestException;
import com.mandiconnect.api.exception.ForbiddenException;
import com.mandiconnect.api.exception.ResourceNotFoundException;
import com.mandiconnect.api.model.Crop;
import com.mandiconnect.api.model.Mandi;
import com.mandiconnect.api.model.MandiPrice;
import com.mandiconnect.api.repository.CropRepository;
import com.mandiconnect.api.repository.MandiPriceRepository;
import com.mandiconnect.api.security.CurrentUser;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.mandiconnect.api.repository.MandiRepository;

@Service
public class PriceService {
  private final MandiPriceRepository priceRepository;
  private final MandiRepository mandiRepository;
  private final CropRepository cropRepository;

  public PriceService(MandiPriceRepository priceRepository, MandiRepository mandiRepository,
                      CropRepository cropRepository) {
    this.priceRepository = priceRepository;
    this.mandiRepository = mandiRepository;
    this.cropRepository = cropRepository;
  }

  /**
   * Latest price of a crop in every mandi that trades it (optionally one district only).
   * The list is sorted from the highest to the lowest price, so the first item is the
   * "best mandi" to sell this crop today.
   */
  public List<LatestPriceDto> getLatestPrices(Long cropId, String district) {
    cropRepository.findById(cropId)
        .orElseThrow(() -> new ResourceNotFoundException("Crop not found: " + cropId));

    List<Mandi> mandis = (district == null || district.isBlank())
        ? mandiRepository.findAll()
        : mandiRepository.findByDistrictIgnoreCase(district);

    List<LatestPriceDto> result = new ArrayList<>();
    for (Mandi mandi : mandis) {
      Optional<MandiPrice> latest =
          priceRepository.findFirstByMandiIdAndCropIdOrderByPriceDateDesc(mandi.getId(), cropId);
      if (latest.isPresent()) {
        result.add(toLatestDto(latest.get()));
      }
    }
    result.sort(Comparator.comparingDouble(LatestPriceDto::modalPrice).reversed());
    return result;
  }

  /**
   * A mandi officer enters the price of a crop for his or her own mandi.
   * If a price already exists for that crop and date, it is replaced.
   */
  public LatestPriceDto savePrice(PriceRequest request) {
    Long mandiId = CurrentUser.get().mandiId();
    if (mandiId == null) {
      throw new ForbiddenException("Only a mandi officer can enter prices");
    }
    if (request.date().isAfter(LocalDate.now())) {
      throw new BadRequestException("Price date cannot be in the future");
    }
    double min = request.minPrice();
    double max = request.maxPrice();
    double modal = request.modalPrice();
    if (min > modal || modal > max) {
      throw new BadRequestException("Prices must follow: minimum <= modal <= maximum");
    }

    Mandi mandi = mandiRepository.findById(mandiId)
        .orElseThrow(() -> new ResourceNotFoundException("Mandi not found: " + mandiId));
    Crop crop = cropRepository.findById(request.cropId())
        .orElseThrow(() -> new ResourceNotFoundException("Crop not found: " + request.cropId()));

    MandiPrice price = priceRepository
        .findByMandiIdAndCropIdAndPriceDate(mandiId, crop.getId(), request.date())
        .orElse(new MandiPrice(mandi, crop, request.date(), min, max, modal));
    price.setPrices(min, max, modal);
    return toLatestDto(priceRepository.save(price));
  }

  /** Price history of one crop in one mandi for the last N days (oldest first). */
  public List<PricePointDto> getHistory(Long mandiId, Long cropId, int days) {
    Optional<MandiPrice> latest =
        priceRepository.findFirstByMandiIdAndCropIdOrderByPriceDateDesc(mandiId, cropId);
    if (latest.isEmpty()) {
      throw new ResourceNotFoundException("No price data for this mandi and crop");
    }
    LocalDate to = latest.get().getPriceDate();
    LocalDate from = to.minusDays(days - 1L);
    return priceRepository
        .findByMandiIdAndCropIdAndPriceDateBetweenOrderByPriceDateAsc(mandiId, cropId, from, to)
        .stream()
        .map(p -> new PricePointDto(p.getPriceDate(), p.getMinPrice(), p.getMaxPrice(), p.getModalPrice()))
        .toList();
  }

  /**
   * Simple trend (NOT a prediction): compare the latest price with the average
   * of the 7 days before it.
   * more than +2% = RISING, less than -2% = FALLING, otherwise STABLE.
   */
  private LatestPriceDto toLatestDto(MandiPrice latest) {
    Long mandiId = latest.getMandi().getId();
    Long cropId = latest.getCrop().getId();
    LocalDate date = latest.getPriceDate();

    List<MandiPrice> lastWeek = priceRepository
        .findByMandiIdAndCropIdAndPriceDateBetweenOrderByPriceDateAsc(
            mandiId, cropId, date.minusDays(7), date.minusDays(1));

    double average = lastWeek.stream()
        .mapToDouble(MandiPrice::getModalPrice)
        .average()
        .orElse(latest.getModalPrice());

    double change = average == 0 ? 0 : (latest.getModalPrice() - average) / average * 100;
    change = Math.round(change * 10) / 10.0;

    String trend = "STABLE";
    if (change > 2) {
      trend = "RISING";
    } else if (change < -2) {
      trend = "FALLING";
    }

    return new LatestPriceDto(mandiId, latest.getMandi().getName(), latest.getMandi().getDistrict(),
        cropId, latest.getCrop().getName(), date, latest.getMinPrice(), latest.getMaxPrice(),
        latest.getModalPrice(), change, trend);
  }
}
