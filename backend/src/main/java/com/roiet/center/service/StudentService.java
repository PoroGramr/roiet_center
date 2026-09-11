package com.roiet.center.service;

import com.roiet.center.domain.*;
import com.roiet.center.dto.*;
import com.roiet.center.dto.StudentDtos.*;
import com.roiet.center.exception.*;
import com.roiet.center.repository.*;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional(readOnly=true)
public class StudentService {
 private final StudentRepository students; private final TeamRepository teams; private final TeamMemberRepository memberships; private final AttendanceRepository attendances; private final AttendancePolicy policy;
 public StudentService(StudentRepository s,TeamRepository t,TeamMemberRepository m,AttendanceRepository a,AttendancePolicy p){students=s;teams=t;memberships=m;attendances=a;policy=p;}
 public List<Summary> list(String q,Student.Status status,Long teamId){
  var current=memberships.findAllCurrent().stream().collect(Collectors.toMap(x->x.getStudent().getId(),Function.identity()));
  var found=students.search(blankToNull(q),status,teamId);
  if(found.isEmpty()) return List.of();
  var counts=attendances.summarizeStudents(found.stream().map(Student::getId).toList()).stream().collect(Collectors.groupingBy(AttendanceRepository.StudentCount::getStudentId));
  return found.stream().map(s->{
   var base=summary(s,current.get(s.getId()));
   var rows=counts.getOrDefault(s.getId(),List.of());
   long total=rows.stream().mapToLong(AttendanceRepository.StudentCount::getCount).sum();
   long credited=rows.stream().filter(x->policy.countsAsPresent(x.getStatus())).mapToLong(AttendanceRepository.StudentCount::getCount).sum();
   var latest=rows.stream().filter(x->policy.countsAsPresent(x.getStatus())).map(AttendanceRepository.StudentCount::getLatestDate).max(LocalDate::compareTo).orElse(null);
   return new Summary(base.id(),base.name(),base.phone(),base.status(),base.memo(),base.currentTeamId(),base.currentTeamName(),total==0?null:policy.rate(total,credited),latest);
  }).toList();
 }
 @Transactional public Summary create(SaveRequest r){
  Student s=students.save(new Student(r.name(),r.phone(),r.status(),r.memo())); TeamMember tm=null;
  if(r.teamId()!=null){ var t=team(r.teamId()); tm=memberships.save(new TeamMember(t,s,r.startedAt()==null?LocalDate.now():r.startedAt())); }
  return summary(s,tm);
 }
 public Detail get(Long id){
  Student s=student(id); var history=memberships.findHistory(id); var records=attendances.findByStudent(id); var current=history.stream().filter(x->x.getEndedAt()==null).findFirst().orElse(null);
  return new Detail(summary(s,current),history.stream().map(x->new TeamHistory(x.getTeam().getId(),x.getTeam().getName(),x.getStartedAt(),x.getEndedAt())).toList(),statistics(records),records.stream().limit(12).map(this::record).toList());
 }
 @Transactional public Summary update(Long id,SaveRequest r){Student s=student(id);s.update(r.name(),r.phone(),r.status(),r.memo());return summary(s,memberships.findCurrent(id).orElse(null));}
 @Transactional public Summary move(Long id,MoveTeamRequest r){
  Student s=student(id); Team target=team(r.teamId()); var current=memberships.findCurrent(id).orElse(null);
  if(current!=null&&current.getTeam().getId().equals(target.getId())) throw new BusinessException("이미 해당 팀에 소속되어 있습니다.");
  if(current!=null) { current.endOn(r.movedAt().minusDays(1)); memberships.flush(); }
  var next=memberships.save(new TeamMember(target,s,r.movedAt())); return summary(s,next);
 }
 Student student(Long id){return students.findById(id).orElseThrow(()->new NotFoundException("학생을 찾을 수 없습니다."));}
 private Team team(Long id){return teams.findById(id).orElseThrow(()->new NotFoundException("팀을 찾을 수 없습니다."));}
 Summary summary(Student s,TeamMember tm){return new Summary(s.getId(),s.getName(),s.getPhone(),s.getStatus(),s.getMemo(),tm==null?null:tm.getTeam().getId(),tm==null?null:tm.getTeam().getName());}
 private AttendanceDtos.Record record(Attendance a){return new AttendanceDtos.Record(a.getId(),a.getStudent().getId(),a.getStudent().getName(),a.getStatus(),a.getMemo(),a.getSession().getSessionDate(),a.getSession().getId(),a.getSession().getTeam().getName());}
 AttendanceDtos.StudentStatistics statistics(List<Attendance> rows){long p=rows.stream().filter(x->x.getStatus()==Attendance.Status.PRESENT).count(),ab=rows.stream().filter(x->x.getStatus()==Attendance.Status.ABSENT).count(),l=rows.stream().filter(x->x.getStatus()==Attendance.Status.LATE).count(),e=rows.stream().filter(x->x.getStatus()==Attendance.Status.EARLY_LEAVE).count(),ex=rows.stream().filter(x->x.getStatus()==Attendance.Status.EXCUSED).count(),credited=rows.stream().filter(x->policy.countsAsPresent(x.getStatus())).count();return new AttendanceDtos.StudentStatistics(rows.size(),p,ab,l,e,ex,policy.rate(rows.size(),credited));}
 private String blankToNull(String s){return s==null||s.isBlank()?null:s;}
}
