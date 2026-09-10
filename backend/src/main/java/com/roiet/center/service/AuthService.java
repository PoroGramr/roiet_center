package com.roiet.center.service;
import com.roiet.center.config.AppProperties;
import com.roiet.center.dto.AuthDtos.*;
import com.roiet.center.exception.BusinessException;
import com.roiet.center.repository.UserRepository;
import com.roiet.center.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
 private final UserRepository users; private final PasswordEncoder encoder; private final JwtService jwt; private final AppProperties props;
 public AuthService(UserRepository users,PasswordEncoder encoder,JwtService jwt,AppProperties props){this.users=users;this.encoder=encoder;this.jwt=jwt;this.props=props;}
 public LoginResponse login(LoginRequest request){
  var u=users.findByEmail(request.email().toLowerCase()).filter(x->encoder.matches(request.password(),x.getPassword())).orElseThrow(()->new BusinessException("이메일 또는 비밀번호가 올바르지 않습니다."));
  return new LoginResponse(jwt.issue(u.getId(),u.getEmail(),u.getRole().name()),"Bearer",props.jwt().expirationMinutes()*60,new UserSummary(u.getId(),u.getEmail(),u.getName(),u.getRole().name()));
 }
}

