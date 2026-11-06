package com.mandiconnect.api.security;

import com.mandiconnect.api.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Runs before every request: reads the token from the "Authorization: Bearer ..." header. */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final UserRepository userRepository;

  public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain chain) throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      String username = jwtService.getUsername(header.substring(7));
      if (username != null) {
        userRepository.findByUsername(username).filter(user -> user.isActive()).ifPresent(user -> {
          Long mandiId = user.getMandi() == null ? null : user.getMandi().getId();
          Long farmerId = user.getFarmer() == null ? null : user.getFarmer().getId();
          AuthUser principal = new AuthUser(user.getId(), user.getUsername(), user.getRole(), mandiId, farmerId);
          UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
              principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())));
          SecurityContextHolder.getContext().setAuthentication(authentication);
        });
      }
    }
    chain.doFilter(request, response);
  }
}
