package com.roiet.center.domain;

import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="attendances", uniqueConstraints=@UniqueConstraint(name="uk_attendance_session_student", columnNames={"session_id","student_id"}), indexes=@Index(name="idx_attendance_student", columnList="student_id"))
public class Attendance {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="session_id") private ClassSession session;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private Student student;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Status status;
    @Column(length=500) private String memo;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="checked_by") private User checkedBy;
    @Column(nullable=false) private Instant checkedAt;
    public enum Status { PRESENT, ABSENT, LATE, EARLY_LEAVE, EXCUSED }
    protected Attendance() {}
    public Attendance(ClassSession session, Student student, Status status, String memo, User checker) { this.session=session; this.student=student; update(status,memo,checker); }
    public void update(Status status, String memo, User checker) { this.status=status; this.memo=memo; this.checkedBy=checker; this.checkedAt=Instant.now(); }
    public Long getId(){return id;} public ClassSession getSession(){return session;} public Student getStudent(){return student;} public Status getStatus(){return status;} public String getMemo(){return memo;} public User getCheckedBy(){return checkedBy;} public Instant getCheckedAt(){return checkedAt;}
}
