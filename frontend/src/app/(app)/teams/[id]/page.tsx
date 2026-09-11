"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import type { TeamDetail } from "@/lib/types";
import { PageHeader, NewSessionButton } from "@/components/shell";
import {
  StudentListItem,
  SessionListItem,
  EmptyState,
  LoadingSkeleton,
  ErrorState,
} from "@/components/domain";
import { TeamForm, StudentForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/dialog";
import { useSessionUser } from "@/lib/auth";
export default function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = useSessionUser();
  const { id } = use(params),
    [edit, setEdit] = useState(false),
    [add, setAdd] = useState(false);
  const query = useQuery({
    queryKey: ["team", id],
    queryFn: () => api<TeamDetail>("/teams/" + id),
  });
  if (query.isPending) return <LoadingSkeleton />;
  if (query.error) return <ErrorState error={query.error} />;
  const { team, students, sessions, attendanceRate } = query.data;
  return (
    <>
      <Link href="/teams" className="back-link">
        <ArrowLeft size={15} />팀 목록
      </Link>
      <PageHeader
        title={team.name}
        description={
          "담당 " +
          (team.managerName || "미지정") +
          " · 학생 " +
          students.length +
          "명"
        }
        action={
          user.role === "ADMIN" ? (
            <Button variant="outline" onClick={() => setEdit(true)}>
              <Pencil size={15} />
              수정
            </Button>
          ) : undefined
        }
      />
      {team.description && <p className="memo mb-5">{team.description}</p>}
      <NewSessionButton teamId={team.id} />
      <div className="detail-columns">
        <div>
          <section className="detail-section">
            <div className="section-heading">
              <h2>팀 출석률</h2>
            </div>
            <div className="form-section">
              <div className="stat-hero">
                <span>전체 평균</span>
                <strong>
                  {attendanceRate}
                  <small>%</small>
                </strong>
              </div>
              <div className="progress">
                <span style={{ width: attendanceRate + "%" }} />
              </div>
            </div>
          </section>
          <section className="detail-section">
            <div className="section-heading">
              <h2>
                소속 학생 <span className="count">{students.length}</span>
              </h2>
              {user.role === "ADMIN" && (
                <Button variant="ghost" size="sm" onClick={() => setAdd(true)}>
                  <Plus size={15} />새 학생
                </Button>
              )}
            </div>
            <div className="panel">
              {students.length ? (
                students.map((s) => <StudentListItem student={s} key={s.id} />)
              ) : (
                <EmptyState
                  title="아직 소속 학생이 없어요"
                  description="새 학생을 등록하거나 학생 상세에서 팀을 이동해 주세요."
                />
              )}
            </div>
            <p className="form-notice">
              기존 학생은 학생 상세 → 팀 이동에서 배정할 수 있어요.
            </p>
          </section>
        </div>
        <section className="detail-section">
          <div className="section-heading">
            <h2>수업 기록</h2>
            <span className="subtle">총 {sessions.length}회</span>
          </div>
          <div className="panel">
            {sessions.length ? (
              sessions.map((s) => <SessionListItem key={s.id} session={s} />)
            ) : (
              <EmptyState />
            )}
          </div>
        </section>
      </div>
      <BottomSheet open={edit} onOpenChange={setEdit} title="팀 정보 수정">
        <TeamForm team={team} onSaved={() => setEdit(false)} />
      </BottomSheet>
      <BottomSheet open={add} onOpenChange={setAdd} title="새 학생 등록">
        <StudentForm defaultTeamId={team.id} onSaved={() => setAdd(false)} />
      </BottomSheet>
    </>
  );
}
