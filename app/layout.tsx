import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import HanjiBackground from "@/components/HanjiBackground";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "1446 세종런 | 2026 1446 SEJONG RUN 공식 마라톤",
  description:
    "훈민정음 반포의 해, 골목의 불을 밝히는 14.46km / 10km / 5km 마라톤 대회. 달린 만큼 골목이 켜집니다.",
  keywords: ["1446세종런", "세종마라톤", "1446마라톤", "훈민정음런", "세종골목상권"],
  openGraph: {
    title: "1446 세종런 (1446 SEJONG RUN)",
    description: "달린 만큼 골목이 켜집니다. 훈민정음 반포 580돌 기념 세종 골목 상생 마라톤",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  return (
    <html lang="ko">
      <head>
        {kakaoApiKey && (
          <Script
            src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false&libraries=services,clusterer`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="bg-hanji-bg text-ink-black min-h-screen selection:bg-burnt-orange selection:text-white relative font-pretendard">
        {/* 
          1, 2, 3: 리얼 한지 질감 노이즈 베이스 (SVG feTurbulence) + 
          훈민정음 텍스트 좌우 분할 먹물 워터마크 레이어 컴포넌트
        */}
        <HanjiBackground />
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
