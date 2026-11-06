package com.mandiconnect.api.dto;

import java.time.LocalDate;

/** Latest price of a crop in one mandi, with the simple 7-day trend. */
public record LatestPriceDto(Long mandiId, String mandiName, String district,
                             Long cropId, String cropName, LocalDate priceDate,
                             double minPrice, double maxPrice, double modalPrice,
                             double changePercent, String trend) {}
