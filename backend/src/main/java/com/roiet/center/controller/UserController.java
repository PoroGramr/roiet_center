package com.roiet.center.controller;

import com.roiet.center.dto.AuthDtos.UserSummary;
import com.roiet.center.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
 private final UserService service;

 public UserController(UserService service) { this.service = service; }

 @GetMapping("/teachers")
 public List<UserSummary> teachers() { return service.teachers(); }
}
