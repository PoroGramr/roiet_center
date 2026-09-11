package com.roiet.center.repository;
import com.roiet.center.domain.Student;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface StudentRepository extends JpaRepository<Student,Long>, JpaSpecificationExecutor<Student> {
 default List<Student> search(String q, Student.Status status, Long teamId) {
  return findAll((root, query, cb) -> {
   var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
   if (q != null && !q.isBlank()) {
    String escaped = q.toLowerCase(java.util.Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    predicates.add(cb.like(cb.lower(root.get("name")), "%" + escaped + "%", '\\'));
   }
   if (status != null) predicates.add(cb.equal(root.get("status"), status));
   if (teamId != null) {
    var membership = query.subquery(Long.class);
    var member = membership.from(com.roiet.center.domain.TeamMember.class);
    membership.select(member.get("student").get("id")).where(cb.equal(member.get("team").get("id"), teamId), cb.isNull(member.get("endedAt")));
    predicates.add(root.get("id").in(membership));
   }
   query.orderBy(cb.asc(root.get("name")));
   return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
  });
 }
}
