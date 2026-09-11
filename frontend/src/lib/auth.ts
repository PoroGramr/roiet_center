"use client";
import { useEffect, useState } from "react";

export type SessionUser = {
  id?: number;
  name?: string;
  role?: "ADMIN" | "TEACHER";
};

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser>({});
  useEffect(() => {
    try {
      setUser(JSON.parse(sessionStorage.getItem("roiet-user") || "{}"));
    } catch {
      setUser({});
    }
  }, []);
  return user;
}
