"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";
import { PageHeader } from "@/components/shell";
import {
  StudentListItem,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "@/components/domain";
import { TeamPicker, StudentForm } from "@/components/forms";
import { BottomSheet } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/lib/auth";
export default function Students() {
  const user = useSessionUser();
  const [q, setQ] = useState(""),
    [search, setSearch] = useState(""),
    [team, setTeam] = useState(0),
    [status, setStatus] = useState(""),
    [create, setCreate] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q), 250);
    return () => clearTimeout(timer);
  }, [q]);
  const query = useQuery({
    queryKey: ["students", search, team, status],
    queryFn: () =>
      api<Student[]>(
        "/students?" +
          new URLSearchParams({
            ...(search ? { q: search } : {}),
            ...(team ? { teamId: String(team) } : {}),
            ...(status ? { status } : {}),
          }),
      ),
  });
  return (
    <>
      <PageHeader
        title="학생 관리"
        description="한 사람 한 사람의 배움을 함께 살펴요."
        action={
          user.role === "ADMIN" ? (
            <Button onClick={() => setCreate(true)}>
              <Plus size={17} />
              학생 등록
            </Button>
          ) : undefined
        }
      />
      <div className="search-controls">
        <div className="search-input">
          <Search size={19} />
          <input
            aria-label="학생 이름 검색"
            type="search"
            placeholder="학생 이름 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="filters">
          <TeamPicker allowAll value={team} onChange={setTeam} />
          <select
            className="filter-button w-auto max-w-40 text-base"
            aria-label="재원 상태 필터"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">재원</option>
            <option value="INACTIVE">비활성</option>
            <option value="COMPLETED">수료</option>
          </select>
        </div>
      </div>
      {query.isPending ? (
        <LoadingSkeleton />
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : (
        <>
          <p className="results-count">학생 {query.data.length}명</p>
          {!query.data.length ? (
            <EmptyState
              title="해당하는 학생이 없어요"
              description="검색어나 필터를 바꿔 보세요."
            />
          ) : (
            <div className="panel">
              <div className="mobile-student-list">
                {query.data.map((s) => (
                  <StudentListItem key={s.id} student={s} />
                ))}
              </div>
              <table className="desktop-student-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>소속 팀</th>
                    <th>연락처</th>
                    <th>상태</th>
                    <th>
                      <span className="sr-only">상세</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link href={"/students/" + s.id}>{s.name}</Link>
                      </td>
                      <td>{s.currentTeamName || "미배정"}</td>
                      <td>{s.phone || "—"}</td>
                      <td>
                        {s.status === "ACTIVE"
                          ? "재원"
                          : s.status === "COMPLETED"
                            ? "수료"
                            : "비활성"}
                      </td>
                      <td>
                        <Link href={"/students/" + s.id}>학생 보기 →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <BottomSheet open={create} onOpenChange={setCreate} title="새 학생 등록">
        <StudentForm
          onSaved={(id) => {
            setCreate(false);
            router.push("/students/" + id);
          }}
        />
      </BottomSheet>
    </>
  );
}
