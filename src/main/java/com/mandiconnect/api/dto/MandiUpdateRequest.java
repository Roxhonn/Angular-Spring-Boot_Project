package com.mandiconnect.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MandiUpdateRequest(
    @NotNull(message = "Daily capacity is required") @Positive(message = "Capacity must be more than 0") Integer dailyCapacity,
    @NotBlank(message = "Status is required") String status) {}
