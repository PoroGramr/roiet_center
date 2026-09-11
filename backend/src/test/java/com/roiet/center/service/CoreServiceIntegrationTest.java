package com.roiet.center.service;

import com.roiet.center.domain.*;
import com.roiet.center.dto.AttendanceDtos;
import com.roiet.center.dto.SessionDtos;
import com.roiet.center.dto.StudentDtos;
import com.roiet.center.dto.TeamDtos;
import com.roiet.center.exception.BusinessException;
import com.roiet.center.repository.TeamMemberRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest @Transactional
class CoreServiceIntegrationTest {
 @Autowired TeamService teamService; @Autowired StudentService studentService; @Autowired SessionService sessionService; @Autowired UserService userService;
 @Autowired StatisticsService statisticsService; @Autowired DashboardService dashboardService; @Autowired TeamMemberRepository memberships; @Autowired JdbcTemplate jdbc;
 Long userId;
 @BeforeEach void user(){jdbc.update("insert into users(email,password,name,role,created_at,updated_at) values(?,?,?,?,current_timestamp,current_timestamp)","test@example.com","x","테스트 교사","TEACHER");userId=jdbc.queryForObject("select id from users where email='test@example.com'",Long.class);}

 @Test void createsTeamAndStudentAndAssignsMembership(){
  var team=team("A팀"); var student=student("김철수",team.id(),LocalDate.of(2026,1,1));
  assertThat(teamService.list()).extracting(TeamDtos.Summary::name).contains("A팀");
  assertThat(student.currentTeamId()).isEqualTo(team.id());
  assertThat(memberships.findCurrent(student.id())).isPresent();
 }

 @Test void movingTeamClosesOldMembershipAndKeepsHistory(){
  var a=team("A팀");var b=team("B팀");var student=student("김철수",a.id(),LocalDate.of(2026,1,1));
  studentService.move(student.id(),new StudentDtos.MoveTeamRequest(b.id(),LocalDate.of(2026,2,1)));
  var history=memberships.findHistory(student.id());
  assertThat(history).hasSize(2);assertThat(history).anySatisfy(x->{assertThat(x.getTeam().getId()).isEqualTo(a.id());assertThat(x.getEndedAt()).isEqualTo(LocalDate.of(2026,1,31));});
 }

 @Test void createsSessionAndAttendanceAtomicallyAndPreservesPastTeam(){
  var a=team("A팀");var b=team("B팀");var student=student("김철수",a.id(),LocalDate.of(2026,1,1));var date=LocalDate.of(2026,1,10);
  var created=sessionService.create(session(a.id(),date,List.of(input(student.id(),Attendance.Status.PRESENT))),userId);
  studentService.move(student.id(),new StudentDtos.MoveTeamRequest(b.id(),LocalDate.of(2026,2,1)));
  var detail=sessionService.get(created.id());
  assertThat(detail.teamId()).isEqualTo(a.id());assertThat(detail.attendances()).singleElement().extracting(AttendanceDtos.Record::studentId).isEqualTo(student.id());
 }

 @Test void rejectsDuplicateAttendanceAndIncompleteRoster(){
  var a=team("A팀");var s1=student("김철수",a.id(),LocalDate.of(2026,1,1));student("이영희",a.id(),LocalDate.of(2026,1,1));var date=LocalDate.of(2026,1,10);
  assertThatThrownBy(()->sessionService.create(session(a.id(),date,List.of(input(s1.id(),Attendance.Status.PRESENT),input(s1.id(),Attendance.Status.ABSENT))),userId)).isInstanceOf(BusinessException.class);
  assertThatThrownBy(()->sessionService.create(session(a.id(),date,List.of(input(s1.id(),Attendance.Status.PRESENT))),userId)).isInstanceOf(BusinessException.class);
 }

 @Test void calculatesAttendanceRateUsingPolicy(){
  var a=team("A팀");var s=student("김철수",a.id(),LocalDate.of(2026,1,1));
  sessionService.create(session(a.id(),LocalDate.of(2026,1,10),List.of(input(s.id(),Attendance.Status.PRESENT))),userId);
  sessionService.create(session(a.id(),LocalDate.of(2026,1,11),List.of(input(s.id(),Attendance.Status.LATE))),userId);
  sessionService.create(session(a.id(),LocalDate.of(2026,1,12),List.of(input(s.id(),Attendance.Status.ABSENT))),userId);
  assertThat(studentService.get(s.id()).statistics().attendanceRate()).isEqualTo(66.7);
  assertThat(statisticsService.team(a.id()).averageAttendanceRate()).isEqualTo(66.7);
 }

 @Test void detectsConsecutiveAbsencesFromConfigurableRule(){
  var a=team("A팀");var s=student("김철수",a.id(),LocalDate.now().minusDays(30));
  for(int i=1;i<=3;i++)sessionService.create(session(a.id(),LocalDate.now().minusDays(i),List.of(input(s.id(),Attendance.Status.ABSENT))),userId);
  assertThat(dashboardService.get().alerts()).anySatisfy(alert->{assertThat(alert.studentId()).isEqualTo(s.id());assertThat(alert.code()).isEqualTo("CONSECUTIVE_ABSENCE");});
 }

 @Test void listsTeachersAndAssignsTeacherAsManager(){
  var team=teamService.create(new TeamDtos.SaveRequest("교사 배정 팀",null,userId));
  assertThat(team.managerName()).isEqualTo("테스트 교사");
  assertThat(userService.teachers()).singleElement().satisfies(teacher->{assertThat(teacher.id()).isEqualTo(userId);assertThat(teacher.role()).isEqualTo("TEACHER");});
 }

 @Test void rejectsAdminAsTeamManager(){
  jdbc.update("insert into users(email,password,name,role,created_at,updated_at) values(?,?,?,?,current_timestamp,current_timestamp)","admin-test@example.com","x","테스트 관리자","ADMIN");
  Long adminId=jdbc.queryForObject("select id from users where email='admin-test@example.com'",Long.class);
  assertThatThrownBy(()->teamService.create(new TeamDtos.SaveRequest("잘못된 담당자 팀",null,adminId))).isInstanceOf(BusinessException.class).hasMessageContaining("담당 교사");
 }

 private TeamDtos.Summary team(String name){return teamService.create(new TeamDtos.SaveRequest(name,null,null));}
 private StudentDtos.Summary student(String name,Long team,LocalDate start){return studentService.create(new StudentDtos.SaveRequest(name,"010-0000-0000",Student.Status.ACTIVE,null,team,start));}
 private AttendanceDtos.Input input(Long id,Attendance.Status status){return new AttendanceDtos.Input(id,status,null);}
 private SessionDtos.CreateRequest session(Long team,LocalDate date,List<AttendanceDtos.Input> rows){return new SessionDtos.CreateRequest(team,date,null,null,null,"수업 내용",null,rows);}
}
