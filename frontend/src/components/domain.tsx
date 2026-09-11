"use client";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Users,
  CalendarDays,
  Inbox,
  AlertCircle,
} from "lucide-react";
import type { Student, Team, Session, Status } from "@/lib/types";
import { dateLabel } from "@/lib/utils";
import { Button } from "./ui/button";
import { BottomSheet } from "./ui/dialog";
export const statuses: { value: Status; label: string; short: string }[] = [
  { value: "PRESENT", label: "출석", short: "출석" },
  { value: "ABSENT", label: "결석", short: "결석" },
  { value: "LATE", label: "지각", short: "지각" },
  { value: "EARLY_LEAVE", label: "조퇴", short: "조퇴" },
  { value: "EXCUSED", label: "사유결석", short: "사유" },
];
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={"status-badge status-" + status}>
      {statuses.find((x) => x.value === status)?.label}
    </span>
  );
}
export function AttendanceSelector({
  value,
  onChange,
  name,
}: {
  value?: Status;
  onChange: (s: Status) => void;
  name: string;
}) {
  return (
    <div
      className="attendance-selector"
      role="group"
      aria-label={name + " 출석 상태"}
    >
      {statuses.map((s) => (
        <button
          type="button"
          key={s.value}
          aria-pressed={value === s.value}
          className={
            "attendance-option " +
            (value === s.value ? "selected status-" + s.value : "")
          }
          onClick={() => onChange(s.value)}
        >
          {value === s.value && <Check size={15} strokeWidth={3} />}
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
export function AttendanceSummary({
  checked,
  total,
}: {
  checked: number;
  total: number;
}) {
  return (
    <div className="attendance-summary">
      <span>
        <strong>{checked}</strong> / {total}명 체크 완료
      </span>
      <div
        className="progress"
        role="progressbar"
        aria-label="출석 체크 진행률"
        aria-valuenow={checked}
        aria-valuemax={total || 1}
        aria-valuemin={0}
      >
        <span style={{ width: `${total ? (checked / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
export function StudentListItem({ student }: { student: Student }) {
  return (
    <Link href={"/students/" + student.id} className="student-list-item">
      <span className="avatar student-avatar">{student.name.slice(0, 1)}</span>
      <span className="list-main">
        <strong>{student.name}</strong>
        <small>
          {student.currentTeamName || "미배정"} ·{" "}
          {student.status === "ACTIVE"
            ? "재원"
            : student.status === "COMPLETED"
              ? "수료"
              : "비활성"}
        </small>
        <span className="student-list-stats">
          출석률{" "}
          {student.attendanceRate == null ? "—" : student.attendanceRate + "%"}
          <span>
            최근 출석{" "}
            {student.latestAttendanceDate?.slice(5).replace("-", ".") || "—"}
          </span>
        </span>
      </span>
      <ChevronRight size={18} className="muted" />
    </Link>
  );
}
export function TeamListItem({ team }: { team: Team }) {
  return (
    <Link href={"/teams/" + team.id} className="team-list-item">
      <span className="team-symbol">{team.name.slice(0, 1)}</span>
      <div className="list-main">
        <strong>{team.name}</strong>
        <small>담당 {team.managerName || "미지정"}</small>
        <span className="team-meta">
          <Users size={14} />
          {team.currentStudentCount}명 <span>·</span> 최근 수업{" "}
          {team.recentSessionDate?.slice(5).replace("-", ".") || "없음"}
        </span>
        <span className="team-rate">
          최근 출석률{" "}
          <strong>
            {team.recentAttendanceRate == null
              ? "—"
              : team.recentAttendanceRate + "%"}
          </strong>
        </span>
      </div>
      <ChevronRight size={18} className="muted" />
    </Link>
  );
}
export function SessionListItem({ session }: { session: Session }) {
  return (
    <Link href={"/sessions/" + session.id} className="session-list-item">
      <div className="date-tile">
        <small>{session.sessionDate.slice(5, 7)}월</small>
        <strong>{Number(session.sessionDate.slice(8, 10))}</strong>
      </div>
      <div className="list-main">
        <small>{session.teamName}</small>
        <strong>{session.title || session.content}</strong>
        <span className="subtle">
          출석 {session.attended} / {session.total}명
        </span>
      </div>
      <ChevronRight size={18} className="muted" />
    </Link>
  );
}
export function EmptyState({
  title = "아직 기록이 없어요",
  description = "첫 기록을 남겨보세요.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Inbox size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function LoadingSkeleton() {
  return (
    <div aria-label="불러오는 중" aria-busy="true" className="skeleton-group">
      {[1, 2, 3].map((x) => (
        <div className="skeleton" key={x} />
      ))}
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={20} />
      <p>{error.message}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
export function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky-action-bar">
      <div>{children}</div>
    </div>
  );
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <p className="sheet-copy">{description}</p>
      <div className="button-row">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          취소
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          확인
        </Button>
      </div>
    </BottomSheet>
  );
}
