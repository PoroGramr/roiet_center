package com.roiet.center.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
@Entity
@Table(name="team_members", indexes={@Index(name="idx_team_member_team_dates", columnList="team_id,started_at,ended_at"), @Index(name="idx_team_member_student", columnList="student_id")})
public class TeamMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private Team team;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private Student student;
    @Column(nullable=false) private LocalDate startedAt;
    private LocalDate endedAt;
    protected TeamMember() {}
    public TeamMember(Team team, Student student, LocalDate startedAt) { this.team=team; this.student=student; this.startedAt=startedAt; }
    public void endOn(LocalDate date) { if (date.isBefore(startedAt)) throw new IllegalArgumentException("종료일은 시작일보다 빠를 수 없습니다."); endedAt=date; }
    public Long getId(){return id;} public Team getTeam(){return team;} public Student getStudent(){return student;} public LocalDate getStartedAt(){return startedAt;} public LocalDate getEndedAt(){return endedAt;}
}
