package com.roiet.center.security;

import com.roiet.center.config.AppProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
 private final SecretKey key; private final Duration expiration;
 public JwtService(AppProperties props){ key=Keys.hmacShaKeyFor(props.jwt().secret().getBytes(StandardCharsets.UTF_8)); expiration=Duration.ofMinutes(props.jwt().expirationMinutes()); }
 public String issue(Long id,String email,String role){ Instant now=Instant.now(); return Jwts.builder().subject(id.toString()).claim("email",email).claim("role",role).issuedAt(Date.from(now)).expiration(Date.from(now.plus(expiration))).signWith(key).compact(); }
 public Jws<Claims> parse(String token){ return Jwts.parser().verifyWith(key).build().parseSignedClaims(token); }
}

