package com.mandiconnect.api.dto;

/** Sent after login: the token plus basic details to show in the screens. */
public record AuthResponse(String token, String role, String name, String username,
                           Long mandiId, String mandiName, Long farmerId) {}
