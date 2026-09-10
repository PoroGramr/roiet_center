package com.roiet.center.domain;

import jakarta.persistence.*;
@Entity
public class Team extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String name;
    @Column(length = 1000) private String description;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "manager_id") private User manager;
    private boolean active = true;
    protected Team() {}
    public Team(String name, String description, User manager) { this.name=name; this.description=description; this.manager=manager; }
    public void update(String name, String description, User manager) { this.name=name; this.description=description; this.manager=manager; }
    public Long getId(){return id;} public String getName(){return name;} public String getDescription(){return description;} public User getManager(){return manager;} public boolean isActive(){return active;}
}
