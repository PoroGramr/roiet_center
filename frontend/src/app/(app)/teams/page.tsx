"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { Team } from "@/lib/types";
import { PageHeader } from "@/components/shell";
import {
  TeamListItem,
  EmptyState,
  LoadingSkeleton,
  ErrorState,
} from "@/components/domain";
import { TeamForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/dialog";
import { useSessionUser } from "@/lib/auth";
export default function Teams() {
  const user = useSessionUser();
  const [create, setCreate] = useState(false),
    router = useRouter();
  const query = useQuery({
    queryKey: ["teams"],
    queryFn: () => api<Team[]>("/teams"),
  });
  return (
    <>
      <PageHeader
        title="팀 관리"
        description="함께 배우는 팀의 이야기를 살펴보세요."
        action={
          user.role === "ADMIN" ? (
            <Button onClick={() => setCreate(true)}>
              <Plus size={17} />팀 만들기
            </Button>
          ) : undefined
        }
      />
      {query.isPending ? (
        <LoadingSkeleton />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : query.data.length ? (
        <div className="team-grid">
          {query.data.map((t) => (
            <TeamListItem key={t.id} team={t} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="함께할 첫 팀을 만들어 보세요"
          description="팀을 만들고 학생을 배정하면 수업을 기록할 수 있어요."
        />
      )}
      <BottomSheet open={create} onOpenChange={setCreate} title="새 팀 만들기">
        <TeamForm
          onSaved={(id) => {
            setCreate(false);
            router.push("/teams/" + id);
          }}
        />
      </BottomSheet>
    </>
  );
}
