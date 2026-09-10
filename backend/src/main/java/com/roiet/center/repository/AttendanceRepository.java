package com.roiet.center.repository;
import com.roiet.center.domain.Attendance;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface AttendanceRepository extends JpaRepository<Attendance,Long> {
 @Query("select a from Attendance a join fetch a.student where a.session.id=:sessionId order by a.student.name") List<Attendance> findBySession(@Param("sessionId") Long sessionId);
 @Query("select a from Attendance a join fetch a.session s join fetch s.team where a.student.id=:studentId and s.deleted=false order by s.sessionDate desc, s.id desc") List<Attendance> findByStudent(@Param("studentId") Long studentId);
 Optional<Attendance> findBySessionIdAndStudentId(Long sessionId,Long studentId);
 @Query("select a from Attendance a join fetch a.student join fetch a.session s where s.team.id=:teamId and s.deleted=false order by s.sessionDate desc") List<Attendance> findByTeam(@Param("teamId") Long teamId);
}
