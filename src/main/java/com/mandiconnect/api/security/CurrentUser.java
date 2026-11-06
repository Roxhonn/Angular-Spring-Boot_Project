package com.mandiconnect.api.security;

import com.mandiconnect.api.exception.ForbiddenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Gives the logged-in user inside services: CurrentUser.get() */
public final class CurrentUser {
  private CurrentUser() {}

  public static AuthUser get() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.getPrincipal() instanceof AuthUser user) {
      return user;
    }
    throw new ForbiddenException("Please login first");
  }
}
