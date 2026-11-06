package com.mandiconnect.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

/** The farmer is taken from the login token, so farmerId is not sent. */
public record BookingRequest(
    @NotNull(message = "Mandi is required") Long mandiId,
    @NotNull(message = "Crop is required") Long cropId,
    @NotNull(message = "Quantity is required") @Positive(message = "Quantity must be more than 0") Double quantityQuintals,
    @NotNull(message = "Slot date is required") LocalDate slotDate,
    @NotBlank(message = "Slot time is required") String slotTime) {}
