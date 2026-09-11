"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AttendanceEditor } from "@/components/attendance-editor";
import { LoadingSkeleton } from "@/components/domain";
function NewSession() {
  const search = useSearchParams();
  return <AttendanceEditor initialTeamId={Number(search.get("teamId")) || 0} />;
}
export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NewSession />
    </Suspense>
  );
}
