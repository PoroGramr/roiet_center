package com.roiet.center.controller;
import com.roiet.center.dto.AttendanceDtos.*;
import com.roiet.center.service.StudentService;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/students/{studentId}/attendance")
public class AttendanceController {
 private final StudentService service; public AttendanceController(StudentService s){service=s;}
 @GetMapping public StudentStatistics get(@PathVariable Long studentId){return service.get(studentId).statistics();}
}

