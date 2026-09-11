package com.roiet.center.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.List;
public final class SessionDtos {
 private SessionDtos(){}
 public record CreateRequest(@NotNull Long teamId,@NotNull LocalDate sessionDate,LocalTime startTime,LocalTime endTime,@Size(max=150) String title,@NotBlank @Size(max=4000) String content,@Size(max=2000) String memo,@NotEmpty List<AttendanceDtos.@Valid Input> attendances){}
 public record UpdateRequest(@NotNull LocalDate sessionDate,LocalTime startTime,LocalTime endTime,@Size(max=150) String title,@NotBlank @Size(max=4000) String content,@Size(max=2000) String memo){}
 public record Summary(Long id,Long teamId,String teamName,LocalDate sessionDate,String title,String content,long attended,long total){}
 public record Detail(Long id,Long teamId,String teamName,LocalDate sessionDate,LocalTime startTime,LocalTime endTime,String title,String content,String memo,List<AttendanceDtos.Record> attendances){}
 public record EligibleStudent(Long id,String name,String phone){}
}
