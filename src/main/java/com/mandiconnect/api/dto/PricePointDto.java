package com.mandiconnect.api.dto;

import java.time.LocalDate;

public record PricePointDto(LocalDate date, double minPrice, double maxPrice, double modalPrice) {}
