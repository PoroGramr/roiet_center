package com.roiet.center.domain;

import jakarta.persistence.*;
@Entity
@Table(name = "users")
public class User extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 150) private String email;
    @Column(nullable = false) private String password;
    @Column(nullable = false, length = 80) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Role role;
    protected User() {}
    public Long getId(){return id;} public String getEmail(){return email;} public String getPassword(){return password;} public String getName(){return name;} public Role getRole(){return role;}
    public enum Role { ADMIN, TEACHER }
}
