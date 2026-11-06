package com.mandiconnect.api.repository;

import com.mandiconnect.api.model.MandiPrice;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MandiPriceRepository
        extends JpaRepository<MandiPrice, Long> {

    Optional<MandiPrice> findFirstByMandiIdAndCropIdOrderByPriceDateDesc(
            Long mandiId, Long cropId);

    Optional<MandiPrice> findByMandiIdAndCropIdAndPriceDate(
            Long mandiId, Long cropId, LocalDate priceDate);

    List<MandiPrice> findByMandiIdAndCropIdAndPriceDateBetweenOrderByPriceDateAsc(
            Long mandiId, Long cropId, LocalDate from, LocalDate to);
}