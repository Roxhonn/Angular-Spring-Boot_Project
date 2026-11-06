package com.mandiconnect.api.dto;

public record AdminSummaryDto(long mandis, long farmers, long officers,
                              long bookingsToday, long priceRecords) {}
