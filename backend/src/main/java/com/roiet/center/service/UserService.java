package com.roiet.center.service;

import com.roiet.center.domain.User;
import com.roiet.center.dto.AuthDtos.UserSummary;
import com.roiet.center.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {
 private final UserRepository repository;

 public UserService(UserRepository repository) { this.repository = repository; }

 public List<UserSummary> teachers() {
  return repository.findAllByRoleOrderByName(User.Role.TEACHER).stream()
    .map(user -> new UserSummary(user.getId(), user.getEmail(), user.getName(), user.getRole().name()))
    .toList();
 }
}
