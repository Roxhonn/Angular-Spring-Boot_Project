package com.mandiconnect.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** A farmer creates his or her own account. The mobile number is the username. */
public record RegisterRequest(
    @NotBlank(message = "Name is required") String name,
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "[6-9][0-9]{9}", message = "Enter a valid 10 digit mobile number") String mobile,
    String village,
    @NotBlank(message = "District is required") String district,
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must have at least 6 characters") String password) {}
