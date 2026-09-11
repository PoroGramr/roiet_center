package com.roiet.center.controller;
import com.roiet.center.domain.Student;
import com.roiet.center.dto.StudentDtos.*;
import com.roiet.center.service.StudentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/students")
public class StudentController {
 private final StudentService service; public StudentController(StudentService s){service=s;}
 @GetMapping public List<Summary> list(@RequestParam(required=false) String q,@RequestParam(required=false) Student.Status status,@RequestParam(required=false) Long teamId){return service.list(q,status,teamId);}
 @PostMapping @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(HttpStatus.CREATED) public Summary create(@Valid @RequestBody SaveRequest r){return service.create(r);}
 @GetMapping("/{id}") public Detail get(@PathVariable Long id){return service.get(id);}
 @PatchMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Summary update(@PathVariable Long id,@Valid @RequestBody SaveRequest r){return service.update(id,r);}
 @PostMapping("/{id}/move-team") @PreAuthorize("hasRole('ADMIN')") public Summary move(@PathVariable Long id,@Valid @RequestBody MoveTeamRequest r){return service.move(id,r);}
}
