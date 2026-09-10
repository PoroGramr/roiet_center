package com.roiet.center.domain;

import jakarta.persistence.*;
@Entity
public class Student extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String name;
    @Column(length = 30) private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status;
    @Column(length = 2000) private String memo;
    public enum Status { ACTIVE, INACTIVE, COMPLETED }
    protected Student() {}
    public Student(String name, String phone, Status status, String memo) { this.name=name; this.phone=phone; this.status=status; this.memo=memo; }
    public void update(String name, String phone, Status status, String memo) { this.name=name; this.phone=phone; this.status=status; this.memo=memo; }
    public Long getId(){return id;} public String getName(){return name;} public String getPhone(){return phone;} public Status getStatus(){return status;} public String getMemo(){return memo;}
}
