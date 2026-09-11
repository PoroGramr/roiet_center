"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, json } from "@/lib/api";
import { Button } from "@/components/ui/button";
const schema = z.object({
  email: z.email("올바른 이메일을 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});
export default function Login() {
  const router = useRouter(),
    [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <main className="login-page">
      <div className="login-box">
        <span className="brand-mark">r.</span>
        <h1>다시 만나 반가워요</h1>
        <p>로이엣에서 오늘의 배움을 함께 기록해요.</p>
        <form
          onSubmit={handleSubmit(async (values) => {
            setError("");
            try {
              const result = await api<{
                accessToken: string;
                user: { name: string; role: string };
              }>("/auth/login", { method: "POST", body: json(values) });
              sessionStorage.setItem("roiet-token", result.accessToken);
              sessionStorage.setItem("roiet-user", json(result.user));
              router.replace("/");
            } catch (e) {
              setError((e as Error).message);
            }
          })}
        >
          <div className="field">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="name@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="field-error">{errors.email.message}</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              {...register("password")}
            />
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <Button className="full" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중…" : "로그인"}
          </Button>
        </form>
        <div className="login-footer">로이엣 교육센터 · 내부 운영 서비스</div>
      </div>
    </main>
  );
}
