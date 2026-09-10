package com.roiet.center.dto;
import com.roiet.center.domain.Student;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public final class StudentDtos {
 private StudentDtos(){}
 public record SaveRequest(@NotBlank @Size(max=80) String name,@Size(max=30) String phone,@NotNull Student.Status status,@Size(max=2000) String memo,Long teamId,LocalDate startedAt){}
 public record MoveTeamRequest(@NotNull Long teamId,@NotNull LocalDate movedAt){}
 public record Summary(Long id,String name,String phone,Student.Status status,String memo,Long currentTeamId,String currentTeamName){}
 public record TeamHistory(Long teamId,String teamName,LocalDate startedAt,LocalDate endedAt){}
 public record Detail(Summary student,List<TeamHistory> teamHistory,AttendanceDtos.StudentStatistics statistics,List<AttendanceDtos.Record> recentAttendance){}
}

