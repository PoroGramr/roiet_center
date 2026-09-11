package com.roiet.center.repository;
import com.roiet.center.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User,Long> {
 Optional<User> findByEmail(String email);
 List<User> findAllByRoleOrderByName(User.Role role);
}
