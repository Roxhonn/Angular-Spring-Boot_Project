package com.mandiconnect.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OfficerRequest(
    @NotBlank(message = "Name is required") String name,
    @NotBlank(message = "Username is required")
    @Pattern(regexp = "[a-z0-9._]{4,30}", message = "Username: 4-30 small letters, digits, dot or underscore") String username,
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must have at least 6 characters") String password,
    @NotNull(message = "Mandi is required") Long mandiId) {}
