import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "InClip - 긴 영상, 짧게 읽다",
  description: "YouTube 영상 링크를 붙여넣고, InClip이 핵심만 요약해드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
