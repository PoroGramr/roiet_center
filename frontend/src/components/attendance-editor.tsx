"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, RotateCcw, Save, Search } from "lucide-react";
import { api, json } from "@/lib/api";
import { dateLabel, today } from "@/lib/utils";
import type { SessionDetail, Status, Team } from "@/lib/types";
import { Button } from "./ui/button";
import { TeamPicker } from "./forms";
import {
  AttendanceSelector,
  AttendanceSummary,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StickyActionBar,
} from "./domain";

const schema = z
  .object({
    sessionDate: z.string().min(1, "수업 날짜를 선택해 주세요."),
    content: z
      .string()
      .trim()
      .min(1, "수업 내용을 입력해 주세요.")
      .max(4000, "4,000자 이내로 입력해 주세요."),
    title: z.string().max(150),
    memo: z.string().max(2000),
    startTime: z.string(),
    endTime: z.string(),
  })
  .refine((v) => !v.startTime || !v.endTime || v.endTime > v.startTime, {
    message: "종료 시간은 시작 시간보다 늦어야 합니다.",
    path: ["endTime"],
  });
type Values = z.infer<typeof schema>;
type CheckValue = { status: Status; memo: string };
type Roster = { id: number; name: string; phone?: string }[];
const draftSchema = z.object({
  teamId: z.number(),
  values: z.object({
    sessionDate: z.string(),
    content: z.string(),
    title: z.string(),
    memo: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  }),
  checks: z.record(
    z.string(),
    z.object({
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EARLY_LEAVE", "EXCUSED"]),
      memo: z.string(),
    }),
  ),
});

export function AttendanceEditor({
  initialTeamId = 0,
  session,
}: {
  initialTeamId?: number;
  session?: SessionDetail;
}) {
  const router = useRouter(),
    cache = useQueryClient();
  const [teamId, setTeamId] = useState(session?.teamId || initialTeamId),
    [checks, setChecks] = useState<Record<number, CheckValue>>(() =>
      Object.fromEntries(
        session?.attendances.map((a) => [
          a.studentId,
          { status: a.status, memo: a.memo || "" },
        ]) || [],
      ),
    );
  const [error, setError] = useState(""),
    [resetConfirm, setResetConfirm] = useState(false),
    [pendingChange, setPendingChange] = useState<{
      team?: number;
      date?: string;
    } | null>(null),
    [saved, setSaved] = useState(false),
    [changed, setChanged] = useState(false);
  const [draftReady, setDraftReady] = useState(false),
    [draftRestored, setDraftRestored] = useState(false);
  const savingRef = useRef(false);
  const [studentSearch, setStudentSearch] = useState("");
  const key = session
    ? "roiet-draft-session-" + session.id
    : "roiet-draft-new-" + initialTeamId;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      sessionDate: session?.sessionDate || today(),
      content: session?.content || "",
      title: session?.title || "",
      memo: session?.memo || "",
      startTime: session?.startTime || "",
      endTime: session?.endTime || "",
    },
  });
  const values = watch(),
    date = values.sessionDate;
  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: () => api<Team[]>("/teams"),
  });
  const rosterQuery = useQuery({
    queryKey: ["roster", teamId, date],
    queryFn: () => api<Roster>("/teams/" + teamId + "/students?date=" + date),
    enabled: !!teamId && !!date && !session,
  });
  const roster: Roster = session
    ? session.attendances.map((a) => ({ id: a.studentId, name: a.studentName }))
    : rosterQuery.data || [];
  const checked = roster.filter((s) => checks[s.id]).length;
  const visibleRoster = roster.filter((s) => s.name.includes(studentSearch));

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = draftSchema.safeParse(JSON.parse(raw));
        if (parsed.success) {
          reset(parsed.data.values);
          setTeamId(parsed.data.teamId);
          setChecks(parsed.data.checks);
          setDraftRestored(true);
          setChanged(true);
        }
      }
    } catch {
      sessionStorage.removeItem(key);
    }
    setDraftReady(true);
  }, [key, reset]);
  useEffect(() => {
    if (!draftReady || !changed || savingRef.current) return;
    try {
      sessionStorage.setItem(key, json({ teamId, values, checks }));
    } catch {
      /* 메모리 상태는 계속 유지한다. */
    }
  }, [checks, values, teamId, key, draftReady, changed]);
  useEffect(() => {
    if (!changed) return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [changed]);
  useEffect(() => {
    const update = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const keyboard = window.innerHeight - vv.height > 150;
      document.documentElement.style.setProperty(
        "--keyboard-offset",
        keyboard ? `${window.innerHeight - vv.height - vv.offsetTop}px` : "0px",
      );
      document.documentElement.toggleAttribute("data-keyboard", keyboard);
    };
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      document.documentElement.removeAttribute("data-keyboard");
    };
  }, []);

  function mark() {
    setChanged(true);
    setSaved(false);
    setError("");
  }
  function applyChange(change: { team?: number; date?: string }) {
    if (change.team !== undefined) setTeamId(change.team);
    if (change.date !== undefined) setValue("sessionDate", change.date);
    setChecks({});
    setStudentSearch("");
    mark();
    setPendingChange(null);
  }
  function change(change: { team?: number; date?: string }) {
    if (checked) setPendingChange(change);
    else applyChange(change);
  }

  async function save(v: Values) {
    if (savingRef.current) return;
    if (!teamId) {
      setError("팀을 먼저 선택해 주세요.");
      return;
    }
    if (!roster.length || checked !== roster.length) {
      setError("모든 학생의 출석 상태를 선택해 주세요.");
      return;
    }
    savingRef.current = true;
    setError("");
    try {
      const attendances = roster.map((s) => ({
        studentId: s.id,
        status: checks[s.id].status,
        memo: checks[s.id].memo || null,
      }));
      const result = await api<SessionDetail>(
        session ? "/sessions/" + session.id + "/attendance" : "/sessions",
        {
          method: session ? "PUT" : "POST",
          body: json(
            session
              ? { attendances }
              : {
                  ...v,
                  teamId,
                  startTime: v.startTime || null,
                  endTime: v.endTime || null,
                  title: v.title || null,
                  memo: v.memo || null,
                  attendances,
                },
          ),
        },
      );
      setChanged(false);
      setSaved(true);
      sessionStorage.removeItem(key);
      await cache.invalidateQueries();
      if (!session) router.replace("/sessions/" + result.id + "?saved=1");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      savingRef.current = false;
    }
  }

  return (
    <div className="attendance-page">
      <Link href="/sessions" className="back-link">
        <ArrowLeft size={17} />
        수업 목록
      </Link>
      <div className="attendance-intro">
        <div>
          <p>{session ? "수업 기록 · 출석 수정" : "새 수업 기록"}</p>
          <h1>
            {session?.teamName ||
              teams.data?.find((t) => t.id === teamId)?.name ||
              "오늘의 수업"}
          </h1>
          {session && <p>{dateLabel(session.sessionDate)}</p>}
        </div>
        {session && <span className="team-tag">기록 완료</span>}
      </div>
      {draftRestored && (
        <div className="success-notice">이전에 입력하던 내용을 복원했어요.</div>
      )}
      {saved && (
        <div className="success-notice" role="status">
          <Check size={18} />
          출석 변경사항을 저장했어요.
        </div>
      )}
      <form
        id="attendance-form"
        onSubmit={handleSubmit(save)}
        onChange={mark}
        noValidate
      >
        <section className="form-section">
          {!session ? (
            <>
              <div className="form-grid">
                <div className="field">
                  <label>수업 팀</label>
                  <TeamPicker
                    value={teamId}
                    onChange={(id) => change({ team: id })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="field">
                  <label htmlFor="session-date">수업 날짜</label>
                  <input
                    id="session-date"
                    type="date"
                    value={date}
                    onChange={(e) => change({ date: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.sessionDate && (
                    <p className="field-error">{errors.sessionDate.message}</p>
                  )}
                </div>
              </div>
              <div className="field">
                <label htmlFor="session-content">수업 내용</label>
                <textarea
                  id="session-content"
                  placeholder="예: 요한복음 3장, 구원에 관한 나눔"
                  {...register("content")}
                  aria-invalid={!!errors.content}
                />
                {errors.content && (
                  <p className="field-error">{errors.content.message}</p>
                )}
              </div>
              <details>
                <summary className="optional-summary">
                  추가 정보 · 제목, 시간, 메모 <span>선택</span>
                </summary>
                <div className="field mt-4">
                  <label htmlFor="session-title">수업 제목</label>
                  <input id="session-title" {...register("title")} />
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="start-time">시작 시간</label>
                    <input
                      id="start-time"
                      type="time"
                      {...register("startTime")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="end-time">종료 시간</label>
                    <input id="end-time" type="time" {...register("endTime")} />
                    {errors.endTime && (
                      <p className="field-error">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="session-memo">메모</label>
                  <textarea id="session-memo" {...register("memo")} />
                </div>
              </details>
            </>
          ) : (
            <>
              {session.title && <h2 className="mb-2">{session.title}</h2>}
              <p className="memo">{session.content}</p>
              {session.startTime && (
                <p className="form-notice">
                  {session.startTime.slice(0, 5)}
                  {session.endTime ? " – " + session.endTime.slice(0, 5) : ""}
                </p>
              )}
              {session.memo && (
                <p className="form-notice whitespace-pre-wrap">
                  메모 · {session.memo}
                </p>
              )}
            </>
          )}
        </section>
        <section aria-label="학생 출석 체크">
          <div className="attendance-toolbar">
            <div className="section-heading">
              <h2>출석 체크</h2>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!roster.length || isSubmitting}
                  onClick={() => {
                    setChecks(
                      Object.fromEntries(
                        roster.map((s) => [
                          s.id,
                          { status: "PRESENT", memo: checks[s.id]?.memo || "" },
                        ]),
                      ),
                    );
                    mark();
                  }}
                >
                  <Check size={15} />
                  전체 출석
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!checked || isSubmitting}
                  onClick={() => setResetConfirm(true)}
                >
                  <RotateCcw size={14} />
                  초기화
                </Button>
              </div>
            </div>
            <AttendanceSummary checked={checked} total={roster.length} />
            {roster.length > 10 && (
              <div className="search-input mt-3">
                <Search size={18} />
                <input
                  aria-label="출석 명단 이름 검색"
                  type="search"
                  placeholder="이름으로 빠르게 찾기"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            )}
          </div>
          {!session && rosterQuery.isFetching ? (
            <LoadingSkeleton />
          ) : !session && rosterQuery.error ? (
            <ErrorState
              error={rosterQuery.error}
              retry={() => rosterQuery.refetch()}
            />
          ) : !roster.length ? (
            <EmptyState
              title={
                !teamId
                  ? "수업할 팀을 선택해 주세요"
                  : "해당 날짜에 소속된 학생이 없어요"
              }
              description={
                !teamId
                  ? "팀과 날짜를 선택하면 학생 명단이 표시돼요."
                  : "학생 소속 시작일과 수업 날짜를 확인해 주세요."
              }
            />
          ) : (
            visibleRoster.map((s, i) => (
              <article className="attendance-row" key={s.id}>
                <div className="attendance-student">
                  <span className="student-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <strong>{s.name}</strong>
                </div>
                <AttendanceSelector
                  name={s.name}
                  value={checks[s.id]?.status}
                  onChange={(status) => {
                    if (isSubmitting) return;
                    setChecks((prev) => ({
                      ...prev,
                      [s.id]: { status, memo: prev[s.id]?.memo || "" },
                    }));
                    mark();
                  }}
                />
                <details className="attendance-note">
                  <summary>
                    출석 메모{checks[s.id]?.memo ? " · 작성됨" : ""}
                  </summary>
                  <input
                    aria-label={s.name + " 출석 메모"}
                    maxLength={500}
                    placeholder="예: 병원 진료로 사유결석"
                    value={checks[s.id]?.memo || ""}
                    onChange={(e) => {
                      const memo = e.target.value;
                      if (checks[s.id]) {
                        setChecks((prev) => ({
                          ...prev,
                          [s.id]: { ...prev[s.id], memo },
                        }));
                        mark();
                      }
                    }}
                    disabled={!checks[s.id] || isSubmitting}
                  />
                </details>
              </article>
            ))
          )}
        </section>
      </form>
      <StickyActionBar>
        <div className="save-summary">
          <span>
            <strong>{checked}</strong> / {roster.length}명 체크 완료
          </span>
          <span>
            {changed
              ? "저장하지 않은 변경사항"
              : saved
                ? "저장 완료"
                : "학생별 상태를 확인해 주세요"}
          </span>
        </div>
        {error && (
          <p className="save-error" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          form="attendance-form"
          disabled={
            isSubmitting ||
            !roster.length ||
            checked !== roster.length ||
            (!session && rosterQuery.isFetching)
          }
        >
          <Save size={18} />
          {isSubmitting
            ? "저장 중…"
            : session
              ? "출석 변경사항 저장"
              : "수업 및 출석 저장"}
        </Button>
      </StickyActionBar>
      <ConfirmDialog
        open={resetConfirm}
        onOpenChange={setResetConfirm}
        title="출석 체크를 초기화할까요?"
        description="모든 학생의 선택과 출석 메모가 초기화됩니다. 저장된 기록은 저장 버튼을 누르기 전까지 변경되지 않습니다."
        onConfirm={() => {
          setChecks({});
          mark();
        }}
      />
      <ConfirmDialog
        open={!!pendingChange}
        onOpenChange={(open) => {
          if (!open) setPendingChange(null);
        }}
        title="학생 명단을 다시 불러올까요?"
        description="팀이나 날짜를 변경하면 현재 선택한 출석 상태가 초기화됩니다."
        onConfirm={() => pendingChange && applyChange(pendingChange)}
      />
    </div>
  );
}
