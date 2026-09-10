package com.roiet.center.service;
import com.roiet.center.domain.Attendance;
import com.roiet.center.dto.AttendanceDtos.*;
import com.roiet.center.exception.NotFoundException;
import com.roiet.center.repository.*;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @Transactional(readOnly=true)
public class StatisticsService {
 private final TeamRepository teams; private final AttendanceRepository attendance; private final ClassSessionRepository sessions; private final AttendancePolicy policy;
 public StatisticsService(TeamRepository t,AttendanceRepository a,ClassSessionRepository s,AttendancePolicy p){teams=t;attendance=a;sessions=s;policy=p;}
 public TeamStatistics team(Long teamId){
  teams.findById(teamId).orElseThrow(()->new NotFoundException("팀을 찾을 수 없습니다.")); var rows=attendance.findByTeam(teamId); var grouped=rows.stream().collect(Collectors.groupingBy(x->x.getStudent().getId()));
  var rates=grouped.values().stream().map(list->{var first=list.getFirst().getStudent();return new StudentRate(first.getId(),first.getName(),rate(list));}).sorted(Comparator.comparing(StudentRate::studentName)).toList();
  var latest=sessions.findFirstByTeamIdAndDeletedFalseOrderBySessionDateDesc(teamId).map(s->attendance.findBySession(s.getId())).orElse(List.of());
  return new TeamStatistics(sessions.findRecent(teamId).size(),rate(rows),rate(latest),rates);
 }
 private double rate(List<Attendance> rows){return policy.rate(rows.size(),rows.stream().filter(x->policy.countsAsPresent(x.getStatus())).count());}
}

