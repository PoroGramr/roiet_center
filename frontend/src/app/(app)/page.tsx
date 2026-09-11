"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  CalendarDays,
  Users,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Dashboard, Session } from "@/lib/types";
import { dateLabel, timeLabel, today } from "@/lib/utils";
import { NewSessionButton } from "@/components/shell";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  SessionListItem,
} from "@/components/domain";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/lib/auth";
export default function DashboardPage() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Dashboard>("/dashboard"),
  });
  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api<Session[]>("/sessions"),
  });
  const d = query.data;
  const user = useSessionUser();
  return (
    <>
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow">{dateLabel(d?.date || today())}</p>
          <h1>
            안녕하세요, {user.name || "선생님"}님
            <span className="greeting-dot">.</span>
          </h1>
          <p>함께 자라는 하루, 오늘의 배움을 기록해요.</p>
        </div>
        <div className="desktop-only">
          <NewSessionButton />
        </div>
      </header>
      {query.isPending ? (
        <LoadingSkeleton />
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : (
        d && (
          <>
            <div className="dashboard-grid">
              <section className="today-section">
                <div className="section-heading">
                  <h2>
                    오늘의 수업 <span className="count">{d.today.length}</span>
                  </h2>
                  <Link className="text-link" href="/sessions">
                    전체 보기 <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="today-grid">
                  {d.today.length ? (
                    d.today.map((s, i) => (
                      <article className="today-card" key={s.sessionId}>
                        <div className="section-heading">
                          <span className="team-tag">{s.teamName}</span>
                          <span className="subtle">
                            <Clock size={14} />
                            {timeLabel(s.startTime)}
                          </span>
                        </div>
                        <h3>{s.teamName} 수업</h3>
                        <p>
                          <Users size={16} />
                          학생 {s.total}명 <span>·</span> 출석 {s.attended}명
                        </p>
                        <Button
                          asChild
                          variant={i === 0 ? "default" : "outline"}
                          className="full"
                        >
                          <Link href={"/sessions/" + s.sessionId}>
                            <Check size={17} />
                            출석 확인 · 수정
                            <ArrowRight size={16} />
                          </Link>
                        </Button>
                      </article>
                    ))
                  ) : (
                    <div className="today-empty">
                      <span className="round-icon">
                        <CalendarDays size={24} />
                      </span>
                      <h3>오늘의 첫 수업을 기록해 볼까요?</h3>
                      <p>수업 내용과 출석을 한 번에 저장할 수 있어요.</p>
                      <NewSessionButton />
                    </div>
                  )}
                </div>
              </section>
              <section className="weekly-section">
                <div className="section-heading">
                  <h2>이번 주 한눈에</h2>
                  <span className="subtle">월 – 일</span>
                </div>
                <div className="weekly-panel">
                  <div className="weekly-numbers">
                    <div>
                      <p>평균 출석률</p>
                      <strong>
                        {d.weeklyAttendanceRate}
                        <small>%</small>
                      </strong>
                    </div>
                    <div>
                      <p>진행한 수업</p>
                      <strong>
                        {d.weeklySessionCount}
                        <small>회</small>
                      </strong>
                    </div>
                  </div>
                  <div className="weekly-team-rates">
                    {d.teamRates.map((t) => (
                      <div key={t.teamId}>
                        <Link href={"/teams/" + t.teamId}>{t.teamName}</Link>
                        <div className="progress">
                          <span style={{ width: t.attendanceRate + "%" }} />
                        </div>
                        <span>{t.attendanceRate}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="policy-note">
                    출석률에 지각·조퇴가 포함됩니다.
                  </p>
                </div>
              </section>
            </div>
            <div className="dashboard-bottom">
              <section>
                <div className="section-heading">
                  <h2>
                    조금 더 살펴봐 주세요{" "}
                    <span className="count warm">{d.alerts.length}</span>
                  </h2>
                  <span className="subtle">확인 필요 학생</span>
                </div>
                <div className="panel alert-list">
                  {d.alerts.length ? (
                    d.alerts.map((a) => (
                      <Link
                        key={a.studentId}
                        href={"/students/" + a.studentId}
                        className="alert-row"
                      >
                        <span className="avatar warm-avatar">
                          {a.studentName.slice(0, 1)}
                        </span>
                        <span className="list-main">
                          <strong>
                            {a.studentName}
                            <small className="inline-team">{a.teamName}</small>
                          </strong>
                          <small>{a.reason}</small>
                        </span>
                        <ArrowUpRight size={18} />
                      </Link>
                    ))
                  ) : (
                    <EmptyState
                      title="모두 잘 참여하고 있어요"
                      description="확인이 필요한 학생이 생기면 알려드릴게요."
                    />
                  )}
                </div>
              </section>
              <section>
                <div className="section-heading">
                  <h2>최근 수업 기록</h2>
                  <Link href="/sessions" className="text-link">
                    전체 보기 <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="panel">
                  {sessions.data?.length ? (
                    sessions.data
                      .slice(0, 4)
                      .map((s) => <SessionListItem key={s.id} session={s} />)
                  ) : (
                    <EmptyState title="수업 기록을 기다리고 있어요" />
                  )}
                </div>
              </section>
            </div>
            <div className="mobile-create">
              <NewSessionButton />
            </div>
          </>
        )
      )}
      <footer className="page-footer">
        작은 기록이 모여, 함께하는 성장이 됩니다.
      </footer>
    </>
  );
}
