package com.roiet.center.repository;
import com.roiet.center.domain.Student;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface StudentRepository extends JpaRepository<Student,Long> {
 @Query("select distinct s from Student s left join TeamMember tm on tm.student=s and tm.endedAt is null left join tm.team t where (:q is null or lower(s.name) like lower(concat('%',:q,'%'))) and (:status is null or s.status=:status) and (:teamId is null or t.id=:teamId) order by s.name")
 List<Student> search(@Param("q") String q,@Param("status") Student.Status status,@Param("teamId") Long teamId);
}

