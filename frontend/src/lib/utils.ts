import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function dateLabel(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
export function timeLabel(time?: string | null) {
  if (!time) return "시간 미정";
  const [hour, minute] = time.split(":").map(Number);
  return `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}:${String(minute).padStart(2, "0")}`;
}
