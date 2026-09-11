import { test, expect } from "@playwright/test";
import { mockApi } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("all primary pages fit viewport and have responsive navigation", async ({
  page,
}, info) => {
  for (const path of [
    "/",
    "/students",
    "/students/1",
    "/teams",
    "/teams/1",
    "/sessions",
    "/sessions/new?teamId=1",
    "/sessions/1",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[aria-busy=true]")).toHaveCount(0);
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: innerWidth,
    }));
    expect(
      dimensions.scroll,
      `${path} horizontal overflow`,
    ).toBeLessThanOrEqual(dimensions.width);
    if (info.project.name !== "desktop")
      await expect(
        page.getByRole("navigation", { name: "주 메뉴", exact: true }),
      ).toBeVisible();
    else await expect(page.locator(".sidebar")).toBeVisible();
    await page.screenshot({
      path: `test-results/screenshots/${info.project.name}-${path === "/" ? "dashboard" : path.replaceAll("/", "-").replace("?teamId=1", "")}.png`,
      fullPage: true,
    });
  }
});

test("30 students: bulk present, change, reset, save and edit without leaving", async ({
  page,
}) => {
  await page.goto("/sessions/new?teamId=1");
  await expect(page.locator(".attendance-row")).toHaveCount(30);
  await page.getByLabel("수업 내용", { exact: true }).fill("요한복음 3장");
  await expect(
    page.getByRole("button", { name: "수업 및 출석 저장" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "전체 출석", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "수업 및 출석 저장" }),
  ).toBeEnabled();
  const first = page.locator(".attendance-row").first();
  await first.getByRole("button", { name: "결석", exact: true }).click();
  await expect(
    first.getByRole("button", { name: "결석", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const last = page.locator(".attendance-row").last();
  await last.getByRole("button", { name: "지각", exact: true }).click();
  const targets = await page
    .locator(".attendance-option")
    .evaluateAll((nodes) =>
      nodes.map((n) => ({
        w: n.getBoundingClientRect().width,
        h: n.getBoundingClientRect().height,
      })),
    );
  expect(targets.every((t) => t.w >= 44 && t.h >= 44)).toBeTruthy();
  const save = await page.locator(".sticky-action-bar").boundingBox(),
    nav = await page.locator(".bottom-nav").boundingBox();
  if (nav && save) expect(save.y + save.height).toBeLessThanOrEqual(nav.y + 1);
  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "취소", exact: true }).click();
  await expect(
    last.getByRole("button", { name: "지각", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const request = page.waitForRequest(
    (r) => r.url().endsWith("/api/sessions") && r.method() === "POST",
  );
  await page.getByRole("button", { name: "수업 및 출석 저장" }).click();
  const payload = (await request).postDataJSON();
  expect(payload.attendances).toHaveLength(30);
  expect(payload.attendances[0].status).toBe("ABSENT");
  await expect(page).toHaveURL(/\/sessions\/3/);
  await page
    .locator(".attendance-row")
    .first()
    .getByRole("button", { name: "출석", exact: true })
    .click();
  await page.getByRole("button", { name: "출석 변경사항 저장" }).click();
  await expect(page.getByRole("status")).toContainText("저장했어요");
});

test("search, student history and bottom sheet selection", async ({ page }) => {
  await page.goto("/students");
  await page.getByRole("searchbox", { name: "학생 이름 검색" }).fill("김하늘");
  await expect(page.locator(".results-count")).toHaveText("학생 1명");
  await page.getByLabel("팀 선택", { exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "A팀", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const link = page.locator('a[href="/students/1"]:visible').first();
  await link.click();
  await expect(
    page.getByRole("heading", { name: "김하늘", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "최근 수업 참여 내역" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "팀 이동", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "이동 전 수업과 출석 이력은 그대로 보존됩니다.",
  );
});

test("failed save retains selections and permits retry", async ({ page }) => {
  await page.goto("/sessions/new?teamId=1");
  await page
    .getByLabel("수업 내용", { exact: true })
    .fill("통신 오류 복구 확인");
  await page.getByRole("button", { name: "전체 출석", exact: true }).click();
  let count = 0;
  await page.route("**/api/sessions", async (route) => {
    if (route.request().method() === "POST" && count++ === 0)
      await route.fulfill({
        status: 503,
        json: { message: "잠시 연결이 끊겼어요. 다시 저장해 주세요." },
      });
    else await route.fallback();
  });
  await page.getByRole("button", { name: "수업 및 출석 저장" }).click();
  await expect(page.locator(".save-error")).toContainText("다시 저장");
  await expect(
    page.locator(".attendance-option[aria-pressed=true]"),
  ).toHaveCount(30);
  await page.getByRole("button", { name: "수업 및 출석 저장" }).click();
  await expect(page).toHaveURL(/\/sessions\/3/);
});

test("admin can select a teacher while creating a team", async ({ page }) => {
  await page.goto("/teams");
  await page.getByRole("button", { name: "팀 만들기" }).click();
  await page.getByLabel("담당 교사 선택").click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(2);
  await page.getByRole("button", { name: /홍길동/ }).click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(1);
  await page.getByLabel("팀 이름").fill("새로운 팀");
  const request = page.waitForRequest(
    (r) => r.url().endsWith("/api/teams") && r.method() === "POST",
  );
  await page.getByRole("button", { name: "팀 만들기" }).last().click();
  expect((await request).postDataJSON()).toMatchObject({
    name: "새로운 팀",
    managerId: 2,
  });
});
