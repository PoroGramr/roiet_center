package com.roiet.center.controller;
import com.roiet.center.dto.AuthDtos.*;
import com.roiet.center.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
 private final AuthService service; public AuthController(AuthService s){service=s;}
 @PostMapping("/login") public LoginResponse login(@Valid @RequestBody LoginRequest request){return service.login(request);}
}

