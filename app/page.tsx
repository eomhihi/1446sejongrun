"use client";

import React, { useState, useEffect } from "react";
import EmergencyPopupModal from "@/components/EmergencyPopupModal";
import RibbonShieldBadge from "@/components/RibbonShieldBadge";
import GNB from "@/components/GNB";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import AlleyPartners from "@/components/AlleyPartners";
import SponsorsSection from "@/components/SponsorsSection";
import MediaModal from "@/components/MediaModal";
import RegistrationModal from "@/components/RegistrationModal";
import Footer from "@/components/Footer";

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultTab, setRegisterDefaultTab] = useState<"register" | "lookup">("register");
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // 쿼리 파라미터 기반 모달 자동 열림 지원 (?modal=register, lookup, media)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modal = params.get("modal");
      if (modal === "register") {
        setRegisterDefaultTab("register");
        setIsRegisterOpen(true);
      } else if (modal === "lookup") {
        setRegisterDefaultTab("lookup");
        setIsRegisterOpen(true);
      } else if (modal === "media") {
        setIsMediaOpen(true);
      }
    }
  }, []);

  const handleOpenRegister = (tab?: "register" | "lookup") => {
    setRegisterDefaultTab(tab || "register");
    setIsRegisterOpen(true);
  };

  return (
    <main className="min-h-screen relative selection:bg-burnt-orange selection:text-white">
      {/* 
        원칙 1: 좌측 상단 최상단에서 내려오는 오각형 리본 배지(#C44900 배경, #EFD6AC 이중 보더)
        안에 러너 심볼과 '2026 1446 세종런' 타이포 배치
      */}
      <RibbonShieldBadge />

      {/* 
        한글런 벤치마킹 4대 대분류 & 호버 드롭다운 GNB
        [대회 안내] / [코스 안내] / [참가신청/확인] / [커뮤니티]
      */}
      <GNB
        onOpenRegister={handleOpenRegister}
        onOpenMedia={() => setIsMediaOpen(true)}
      />

      {/* 
        원칙 1, 3, 4: 히어로 섹션
        - 초대형 1446 로고 (144 모던 서체 + 6 역동적 붓터치 SVG 애니메이션)
        - 우측 카피: "달린 만큼 골목이 켜집니다"
        - 하단 #04151F 다크 밴드 & 경계선에 걸친 [참가신청 바로가기 ->] 캡슐 버튼
        - 우측 하단: 대회 공식 미디어 영상 카드
        - 좌우 여백 훈민정음 자모 워터마크
      */}
      <Hero
        onOpenRegister={() => handleOpenRegister("register")}
        onOpenMedia={() => setIsMediaOpen(true)}
      />

      {/* 
        원칙 1, 4, 5: 행사 소개 섹션
        - 한글런 벤치마킹 에디토리얼 레이아웃: "완주선에서 끝나지 않고 세종의 골목을 깨우는 대회"
        - 숫자 카운트업 마이크로 인터랙션 (14.46km, 300곳, 28자)
        - 좌측 훈민정음 자모 워터마크
      */}
      <AboutSection />

      {/* 
        원칙 5: 세종 소상공인 파트너 상권 300곳 필터링 그리드
        - 8대 생활권별 / 업종별 탭 필터
        - 할인 쿠폰 혜택 카드 그리드 (여민전 제휴, 러너 전용 혜택)
      */}
      <AlleyPartners />

      {/* 
        공식 후원사 및 상생 파트너 로고 쇼케이스 (관리자 실시간 제어)
      */}
      <SponsorsSection />

      {/* 공식 푸터 */}
      <Footer />

      {/* 참가신청 / 조회 대화상자 모달 */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        defaultTab={registerDefaultTab}
      />

      {/* 공식 미디어 및 영상 갤러리 모달 */}
      <MediaModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
      />
    </main>
  );
}

