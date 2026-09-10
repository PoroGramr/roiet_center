package com.roiet.center.repository;
import com.roiet.center.domain.TeamMember;
import java.time.LocalDate;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface TeamMemberRepository extends JpaRepository<TeamMember,Long> {
 @Query("select tm from TeamMember tm join fetch tm.student where tm.team.id=:teamId and tm.startedAt<=:date and (tm.endedAt is null or tm.endedAt>=:date) order by tm.student.name")
 List<TeamMember> findMembersOn(@Param("teamId") Long teamId,@Param("date") LocalDate date);
 @Query("select tm from TeamMember tm join fetch tm.team where tm.student.id=:studentId and tm.endedAt is null") Optional<TeamMember> findCurrent(@Param("studentId") Long studentId);
 @Query("select tm from TeamMember tm join fetch tm.team where tm.student.id=:studentId order by tm.startedAt desc") List<TeamMember> findHistory(@Param("studentId") Long studentId);
 @Query("select tm from TeamMember tm join fetch tm.team join fetch tm.student where tm.endedAt is null") List<TeamMember> findAllCurrent();
 long countByTeamIdAndEndedAtIsNull(Long teamId);
}
