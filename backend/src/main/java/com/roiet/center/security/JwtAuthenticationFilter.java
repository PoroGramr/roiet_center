package com.roiet.center.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 private final JwtService jwt;
 public JwtAuthenticationFilter(JwtService jwt){this.jwt=jwt;}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain) throws ServletException,IOException {
   String header=req.getHeader("Authorization");
   if(header!=null&&header.startsWith("Bearer ")) try {
     Claims c=jwt.parse(header.substring(7)).getPayload();
     var auth=new UsernamePasswordAuthenticationToken(Long.valueOf(c.getSubject()),null,List.of(new SimpleGrantedAuthority("ROLE_"+c.get("role",String.class))));
     SecurityContextHolder.getContext().setAuthentication(auth);
   } catch(Exception ignored){ SecurityContextHolder.clearContext(); }
   chain.doFilter(req,res);
 }
}

