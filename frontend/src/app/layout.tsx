import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
export const metadata: Metadata = {
  title: { default: "로이엣 · 함께 자라는 하루", template: "%s · 로이엣" },
  description: "교육센터 팀, 학생, 수업과 출석을 한곳에서 관리합니다.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "로이엣" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f9f6",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
