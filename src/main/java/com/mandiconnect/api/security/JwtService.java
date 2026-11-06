package com.mandiconnect.api.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Creates and checks the login token (JWT). */
@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationMs;

  public JwtService(@Value("${app.jwt.secret}") String secret,
                    @Value("${app.jwt.expiration-ms}") long expirationMs) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
  }

  public String createToken(String username, String role) {
    Date now = new Date();
    return Jwts.builder()
        .subject(username)
        .claim("role", role)
        .issuedAt(now)
        .expiration(new Date(now.getTime() + expirationMs))
        .signWith(key)
        .compact();
  }

  /** Returns the username inside the token, or null if the token is wrong or expired. */
  public String getUsername(String token) {
    try {
      return Jwts.parser().verifyWith(key).build()
          .parseSignedClaims(token).getPayload().getSubject();
    } catch (JwtException | IllegalArgumentException e) {
      return null;
    }
  }
}
