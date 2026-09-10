package com.roiet.center.service;
import com.roiet.center.config.AppProperties;
import com.roiet.center.domain.Attendance;
import com.roiet.center.dto.DashboardDtos.*;
import com.roiet.center.repository.*;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @Transactional(readOnly=true)
public class DashboardService {
 private final ClassSessionRepository sessions; private final AttendanceRepository attendance; private final TeamRepository teams; private final TeamMemberRepository members; private final AttendancePolicy policy; private final AppProperties props;
 public DashboardService(ClassSessionRepository s,AttendanceRepository a,TeamRepository t,TeamMemberRepository m,AttendancePolicy p,AppProperties props){sessions=s;attendance=a;teams=t;members=m;policy=p;this.props=props;}
 public Response get(){
  LocalDate today=LocalDate.now(); var todaySessions=sessions.findBySessionDateAndDeletedFalse(today); var todayDto=todaySessions.stream().map(s->{var rows=attendance.findBySession(s.getId());return new TodaySession(s.getId(),s.getTeam().getId(),s.getTeam().getName(),credited(rows),rows.size());}).toList();
  LocalDate from=today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),to=from.plusDays(6); var weeklySessions=sessions.findRecent(null).stream().filter(s->!s.getSessionDate().isBefore(from)&&!s.getSessionDate().isAfter(to)).toList(); var weeklyRows=weeklySessions.stream().flatMap(s->attendance.findBySession(s.getId()).stream()).toList();
  var rates=teams.findAllActive().stream().map(t->{var rows=attendance.findByTeam(t.getId()).stream().filter(a->!a.getSession().getSessionDate().isBefore(from)&&!a.getSession().getSessionDate().isAfter(to)).toList();return new TeamRate(t.getId(),t.getName(),rate(rows));}).toList();
  return new Response(today,todayDto,weeklySessions.size(),rate(weeklyRows),rates,alerts(today));
 }
 List<AlertStudent> alerts(LocalDate today){
  List<AlertStudent> result=new ArrayList<>(); for(var tm:members.findAllCurrent()){
   var rows=attendance.findByStudent(tm.getStudent().getId()); var cfg=props.alerts();
   boolean consecutive=rows.size()>=cfg.consecutiveAbsences()&&rows.subList(0,cfg.consecutiveAbsences()).stream().allMatch(x->x.getStatus()==Attendance.Status.ABSENT);
   long recentAbsences=rows.stream().limit(cfg.recentSessionWindow()).filter(x->x.getStatus()==Attendance.Status.ABSENT).count();
   boolean inactive=rows.isEmpty()||rows.getFirst().getSession().getSessionDate().isBefore(today.minusDays(cfg.inactiveDays()));
   String reason=null,code=null;if(consecutive){reason="최근 "+cfg.consecutiveAbsences()+"회 연속 결석";code="CONSECUTIVE_ABSENCE";}else if(recentAbsences>=cfg.absencesInWindow()){reason="최근 "+cfg.recentSessionWindow()+"회 중 "+recentAbsences+"회 결석";code="FREQUENT_ABSENCE";}else if(inactive){reason="최근 "+cfg.inactiveDays()+"일 동안 참여 기록 없음";code="NO_RECENT_ATTENDANCE";}
   if(reason!=null)result.add(new AlertStudent(tm.getStudent().getId(),tm.getStudent().getName(),tm.getTeam().getName(),reason,code));
  } return result;
 }
 private long credited(List<Attendance> rows){return rows.stream().filter(x->policy.countsAsPresent(x.getStatus())).count();} private double rate(List<Attendance> rows){return policy.rate(rows.size(),credited(rows));}
}
