"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { api, json } from "@/lib/api";
import { today } from "@/lib/utils";
import type { Team, Student, UserSummary } from "@/lib/types";
import { Button } from "./ui/button";
import { BottomSheet } from "./ui/dialog";
import { ErrorState, LoadingSkeleton } from "./domain";

export function TeamPicker({
  value,
  onChange,
  allowAll = false,
  label = "팀 선택",
  disabled = false,
}: {
  value?: number | null;
  onChange: (id: number) => void;
  allowAll?: boolean;
  label?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["teams"],
    queryFn: () => api<Team[]>("/teams"),
  });
  return (
    <>
      <button
        type="button"
        className="filter-button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="dialog"
      >
        {query.data?.find((t) => t.id === value)?.name ||
          (allowAll ? "전체 팀" : "팀 선택")}
        <ChevronDown size={16} />
      </button>
      <BottomSheet open={open} onOpenChange={setOpen} title={label}>
        {query.isPending ? (
          <LoadingSkeleton />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => query.refetch()} />
        ) : (
          <div className="sheet-options">
            {allowAll && (
              <button
                type="button"
                className="sheet-option"
                aria-pressed={!value}
                onClick={() => {
                  onChange(0);
                  setOpen(false);
                }}
              >
                전체 팀{!value && <Check size={18} />}
              </button>
            )}
            {query.data?.map((t) => (
              <button
                type="button"
                className="sheet-option"
                aria-pressed={value === t.id}
                key={t.id}
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
              >
                {t.name}
                {value === t.id && <Check size={18} />}
              </button>
            ))}
            {!query.data?.length && (
              <p className="form-notice">
                먼저 팀 관리에서 팀을 만들어 주세요.
              </p>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}

function TeacherPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["teachers"],
    queryFn: () => api<UserSummary[]>("/users/teachers"),
  });
  const selected = query.data?.find((teacher) => teacher.id === value);
  return (
    <>
      <button
        type="button"
        className="filter-button"
        onClick={() => setOpen(true)}
        aria-label="담당 교사 선택"
        aria-haspopup="dialog"
      >
        {selected?.name || "담당 교사 선택"}
        <ChevronDown size={16} />
      </button>
      <BottomSheet open={open} onOpenChange={setOpen} title="담당 교사 선택">
        {query.isPending ? (
          <LoadingSkeleton />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => query.refetch()} />
        ) : (
          <div className="sheet-options">
            <button
              type="button"
              className="sheet-option"
              aria-pressed={value === null}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              지정 안 함{value === null && <Check size={18} />}
            </button>
            {query.data?.map((teacher) => (
              <button
                type="button"
                className="sheet-option"
                aria-pressed={value === teacher.id}
                key={teacher.id}
                onClick={() => {
                  onChange(teacher.id);
                  setOpen(false);
                }}
              >
                <span>
                  {teacher.name}
                  <small className="block text-muted">{teacher.email}</small>
                </span>
                {value === teacher.id && <Check size={18} />}
              </button>
            ))}
            {!query.data?.length && (
              <p className="form-notice">등록된 담당 교사가 없습니다.</p>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
const studentSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(80),
  phone: z.string().max(30),
  status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]),
  memo: z.string().max(2000),
});
export function StudentForm({
  student,
  onSaved,
  defaultTeamId,
}: {
  student?: Student;
  onSaved: (id: number) => void;
  defaultTeamId?: number;
}) {
  const cache = useQueryClient(),
    [error, setError] = useState(""),
    [teamId, setTeamId] = useState<number | undefined>(defaultTeamId),
    [startedAt, setStartedAt] = useState(today());
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || "",
      phone: student?.phone || "",
      status: student?.status || "ACTIVE",
      memo: student?.memo || "",
    },
  });
  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const s = await api<Student>(
            student ? "/students/" + student.id : "/students",
            {
              method: student ? "PATCH" : "POST",
              body: json({
                ...values,
                ...(!student ? { teamId: teamId || null, startedAt } : {}),
              }),
            },
          );
          await cache.invalidateQueries();
          onSaved(s.id);
        } catch (e) {
          setError((e as Error).message);
        }
      })}
    >
      <div className="field">
        <label htmlFor="student-name">이름</label>
        <input autoComplete="name" id="student-name" {...register("name")} />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>
      <div className="field">
        <label htmlFor="student-phone">
          연락처 <small>선택</small>
        </label>
        <input
          id="student-phone"
          type="tel"
          autoComplete="tel"
          {...register("phone")}
        />
      </div>
      <div className="field">
        <label htmlFor="student-status">재원 상태</label>
        <select id="student-status" {...register("status")}>
          <option value="ACTIVE">재원</option>
          <option value="INACTIVE">비활성</option>
          <option value="COMPLETED">수료</option>
        </select>
      </div>
      {!student && (
        <>
          <div className="field">
            <label>
              소속 팀 <small>선택</small>
            </label>
            <TeamPicker value={teamId} onChange={setTeamId} />
          </div>
          {teamId && (
            <div className="field">
              <label htmlFor="started-at">소속 시작일</label>
              <input
                id="started-at"
                type="date"
                required
                value={startedAt}
                max={today()}
                onChange={(e) => setStartedAt(e.target.value)}
              />
            </div>
          )}
        </>
      )}
      <div className="field">
        <label htmlFor="student-memo">
          메모 <small>선택</small>
        </label>
        <textarea id="student-memo" {...register("memo")} />
        {errors.memo && (
          <p className="field-error">메모는 2,000자 이내로 입력해 주세요.</p>
        )}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <Button className="full" disabled={isSubmitting}>
        {isSubmitting ? "저장 중…" : student ? "정보 저장" : "학생 등록"}
      </Button>
    </form>
  );
}
const teamSchema = z.object({
  name: z.string().trim().min(1, "팀 이름을 입력해 주세요.").max(80),
  description: z.string().max(1000),
});
export function TeamForm({
  team,
  onSaved,
}: {
  team?: Team;
  onSaved: (id: number) => void;
}) {
  const cache = useQueryClient(),
    [error, setError] = useState(""),
    [managerId, setManagerId] = useState<number | null>(
      team?.managerId ?? null,
    );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
    },
  });
  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const result = await api<Team>(
            team ? "/teams/" + team.id : "/teams",
            {
              method: team ? "PATCH" : "POST",
              body: json({ ...values, managerId }),
            },
          );
          await cache.invalidateQueries();
          onSaved(result.id);
        } catch (e) {
          setError((e as Error).message);
        }
      })}
    >
      <div className="field">
        <label htmlFor="team-name">팀 이름</label>
        <input id="team-name" placeholder="예: A팀" {...register("name")} />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>
      <div className="field">
        <label>
          담당 교사 <small>선택</small>
        </label>
        <TeacherPicker value={managerId} onChange={setManagerId} />
      </div>
      <div className="field">
        <label htmlFor="team-description">
          팀 소개 <small>선택</small>
        </label>
        <textarea
          id="team-description"
          placeholder="팀에 대해 간단히 적어 주세요"
          {...register("description")}
        />
        {errors.description && (
          <p className="field-error">1,000자 이내로 입력해 주세요.</p>
        )}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <Button className="full" disabled={isSubmitting}>
        {isSubmitting ? "저장 중…" : team ? "정보 저장" : "팀 만들기"}
      </Button>
    </form>
  );
}
export function MoveTeamForm({
  student,
  onSaved,
}: {
  student: Student;
  onSaved: () => void;
}) {
  const cache = useQueryClient(),
    [teamId, setTeamId] = useState(0),
    [date, setDate] = useState(today()),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError("");
        try {
          await api("/students/" + student.id + "/move-team", {
            method: "POST",
            body: json({ teamId, movedAt: date }),
          });
          await cache.invalidateQueries();
          onSaved();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      <p className="sheet-copy">
        {student.name} · 현재 {student.currentTeamName || "미배정"}
      </p>
      <div className="field">
        <label>새 소속 팀</label>
        <TeamPicker value={teamId} onChange={setTeamId} />
      </div>
      <div className="field">
        <label htmlFor="move-date">이동일</label>
        <input
          id="move-date"
          type="date"
          required
          max={today()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <p className="form-notice">
        이동 전 수업과 출석 이력은 그대로 보존됩니다.
      </p>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <Button
        className="full mt-5"
        disabled={pending || !teamId || teamId === student.currentTeamId}
      >
        {pending ? "이동 중…" : "팀 이동"}
      </Button>
    </form>
  );
}
