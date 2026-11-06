package com.mandiconnect.api.dto;

import java.time.LocalDate;

public record BookingResponse(Long id, String token, String farmerName, String mandiName,
                              String cropName, double quantityQuintals, LocalDate slotDate,
                              String slotTime, String status) {}
