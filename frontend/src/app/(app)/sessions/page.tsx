"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Session } from "@/lib/types";
import { PageHeader, NewSessionButton } from "@/components/shell";
import {
  SessionListItem,
  EmptyState,
  LoadingSkeleton,
  ErrorState,
} from "@/components/domain";
import { TeamPicker } from "@/components/forms";
export default function Sessions() {
  const [team, setTeam] = useState(0);
  const query = useQuery({
    queryKey: ["sessions", team],
    queryFn: () =>
      api<Session[]>("/sessions" + (team ? "?teamId=" + team : "")),
  });
  return (
    <>
      <PageHeader
        title="수업 관리"
        description="함께한 수업과 출석을 기록해요."
        action={<NewSessionButton />}
      />
      <div className="mb-5">
        <TeamPicker value={team} onChange={setTeam} allowAll />
      </div>
      {query.isPending ? (
        <LoadingSkeleton />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : query.data.length ? (
        <div className="panel">
          {query.data.map((s) => (
            <SessionListItem key={s.id} session={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="아직 수업 기록이 없어요"
          description="새 수업에서 수업 내용과 출석을 함께 기록해 주세요."
          action={<NewSessionButton teamId={team || undefined} />}
        />
      )}
    </>
  );
}
