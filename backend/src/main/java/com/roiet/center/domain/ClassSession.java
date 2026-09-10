package com.roiet.center.domain;

import jakarta.persistence.*;
import java.time.*;
@Entity
@Table(name="class_sessions", indexes=@Index(name="idx_session_team_date", columnList="team_id,session_date"))
public class ClassSession extends BaseTimeEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private Team team;
    @Column(nullable=false) private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    @Column(length=150) private String title;
    @Column(nullable=false, length=4000) private String content;
    @Column(length=2000) private String memo;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="created_by") private User createdBy;
    @Column(nullable=false) private boolean deleted=false;
    protected ClassSession() {}
    public ClassSession(Team team, LocalDate date, LocalTime start, LocalTime end, String title, String content, String memo, User creator) {
        this.team=team; this.sessionDate=date; this.startTime=start; this.endTime=end; this.title=title; this.content=content; this.memo=memo; this.createdBy=creator;
    }
    public void update(LocalDate date, LocalTime start, LocalTime end, String title, String content, String memo) { this.sessionDate=date; this.startTime=start; this.endTime=end; this.title=title; this.content=content; this.memo=memo; }
    public void delete() { deleted=true; }
    public Long getId(){return id;} public Team getTeam(){return team;} public LocalDate getSessionDate(){return sessionDate;} public LocalTime getStartTime(){return startTime;} public LocalTime getEndTime(){return endTime;} public String getTitle(){return title;} public String getContent(){return content;} public String getMemo(){return memo;} public User getCreatedBy(){return createdBy;} public boolean isDeleted(){return deleted;}
}
