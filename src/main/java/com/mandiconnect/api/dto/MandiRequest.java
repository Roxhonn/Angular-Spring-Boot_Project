package com.mandiconnect.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MandiRequest(
    @NotBlank(message = "Mandi name is required") String name,
    @NotBlank(message = "District is required") String district,
    @NotNull(message = "Daily capacity is required") @Positive(message = "Capacity must be more than 0") Integer dailyCapacity) {}
