"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Users,
  Layers,
  CalendarDays,
  ChevronDown,
  LogOut,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "./ui/dialog";
import { Button } from "./ui/button";
const nav = [
  { href: "/", label: "홈", icon: Home },
  { href: "/teams", label: "팀", icon: Layers },
  { href: "/students", label: "학생", icon: Users },
  { href: "/sessions", label: "수업", icon: CalendarDays },
];
export function BottomNavigation() {
  const path = usePathname();
  return (
    <nav className="bottom-nav" aria-label="주 메뉴">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          href={href}
          key={href}
          aria-current={
            (href === "/" ? path === href : path.startsWith(href))
              ? "page"
              : undefined
          }
        >
          <Icon size={21} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
export function MobileHeader({
  title,
  back = false,
}: {
  title: string;
  back?: boolean;
}) {
  return (
    <div className="mobile-page-header">
      {back && (
        <Link
          href="/sessions"
          className="icon-button"
          aria-label="수업 목록으로"
        >
          <ArrowLeft size={22} />
        </Link>
      )}
      <h1>{title}</h1>
    </div>
  );
}
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    router = useRouter(),
    cache = useQueryClient();
  const [ready, setReady] = useState(false),
    [profile, setProfile] = useState(false),
    [name, setName] = useState("선생님");
  useEffect(() => {
    if (!sessionStorage.getItem("roiet-token")) {
      router.replace("/login");
      return;
    }
    try {
      setName(
        JSON.parse(sessionStorage.getItem("roiet-user") || "{}").name ||
          "선생님",
      );
    } catch {}
    setReady(true);
  }, [router]);
  if (!ready) return <div className="auth-loading">로이엣을 열고 있어요…</div>;
  return (
    <>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">r.</span>
          <span>
            로이엣<small>교육센터 관리</small>
          </span>
        </Link>
        <p className="nav-label">워크스페이스</p>
        <nav aria-label="데스크톱 주 메뉴">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === "/" ? path === href : path.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              <Icon size={20} />
              {label === "홈" ? "대시보드" : label + " 관리"}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="small-dot" />
          함께 배우고, 함께 자라는 곳
          <p>
            오늘의 작은 기록이
            <br />
            내일의 성장을 만듭니다.
          </p>
        </div>
        <button
          className="profile desktop-profile"
          onClick={() => setProfile(true)}
        >
          <span className="avatar">{name.slice(0, 1)}</span>
          <span>
            {name}
            <small>교육센터</small>
          </span>
          <ChevronDown size={16} />
        </button>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <Link href="/" className="mobile-brand">
            <span className="brand-mark">r.</span>로이엣
          </Link>
          <span className="desktop-breadcrumb">
            교육센터 <span>/</span>{" "}
            {nav.find((x) => x.href !== "/" && path.startsWith(x.href))
              ?.label || "홈"}
          </span>
          <button
            className="profile"
            onClick={() => setProfile(true)}
            aria-label="프로필 및 로그아웃"
          >
            <span className="avatar">{name.slice(0, 1)}</span>
            <span className="profile-name">{name}</span>
            <ChevronDown size={16} />
          </button>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
      </div>
      <BottomNavigation />
      <BottomSheet open={profile} onOpenChange={setProfile} title="내 계정">
        <p className="sheet-copy">{name}님, 오늘도 수고 많으셨어요.</p>
        <Button
          variant="outline"
          className="full"
          onClick={() => {
            sessionStorage.clear();
            cache.clear();
            router.replace("/login");
          }}
        >
          <LogOut size={18} />
          로그아웃
        </Button>
      </BottomSheet>
    </>
  );
}
export function NewSessionButton({ teamId }: { teamId?: number }) {
  return (
    <Button asChild>
      <Link href={"/sessions/new" + (teamId ? "?teamId=" + teamId : "")}>
        <Plus size={18} />새 수업 기록
      </Link>
    </Button>
  );
}
