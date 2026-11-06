package com.mandiconnect.api.security;

/** The logged-in person, available in every request after the token is checked. */
public record AuthUser(Long userId, String username, String role, Long mandiId, Long farmerId) {}
