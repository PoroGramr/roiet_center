import { test, expect } from "@playwright/test";

test("real API: login, create team/student, record attendance, search history", async ({
  page,
}, info) => {
  test.skip(
    process.env.LIVE_API !== "1" || info.project.name !== "mobile-390",
    "LIVE_API=1 및 실제 로컬 백엔드가 필요합니다.",
  );
  const suffix = Date.now().toString().slice(-7),
    teamName = "QA팀 " + suffix,
    studentName = "QA학생 " + suffix;
  await page.goto("/login");
  await page.getByLabel("이메일", { exact: true }).fill("admin@example.com");
  await page.getByLabel("비밀번호", { exact: true }).fill("admin1234");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: "오늘의 수업" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "주 메뉴", exact: true })
    .getByRole("link", { name: "팀", exact: true })
    .click();
  await page.getByRole("button", { name: "팀 만들기", exact: true }).click();
  await page.getByLabel("팀 이름", { exact: true }).fill(teamName);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "팀 만들기", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: teamName, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "새 학생", exact: true }).click();
  await page.getByLabel("이름", { exact: true }).fill(studentName);
  await page.getByRole("button", { name: "학생 등록", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText(studentName, { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "새 수업 기록", exact: true }).click();
  await expect(page.locator(".attendance-row")).toHaveCount(1);
  await page
    .getByLabel("수업 내용", { exact: true })
    .fill("실제 API 통합 검증");
  await page.getByRole("button", { name: "전체 출석", exact: true }).click();
  await page.getByRole("button", { name: "수업 및 출석 저장" }).click();
  await expect(page).toHaveURL(/\/sessions\/\d+/);
  await page
    .locator(".attendance-row")
    .getByRole("button", { name: "지각", exact: true })
    .click();
  await page.getByRole("button", { name: "출석 변경사항 저장" }).click();
  await expect(page.getByRole("status")).toContainText("저장했어요");
  await page
    .getByRole("navigation", { name: "주 메뉴", exact: true })
    .getByRole("link", { name: "학생", exact: true })
    .click();
  await page.getByRole("searchbox").fill(studentName);
  await expect(page.locator(".results-count")).toHaveText("학생 1명");
  await page.getByRole("link").filter({ hasText: studentName }).first().click();
  await expect(
    page.getByRole("heading", { name: "최근 수업 참여 내역" }),
  ).toBeVisible();
  await expect(page.locator(".status-badge")).toHaveText("지각");
  await page.screenshot({
    path: "test-results/live-student-history.png",
    fullPage: true,
  });
});
