package com.roiet.center.service;
import com.roiet.center.domain.*;
import com.roiet.center.dto.*;
import com.roiet.center.dto.SessionDtos.*;
import com.roiet.center.exception.*;
import com.roiet.center.repository.*;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional(readOnly=true)
public class SessionService {
 private final ClassSessionRepository sessions; private final TeamRepository teams; private final StudentRepository students; private final TeamMemberRepository members; private final AttendanceRepository attendances; private final UserRepository users; private final AttendancePolicy policy;
 public SessionService(ClassSessionRepository s,TeamRepository t,StudentRepository st,TeamMemberRepository m,AttendanceRepository a,UserRepository u,AttendancePolicy p){sessions=s;teams=t;students=st;members=m;attendances=a;users=u;policy=p;}
 public List<Summary> list(Long teamId){
  var found=sessions.findRecent(teamId); if(found.isEmpty()) return List.of();
  var rows=attendances.findBySessionIds(found.stream().map(ClassSession::getId).toList()).stream().collect(Collectors.groupingBy(x->x.getSession().getId()));
  return found.stream().map(s->summary(s,rows.getOrDefault(s.getId(),List.of()))).toList();
 }
 public List<EligibleStudent> eligible(Long teamId,LocalDate date){team(teamId);return members.findMembersOn(teamId,date).stream().map(x->new EligibleStudent(x.getStudent().getId(),x.getStudent().getName(),x.getStudent().getPhone())).toList();}
 @Transactional public Detail create(CreateRequest r,Long userId){
  validateTimes(r.startTime(),r.endTime()); Team team=team(r.teamId()); User checker=user(userId); Map<Long,Student> eligible=eligibleMap(team.getId(),r.sessionDate()); validateInputs(r.attendances(),eligible.keySet());
  ClassSession session=sessions.save(new ClassSession(team,r.sessionDate(),r.startTime(),r.endTime(),r.title(),r.content(),r.memo(),checker));
  attendances.saveAll(r.attendances().stream().map(x->new Attendance(session,eligible.get(x.studentId()),x.status(),x.memo(),checker)).toList());
  return detail(session);
 }
 public Detail get(Long id){return detail(session(id));}
 @Transactional public Detail update(Long id,UpdateRequest r){
  validateTimes(r.startTime(),r.endTime()); ClassSession s=session(id);
  Set<Long> eligible=eligibleMap(s.getTeam().getId(),r.sessionDate()).keySet(); Set<Long> recorded=attendances.findBySession(id).stream().map(x->x.getStudent().getId()).collect(Collectors.toSet());
  if(!eligible.equals(recorded)) throw new BusinessException("날짜 변경 후 팀원 구성이 기존 출석 기록과 달라 수업 날짜를 변경할 수 없습니다.");
  s.update(r.sessionDate(),r.startTime(),r.endTime(),r.title(),r.content(),r.memo()); return detail(s);
 }
 @Transactional public Detail replaceAttendance(Long id,AttendanceDtos.BulkRequest r,Long userId){
  ClassSession s=session(id); User checker=user(userId); Map<Long,Student> eligible=eligibleMap(s.getTeam().getId(),s.getSessionDate()); validateInputs(r.attendances(),eligible.keySet());
  Map<Long,Attendance> existing=attendances.findBySession(id).stream().collect(Collectors.toMap(x->x.getStudent().getId(),Function.identity()));
  for(var input:r.attendances()){var row=existing.get(input.studentId());if(row==null)attendances.save(new Attendance(s,eligible.get(input.studentId()),input.status(),input.memo(),checker));else row.update(input.status(),input.memo(),checker);}
  return detail(s);
 }
 @Transactional public void delete(Long id){session(id).delete();}
 private void validateInputs(List<AttendanceDtos.Input> inputs,Set<Long> eligible){Set<Long> ids=inputs.stream().map(AttendanceDtos.Input::studentId).collect(Collectors.toSet());if(ids.size()!=inputs.size())throw new BusinessException("한 학생의 출석 상태가 중복되었습니다.");if(!ids.equals(eligible))throw new BusinessException("출석 명단은 수업일 당시 팀원 전체와 정확히 일치해야 합니다.");}
 private Map<Long,Student> eligibleMap(Long teamId,LocalDate date){return members.findMembersOn(teamId,date).stream().map(TeamMember::getStudent).collect(Collectors.toMap(Student::getId,Function.identity()));}
 private void validateTimes(java.time.LocalTime start,java.time.LocalTime end){if(start!=null&&end!=null&&!end.isAfter(start))throw new BusinessException("종료 시간은 시작 시간보다 늦어야 합니다.");}
 private Summary summary(ClassSession s,List<Attendance> rows){return new Summary(s.getId(),s.getTeam().getId(),s.getTeam().getName(),s.getSessionDate(),s.getTitle(),s.getContent(),rows.stream().filter(x->policy.countsAsPresent(x.getStatus())).count(),rows.size());}
 private Detail detail(ClassSession s){var rows=attendances.findBySession(s.getId()).stream().map(a->new AttendanceDtos.Record(a.getId(),a.getStudent().getId(),a.getStudent().getName(),a.getStatus(),a.getMemo(),s.getSessionDate(),s.getId(),s.getTeam().getName())).toList();return new Detail(s.getId(),s.getTeam().getId(),s.getTeam().getName(),s.getSessionDate(),s.getStartTime(),s.getEndTime(),s.getTitle(),s.getContent(),s.getMemo(),rows);}
 private ClassSession session(Long id){return sessions.findDetailed(id).orElseThrow(()->new NotFoundException("수업을 찾을 수 없습니다."));}
 private Team team(Long id){return teams.findById(id).orElseThrow(()->new NotFoundException("팀을 찾을 수 없습니다."));}
 private User user(Long id){return users.findById(id).orElseThrow(()->new NotFoundException("사용자를 찾을 수 없습니다."));}
}
