package com.roiet.center.dto;
import com.roiet.center.domain.Attendance;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public final class AttendanceDtos {
 private AttendanceDtos(){}
 public record Input(@NotNull Long studentId,@NotNull Attendance.Status status,@Size(max=500) String memo){}
 public record BulkRequest(@NotEmpty List<@Valid Input> attendances){}
 public record Record(Long id,Long studentId,String studentName,Attendance.Status status,String memo,LocalDate sessionDate,Long sessionId,String teamName){}
 public record StudentStatistics(long total,long present,long absent,long late,long earlyLeave,long excused,double attendanceRate){}
 public record StudentRate(Long studentId,String studentName,double attendanceRate){}
 public record TeamStatistics(long totalSessions,double averageAttendanceRate,double recentAttendanceRate,List<StudentRate> students){}
}
