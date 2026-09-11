"use client";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SessionDetail } from "@/lib/types";
import { AttendanceEditor } from "@/components/attendance-editor";
import { LoadingSkeleton, ErrorState } from "@/components/domain";
export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const query = useQuery({
    queryKey: ["session", id],
    queryFn: () => api<SessionDetail>("/sessions/" + id),
  });
  return query.isPending ? (
    <LoadingSkeleton />
  ) : query.error ? (
    <ErrorState error={query.error} />
  ) : (
    <AttendanceEditor key={id} session={query.data} />
  );
}
