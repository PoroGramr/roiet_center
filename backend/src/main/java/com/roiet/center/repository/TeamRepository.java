package com.roiet.center.repository;
import com.roiet.center.domain.Team;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface TeamRepository extends JpaRepository<Team,Long> {
 @Query("select distinct t from Team t left join fetch t.manager where t.active=true order by t.name") List<Team> findAllActive();
 @Query("select t from Team t left join fetch t.manager where t.id=:id") java.util.Optional<Team> findDetailed(@Param("id") Long id);
}

