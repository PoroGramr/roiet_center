package com.roiet.center.repository;
import com.roiet.center.domain.Attendance;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface AttendanceRepository extends JpaRepository<Attendance,Long> {
 interface StudentCount { Long getStudentId(); Attendance.Status getStatus(); long getCount(); java.time.LocalDate getLatestDate(); }
 interface TeamCount { Long getTeamId(); Attendance.Status getStatus(); long getCount(); }
 @Query("select a.student.id as studentId, a.status as status, count(a) as count, max(s.sessionDate) as latestDate from Attendance a join a.session s where s.deleted=false and a.student.id in :ids group by a.student.id, a.status")
 List<StudentCount> summarizeStudents(@Param("ids") List<Long> ids);
 @Query("select s.team.id as teamId, a.status as status, count(a) as count from Attendance a join a.session s where s.deleted=false and not exists (select n.id from ClassSession n where n.team=s.team and n.deleted=false and (n.sessionDate>s.sessionDate or (n.sessionDate=s.sessionDate and n.id>s.id))) group by s.team.id,a.status")
 List<TeamCount> summarizeLatestTeams();
 @Query("select a from Attendance a join fetch a.student where a.session.id=:sessionId order by a.student.name") List<Attendance> findBySession(@Param("sessionId") Long sessionId);
 @Query("select a from Attendance a join fetch a.student join fetch a.session s where s.id in :sessionIds") List<Attendance> findBySessionIds(@Param("sessionIds") List<Long> sessionIds);
 @Query("select a from Attendance a join fetch a.session s join fetch s.team where a.student.id=:studentId and s.deleted=false order by s.sessionDate desc, s.id desc") List<Attendance> findByStudent(@Param("studentId") Long studentId);
 Optional<Attendance> findBySessionIdAndStudentId(Long sessionId,Long studentId);
 @Query("select a from Attendance a join fetch a.student join fetch a.session s where s.team.id=:teamId and s.deleted=false order by s.sessionDate desc") List<Attendance> findByTeam(@Param("teamId") Long teamId);
}
