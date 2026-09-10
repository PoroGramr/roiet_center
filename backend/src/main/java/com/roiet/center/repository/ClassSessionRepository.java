package com.roiet.center.repository;
import com.roiet.center.domain.ClassSession;
import java.time.LocalDate;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface ClassSessionRepository extends JpaRepository<ClassSession,Long> {
 @Query("select s from ClassSession s join fetch s.team where s.deleted=false and (:teamId is null or s.team.id=:teamId) order by s.sessionDate desc, s.id desc") List<ClassSession> findRecent(@Param("teamId") Long teamId);
 @Query("select s from ClassSession s join fetch s.team join fetch s.createdBy where s.id=:id and s.deleted=false") Optional<ClassSession> findDetailed(@Param("id") Long id);
 List<ClassSession> findBySessionDateAndDeletedFalse(LocalDate date);
 long countBySessionDateBetweenAndDeletedFalse(LocalDate from,LocalDate to);
 Optional<ClassSession> findFirstByTeamIdAndDeletedFalseOrderBySessionDateDesc(Long teamId);
}

