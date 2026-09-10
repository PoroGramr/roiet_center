package com.roiet.center.dto;
import jakarta.validation.constraints.*;
public final class AuthDtos {
 private AuthDtos(){}
 public record LoginRequest(@Email @NotBlank String email,@NotBlank String password){}
 public record LoginResponse(String accessToken,String tokenType,long expiresInSeconds,UserSummary user){}
 public record UserSummary(Long id,String email,String name,String role){}
}

