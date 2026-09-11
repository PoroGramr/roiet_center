export type Status = "PRESENT" | "ABSENT" | "LATE" | "EARLY_LEAVE" | "EXCUSED";
export type UserSummary = {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "TEACHER";
};
export type Student = {
  id: number;
  name: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED";
  memo: string;
  currentTeamId: number | null;
  currentTeamName: string | null;
  attendanceRate?: number | null;
  latestAttendanceDate?: string | null;
};
export type Team = {
  id: number;
  name: string;
  description: string;
  managerId: number | null;
  managerName: string | null;
  currentStudentCount: number;
  recentSessionDate: string | null;
  recentAttendanceRate?: number | null;
};
export type Session = {
  id: number;
  teamId: number;
  teamName: string;
  sessionDate: string;
  title: string | null;
  content: string;
  attended: number;
  total: number;
};
export type Attendance = {
  studentId: number;
  studentName: string;
  status: Status;
  memo: string | null;
  sessionDate: string;
  sessionId: number;
  teamName: string;
};
export type SessionDetail = Session & {
  startTime: string | null;
  endTime: string | null;
  memo: string | null;
  attendances: Attendance[];
};
export type StudentDetail = {
  student: Student;
  teamHistory: {
    teamId: number;
    teamName: string;
    startedAt: string;
    endedAt: string | null;
  }[];
  statistics: {
    total: number;
    present: number;
    absent: number;
    late: number;
    earlyLeave: number;
    excused: number;
    attendanceRate: number;
  };
  recentAttendance: Attendance[];
};
export type TeamDetail = {
  team: Team;
  students: Student[];
  sessions: Session[];
  attendanceRate: number;
};
export type Dashboard = {
  date: string;
  today: {
    sessionId: number;
    teamId: number;
    teamName: string;
    attended: number;
    total: number;
    startTime?: string | null;
  }[];
  weeklySessionCount: number;
  weeklyAttendanceRate: number;
  teamRates: { teamId: number; teamName: string; attendanceRate: number }[];
  alerts: {
    studentId: number;
    studentName: string;
    teamName: string;
    reason: string;
    code: string;
  }[];
};
