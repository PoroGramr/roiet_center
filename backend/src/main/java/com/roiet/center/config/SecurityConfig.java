package com.roiet.center.config;

import com.roiet.center.security.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

@Configuration @EnableMethodSecurity
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean CorsConfigurationSource corsConfigurationSource(AppProperties p){
   var c=new CorsConfiguration(); c.setAllowedOrigins(List.of(p.cors().allowedOrigin())); c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS")); c.setAllowedHeaders(List.of("*"));
   var source=new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/**",c); return source;
 }
 @Bean SecurityFilterChain filterChain(HttpSecurity http,JwtAuthenticationFilter jwt) throws Exception {
   return http.csrf(c->c.disable()).cors(c->{}).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
     .authorizeHttpRequests(a->a.requestMatchers("/api/auth/login","/actuator/health").permitAll().requestMatchers(HttpMethod.DELETE,"/**").hasRole("ADMIN").anyRequest().authenticated())
     .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class)
     .exceptionHandling(e->e.authenticationEntryPoint((req,res,x)->res.sendError(401,"인증이 필요합니다."))).build();
 }
}

