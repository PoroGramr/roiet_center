"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Phone, Pencil, ArrowRightLeft } from "lucide-react";
import { api } from "@/lib/api";
import { dateLabel } from "@/lib/utils";
import type { StudentDetail } from "@/lib/types";
import {
  LoadingSkeleton,
  ErrorState,
  EmptyState,
  StatusBadge,
} from "@/components/domain";
import { StudentForm, MoveTeamForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/dialog";
import { useSessionUser } from "@/lib/auth";
export default function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = useSessionUser();
  const { id } = use(params),
    [edit, setEdit] = useState(false),
    [move, setMove] = useState(false);
  const query = useQuery({
    queryKey: ["student", id],
    queryFn: () => api<StudentDetail>("/students/" + id),
  });
  if (query.isPending) return <LoadingSkeleton />;
  if (query.error) return <ErrorState error={query.error} />;
  const {
    student: s,
    statistics: stats,
    teamHistory,
    recentAttendance,
  } = query.data;
  return (
    <>
      <Link className="back-link" href="/students">
        <ArrowLeft size={15} />
        학생 목록
      </Link>
      <div className="detail-top">
        <span className="avatar">{s.name.slice(0, 1)}</span>
        <div className="min-w-0">
          <h1>{s.name}</h1>
          <p>
            {s.currentTeamName || "미배정"} ·{" "}
            {s.status === "ACTIVE"
              ? "재원"
              : s.status === "COMPLETED"
                ? "수료"
                : "비활성"}
          </p>
        </div>
      </div>
      {s.phone && (
        <a className="phone-link" href={"tel:" + s.phone}>
          <Phone size={16} />
          {s.phone}
        </a>
      )}
      {user.role === "ADMIN" && (
        <div className="button-row detail-actions">
          <Button variant="outline" onClick={() => setEdit(true)}>
            <Pencil size={16} />
            정보 수정
          </Button>
          <Button variant="outline" onClick={() => setMove(true)}>
            <ArrowRightLeft size={16} />팀 이동
          </Button>
        </div>
      )}
      <div className="detail-columns">
        <div>
          <section className="detail-section">
            <div className="section-heading">
              <h2>출석 현황</h2>
              <span className="subtle">전체 {stats.total}회 수업</span>
            </div>
            <div className="form-section">
              <div className="stat-hero">
                <span>전체 출석률</span>
                <strong>
                  {stats.attendanceRate}
                  <small>%</small>
                </strong>
              </div>
              <div className="progress">
                <span style={{ width: stats.attendanceRate + "%" }} />
              </div>
              <p className="policy-note">
                출석률에는 지각과 조퇴가 포함됩니다.
              </p>
              <div className="stat-counts">
                {[
                  ["출석", stats.present],
                  ["결석", stats.absent],
                  ["지각", stats.late],
                  ["조퇴", stats.earlyLeave],
                  ["사유결석", stats.excused],
                ].map(([label, count]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="detail-section">
            <div className="section-heading">
              <h2>팀 소속 이력</h2>
            </div>
            <div className="panel">
              {teamHistory.length ? (
                teamHistory.map((t) => (
                  <div className="history-row" key={t.teamId + t.startedAt}>
                    <Link href={"/teams/" + t.teamId}>
                      {t.teamName}
                      <small>
                        {t.startedAt} ~ {t.endedAt || "현재"}
                      </small>
                    </Link>
                    {!t.endedAt && <span className="team-tag">현재 소속</span>}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="아직 소속 팀이 없어요"
                  description="팀 이동에서 팀을 배정할 수 있어요."
                />
              )}
            </div>
          </section>
          <section className="detail-section">
            <div className="section-heading">
              <h2>메모</h2>
            </div>
            <p className="memo">{s.memo || "등록된 메모가 없습니다."}</p>
          </section>
        </div>
        <section className="detail-section">
          <div className="section-heading">
            <h2>최근 수업 참여 내역</h2>
            <span className="subtle">최근 12회</span>
          </div>
          <div className="panel">
            {recentAttendance.length ? (
              recentAttendance.map((a) => (
                <Link
                  href={"/sessions/" + a.sessionId}
                  className="history-row"
                  key={a.sessionId}
                >
                  <span>
                    {dateLabel(a.sessionDate)}
                    <small>{a.teamName}</small>
                  </span>
                  <StatusBadge status={a.status} />
                </Link>
              ))
            ) : (
              <EmptyState title="아직 출석 기록이 없어요" />
            )}
          </div>
        </section>
      </div>
      <BottomSheet open={edit} onOpenChange={setEdit} title="학생 정보 수정">
        <StudentForm student={s} onSaved={() => setEdit(false)} />
      </BottomSheet>
      <BottomSheet open={move} onOpenChange={setMove} title="팀 이동">
        <MoveTeamForm student={s} onSaved={() => setMove(false)} />
      </BottomSheet>
    </>
  );
}
