import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import HanjiBackground from "@/components/HanjiBackground";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://1446sejongrun.vercel.app"),
  title: "1446 세종런 2027",
  description:
    "달린 만큼 골목이 켜진다. 5,000명이 함께하는 행정수도 세종 골목 상생 마라톤!",
  keywords: [
    "1446세종런",
    "세종마라톤",
    "1446마라톤",
    "훈민정음런",
    "세종골목상권",
    "이응다리마라톤",
    "세종축제",
  ],
  openGraph: {
    title: "1446 세종런 2027",
    description:
      "달린 만큼 골목이 켜진다. 5,000명이 함께하는 행정수도 세종 골목 상생 마라톤!",
    url: "https://1446sejongrun.vercel.app",
    siteName: "1446 세종런 2027",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "1446 세종런 2027 공식 마라톤 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "1446 세종런 2027",
    description:
      "달린 만큼 골목이 켜진다. 5,000명이 함께하는 행정수도 세종 골목 상생 마라톤!",
    images: ["/og-image.jpg"],
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
