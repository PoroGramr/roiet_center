-- password: admin1234 / teacher1234 (BCrypt)
insert into users(email,password,name,role,created_at,updated_at) values
('admin@example.com','$2y$10$P.dLYVAg7FOZcACG3OvuDeesmRYyD9dYEHGkbTrl7dcZWONx6Acoi','관리자','ADMIN',now(),now()),
('teacher@example.com','$2y$10$eZPVnjPvnsMT5AjHWMmWN.28FPOctZnUURBlhdDNrnTs/tBZWp/jm','김선생','TEACHER',now(),now());
insert into team(name,description,manager_id,active,created_at,updated_at) values
('A팀','요한복음 학습팀',2,true,now(),now()),('B팀','기초 성경 학습팀',2,true,now(),now()),('C팀','성경 통독팀',2,true,now(),now());
insert into student(name,phone,status,memo,created_at,updated_at)
select '학생 ' || n, '010-1000-' || lpad(n::text,4,'0'), 'ACTIVE', null, now(), now() from generate_series(1,21) n;
insert into team_members(team_id,student_id,started_at)
select ((id-1)/7)+1, id, current_date-90 from student;
insert into class_sessions(team_id,session_date,title,content,memo,created_by,deleted,created_at,updated_at)
select t, current_date-d, case when d=1 then '요한복음 3장' else null end,
       case when d=1 then '구원에 관한 내용' else '말씀 묵상과 나눔' end, null, 2, false, now(), now()
from generate_series(1,3) t cross join (values (1),(4),(8),(11),(15)) v(d);
insert into attendances(session_id,student_id,status,memo,checked_by,checked_at)
select cs.id, tm.student_id,
  case when (cs.id+tm.student_id)%9=0 then 'ABSENT' when (cs.id+tm.student_id)%7=0 then 'LATE' else 'PRESENT' end,
  null, 2, now()
from class_sessions cs join team_members tm on tm.team_id=cs.team_id;
