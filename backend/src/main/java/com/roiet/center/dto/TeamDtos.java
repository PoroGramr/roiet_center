package com.roiet.center.dto;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public final class TeamDtos {
 private TeamDtos(){}
 public record SaveRequest(@NotBlank @Size(max=80) String name,@Size(max=1000) String description,Long managerId){}
 public record Summary(Long id,String name,String description,Long managerId,String managerName,long currentStudentCount,LocalDate recentSessionDate){}
 public record Detail(Summary team,List<StudentDtos.Summary> students,List<SessionDtos.Summary> sessions,double attendanceRate){}
}

