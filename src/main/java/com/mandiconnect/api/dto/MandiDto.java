package com.mandiconnect.api.dto;

public record MandiDto(Long id, String name, String district, int dailyCapacity,
                       String status, long bookedToday) {}
