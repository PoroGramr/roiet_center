package com.roiet.center.service;
import com.roiet.center.domain.*;
import com.roiet.center.dto.*;
import com.roiet.center.dto.TeamDtos.*;
import com.roiet.center.exception.NotFoundException;
import com.roiet.center.repository.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @Transactional(readOnly=true)
public class TeamService {
 private final TeamRepository teams; private final UserRepository users; private final TeamMemberRepository members; private final ClassSessionRepository sessions; private final AttendanceRepository attendance; private final StudentService studentService; private final AttendancePolicy policy;
 public TeamService(TeamRepository t,UserRepository u,TeamMemberRepository m,ClassSessionRepository s,AttendanceRepository a,StudentService ss,AttendancePolicy p){teams=t;users=u;members=m;sessions=s;attendance=a;studentService=ss;policy=p;}
 public List<Summary> list(){
  var counts=attendance.summarizeLatestTeams().stream().collect(java.util.stream.Collectors.groupingBy(AttendanceRepository.TeamCount::getTeamId));
  var sizes=members.countCurrentByTeam().stream().collect(java.util.stream.Collectors.toMap(TeamMemberRepository.TeamSize::getTeamId,TeamMemberRepository.TeamSize::getCount));
  var dates=sessions.findLatestDates().stream().collect(java.util.stream.Collectors.toMap(ClassSessionRepository.TeamLatestDate::getTeamId,ClassSessionRepository.TeamLatestDate::getLatestDate));
  return teams.findAllActive().stream().map(t->{
   var rows=counts.getOrDefault(t.getId(),List.of());
   long total=rows.stream().mapToLong(AttendanceRepository.TeamCount::getCount).sum();
   long credited=rows.stream().filter(x->policy.countsAsPresent(x.getStatus())).mapToLong(AttendanceRepository.TeamCount::getCount).sum();
   return new Summary(t.getId(),t.getName(),t.getDescription(),t.getManager()==null?null:t.getManager().getId(),t.getManager()==null?null:t.getManager().getName(),sizes.getOrDefault(t.getId(),0L),dates.get(t.getId()),total==0?null:policy.rate(total,credited));
  }).toList();
 }
 @Transactional public Summary create(SaveRequest r){return summary(teams.save(new Team(r.name(),r.description(),manager(r.managerId()))));}
 @Transactional public Summary update(Long id,SaveRequest r){Team t=team(id);t.update(r.name(),r.description(),manager(r.managerId()));return summary(t);}
 public Detail get(Long id){
  Team t=teams.findDetailed(id).orElseThrow(()->new NotFoundException("팀을 찾을 수 없습니다.")); var current=members.findMembersOn(id,java.time.LocalDate.now()); var sessionRows=sessions.findRecent(id); var att=attendance.findByTeam(id);
  double rate=policy.rate(att.size(),att.stream().filter(x->policy.countsAsPresent(x.getStatus())).count());
  var studentDtos=current.stream().map(x->studentService.summary(x.getStudent(),x)).toList();
  var bySession=att.stream().collect(java.util.stream.Collectors.groupingBy(x->x.getSession().getId()));
  var sessionDtos=sessionRows.stream().map(s->{var rows=bySession.getOrDefault(s.getId(),List.of());return new SessionDtos.Summary(s.getId(),id,t.getName(),s.getSessionDate(),s.getTitle(),s.getContent(),rows.stream().filter(x->policy.countsAsPresent(x.getStatus())).count(),rows.size());}).toList();
  return new Detail(summary(t),studentDtos,sessionDtos,rate);
 }
 private Summary summary(Team t){var latest=sessions.findFirstByTeamIdAndDeletedFalseOrderBySessionDateDesc(t.getId());return new Summary(t.getId(),t.getName(),t.getDescription(),t.getManager()==null?null:t.getManager().getId(),t.getManager()==null?null:t.getManager().getName(),members.countByTeamIdAndEndedAtIsNull(t.getId()),latest.map(ClassSession::getSessionDate).orElse(null));}
 private Team team(Long id){return teams.findById(id).orElseThrow(()->new NotFoundException("팀을 찾을 수 없습니다."));}
 private User manager(Long id){
  if(id==null)return null;
  User user=users.findById(id).orElseThrow(()->new NotFoundException("담당자를 찾을 수 없습니다."));
  if(user.getRole()!=User.Role.TEACHER)throw new com.roiet.center.exception.BusinessException("담당 교사 권한의 사용자만 지정할 수 있습니다.");
  return user;
 }
}
