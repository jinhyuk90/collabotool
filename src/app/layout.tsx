import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabSync | 차세대 올인원 협업 플랫폼 (Firebase App Hosting)",
  description: "Next.js 14 & Firebase App Hosting 기반의 고성능 실시간 팀 협업 도구 (대화, 작업, 위키, 캘린더, 드라이브)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
