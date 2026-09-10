package com.roiet.center.dto;
import java.time.LocalDate;
import java.util.List;
public final class DashboardDtos {
 private DashboardDtos(){}
 public record TodaySession(Long sessionId,Long teamId,String teamName,long attended,long total){}
 public record TeamRate(Long teamId,String teamName,double attendanceRate){}
 public record AlertStudent(Long studentId,String studentName,String teamName,String reason,String code){}
 public record Response(LocalDate date,List<TodaySession> today,long weeklySessionCount,double weeklyAttendanceRate,List<TeamRate> teamRates,List<AlertStudent> alerts){}
}

