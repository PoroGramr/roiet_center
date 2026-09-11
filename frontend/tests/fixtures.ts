import type { Page } from "@playwright/test";
const date = new Date().toLocaleDateString("sv-SE");
const names = [
  "김하늘",
  "이서준",
  "박지우",
  "최민서",
  "정도윤",
  "강서연",
  "조현우",
  "윤지민",
  "장수빈",
  "임예준",
  "한소율",
  "오지호",
  "서유진",
  "신태윤",
  "권하윤",
  "황시우",
  "안채원",
  "송준서",
  "류다은",
  "홍서진",
  "김민준",
  "이도현",
  "박가은",
  "최지안",
  "정시윤",
  "강예린",
  "조유준",
  "윤수아",
  "장지훈",
  "아주긴학생이름레이아웃검증을위한이름",
];
export const students = names.map((name, i) => ({
  id: i + 1,
  name,
  phone: "010-1234-5678",
  status: "ACTIVE",
  memo: "매주 꾸준히 참여하고 있습니다.",
  currentTeamId: 1,
  currentTeamName: "A팀",
}));
export const teams = [
  {
    id: 1,
    name: "A팀",
    description: "함께 읽고 나누는 요한복음",
    managerId: 2,
    managerName: "홍길동",
    currentStudentCount: 30,
    recentSessionDate: date,
  },
  {
    id: 2,
    name: "B팀",
    description: "믿음의 첫걸음을 함께해요",
    managerId: 2,
    managerName: "홍길동",
    currentStudentCount: 8,
    recentSessionDate: date,
  },
  {
    id: 3,
    name: "C팀",
    description: "말씀과 함께하는 하루",
    managerId: 2,
    managerName: "홍길동",
    currentStudentCount: 7,
    recentSessionDate: date,
  },
];
export const sessions = [
  {
    id: 1,
    teamId: 1,
    teamName: "A팀",
    sessionDate: date,
    title: "요한복음 3장",
    content: "구원에 관한 말씀과 나눔",
    attended: 27,
    total: 30,
    startTime: "14:00",
  },
  {
    id: 2,
    teamId: 2,
    teamName: "B팀",
    sessionDate: date,
    title: "기도와 신앙생활",
    content: "일상에서 실천하는 기도",
    attended: 7,
    total: 8,
    startTime: "16:00",
  },
];
export async function mockApi(page: Page) {
  let stored = sessions.map((s) => ({ ...s }));
  let savedRows = students.map((s) => ({
    studentId: s.id,
    studentName: s.name,
    status: "PRESENT",
    memo: "",
    sessionDate: date,
    sessionId: 1,
    teamName: "A팀",
  }));
  await page.addInitScript(() => {
    sessionStorage.setItem("roiet-token", "test-token");
    sessionStorage.setItem(
      "roiet-user",
      JSON.stringify({ id: 2, name: "홍길동", role: "ADMIN" }),
    );
  });
  await page.route("**/api/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      path = url.pathname;
    let body: unknown;
    if (path === "/api/users/teachers")
      body = [
        {
          id: 2,
          email: "teacher@example.com",
          name: "홍길동",
          role: "TEACHER",
        },
      ];
    else if (path === "/api/teams")
      body = req.method() === "GET" ? teams : teams[0];
    else if (/^\/api\/teams\/\d+\/students$/.test(path)) body = students;
    else if (/^\/api\/teams\/\d+$/.test(path))
      body = {
        team: teams[0],
        students,
        sessions: stored,
        attendanceRate: 86.7,
      };
    else if (path === "/api/students") {
      body = students.filter((s) =>
        s.name.includes(url.searchParams.get("q") || ""),
      );
    } else if (/^\/api\/students\/\d+$/.test(path)) {
      const id = Number(path.split("/").pop());
      body = {
        student: students.find((s) => s.id === id) || students[0],
        teamHistory: [
          {
            teamId: 1,
            teamName: "A팀",
            startedAt: "2026-01-01",
            endedAt: null,
          },
        ],
        statistics: {
          total: 20,
          present: 15,
          absent: 3,
          late: 2,
          earlyLeave: 0,
          excused: 0,
          attendanceRate: 85,
        },
        recentAttendance: [{ ...savedRows[0], sessionId: 1 }],
      };
    } else if (path === "/api/dashboard")
      body = {
        date,
        today: stored.slice(0, 2).map((s) => ({ ...s, sessionId: s.id })),
        weeklySessionCount: 5,
        weeklyAttendanceRate: 86.7,
        teamRates: [
          { teamId: 1, teamName: "A팀", attendanceRate: 90 },
          { teamId: 2, teamName: "B팀", attendanceRate: 87.5 },
          { teamId: 3, teamName: "C팀", attendanceRate: 82 },
        ],
        alerts: [
          {
            studentId: 1,
            studentName: "김하늘",
            teamName: "A팀",
            reason: "최근 3회 연속 결석",
            code: "CONSECUTIVE_ABSENCE",
          },
          {
            studentId: 2,
            studentName: "이서준",
            teamName: "A팀",
            reason: "최근 14일간 참여 기록 없음",
            code: "NO_RECENT_ATTENDANCE",
          },
        ],
      };
    else if (path === "/api/sessions" && req.method() === "POST") {
      const input = req.postDataJSON();
      savedRows = input.attendances.map(
        (a: { studentId: number; status: string }) => ({
          ...a,
          studentName: students.find((s) => s.id === a.studentId)?.name,
          sessionDate: input.sessionDate,
          sessionId: 3,
          teamName: "A팀",
        }),
      );
      stored.push({
        ...input,
        id: 3,
        teamName: "A팀",
        total: 30,
        attended: 29,
      });
      body = { ...stored[2], attendances: savedRows };
    } else if (path === "/api/sessions") body = stored;
    else if (/^\/api\/sessions\/\d+\/attendance$/.test(path)) {
      const input = req.postDataJSON();
      savedRows = input.attendances.map((a: { studentId: number }) => ({
        ...a,
        studentName: students.find((s) => s.id === a.studentId)?.name,
      }));
      body = { ...stored[0], attendances: savedRows };
    } else if (/^\/api\/sessions\/\d+$/.test(path)) {
      body = {
        ...(stored.find((s) => s.id === Number(path.split("/").pop())) ||
          stored[0]),
        startTime: "14:00",
        endTime: "15:00",
        memo: "함께 나누는 시간",
        attendances: savedRows,
      };
    } else {
      await route.fulfill({
        status: 404,
        json: { message: "테스트 경로 없음: " + path },
      });
      return;
    }
    await route.fulfill({ json: body });
  });
}
