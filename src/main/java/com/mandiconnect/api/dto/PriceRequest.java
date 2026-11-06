package com.mandiconnect.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

/** Price entered by a mandi officer for his or her own mandi. */
public record PriceRequest(
    @NotNull(message = "Crop is required") Long cropId,
    @NotNull(message = "Date is required") LocalDate date,
    @NotNull(message = "Minimum price is required") @Positive(message = "Minimum price must be more than 0") Double minPrice,
    @NotNull(message = "Maximum price is required") @Positive(message = "Maximum price must be more than 0") Double maxPrice,
    @NotNull(message = "Modal price is required") @Positive(message = "Modal price must be more than 0") Double modalPrice) {}
