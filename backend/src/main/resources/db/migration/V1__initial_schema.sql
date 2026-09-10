create table users (
  id bigserial primary key, email varchar(150) not null unique, password varchar(255) not null,
  name varchar(80) not null, role varchar(20) not null check (role in ('ADMIN','TEACHER')),
  created_at timestamptz not null, updated_at timestamptz not null
);
create table team (
  id bigserial primary key, name varchar(80) not null, description varchar(1000), manager_id bigint references users(id),
  active boolean not null default true, created_at timestamptz not null, updated_at timestamptz not null
);
create table student (
  id bigserial primary key, name varchar(80) not null, phone varchar(30), status varchar(20) not null check (status in ('ACTIVE','INACTIVE','COMPLETED')),
  memo varchar(2000), created_at timestamptz not null, updated_at timestamptz not null
);
create table team_members (
  id bigserial primary key, team_id bigint not null references team(id), student_id bigint not null references student(id),
  started_at date not null, ended_at date,
  constraint ck_team_member_dates check (ended_at is null or ended_at >= started_at)
);
create unique index uk_team_member_current_student on team_members(student_id) where ended_at is null;
create index idx_team_member_team_dates on team_members(team_id, started_at, ended_at);
create index idx_team_member_student on team_members(student_id);
create table class_sessions (
  id bigserial primary key, team_id bigint not null references team(id), session_date date not null,
  start_time time, end_time time, title varchar(150), content varchar(4000) not null, memo varchar(2000),
  created_by bigint not null references users(id), deleted boolean not null default false,
  created_at timestamptz not null, updated_at timestamptz not null,
  constraint ck_session_times check (end_time is null or start_time is null or end_time > start_time)
);
create index idx_session_team_date on class_sessions(team_id, session_date);
create table attendances (
  id bigserial primary key, session_id bigint not null references class_sessions(id) on delete restrict,
  student_id bigint not null references student(id) on delete restrict,
  status varchar(20) not null check (status in ('PRESENT','ABSENT','LATE','EARLY_LEAVE','EXCUSED')),
  memo varchar(500), checked_by bigint not null references users(id), checked_at timestamptz not null,
  constraint uk_attendance_session_student unique(session_id, student_id)
);
create index idx_attendance_student on attendances(student_id);

