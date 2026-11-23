"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import {
  Compass,
  ChevronRight,
  ShieldCheck,
  Clock,
  MapPin,
  Flag,
  Droplets,
  HeartHandshake,
  AlertTriangle,
  Info,
} from "lucide-react";
import GNB from "@/components/GNB";
import RibbonShieldBadge from "@/components/RibbonShieldBadge";
import Footer from "@/components/Footer";
import CourseSection from "@/components/CourseSection";
import RegistrationModal from "@/components/RegistrationModal";
import MediaModal from "@/components/MediaModal";

function CoursePageContent() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultTab, setRegisterDefaultTab] = useState<"register" | "lookup">("register");
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const handleOpenRegister = (tab?: "register" | "lookup") => {
    setRegisterDefaultTab(tab || "register");
    setIsRegisterOpen(true);
  };

  const courseGuides = [
    {
      title: "14.46km 상징 훈민정음 달리기",
      badge: "대표 코스",
      limit: "제한시간 2시간 20분",
      desc: "세종시청 광장을 출발하여 금강 남측 자전거길을 서진, 이응다리를 건너 국립어린이박물관과 세종호수공원 남측을 순환한 뒤 햇무리교를 거쳐 복귀하는 세종의 상징 코스입니다.",
      color: "border-burnt-orange",
      textColor: "text-burnt-orange",
    },
    {
      title: "10km 골목 활력 도전",
      badge: "도심 도전",
      limit: "제한시간 1시간 40분",
      desc: "시청 광장 출발 후 금강 남측 자전거길을 서진하여 학나래교 방면 서측 반환점을 찍고, 이응다리 남단과 북단을 왕복 횡단하여 세종 도심의 활기를 체감하는 도전 코스입니다.",
      color: "border-wheat",
      textColor: "text-amber-800",
    },
    {
      title: "5km 해례본 가족 걷기·달리기",
      badge: "가족 힐링",
      limit: "제한시간 1시간 10분",
      desc: "세종의 랜드마크인 이응다리 원형 보행 데크를 온 가족이 함께 반시계 방향으로 일주하는 무장애 안전 코스로, 유모차와 휠체어 동반이 모두 가능합니다.",
      color: "border-emerald-500",
      textColor: "text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen relative font-pretendard">
      {/* 최상단 리본 배지 */}
      <RibbonShieldBadge />

      {/* 상단 GNB */}
      <GNB
        onOpenRegister={handleOpenRegister}
        onOpenMedia={() => setIsMediaOpen(true)}
      />

      <main className="pt-28 sm:pt-36 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 브레드크럼 */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-ink-black/60">
          <Link href="/" className="hover:text-burnt-orange transition-colors">
            홈
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>코스 안내</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-burnt-orange font-bold">공식 마라톤 코스 상세 안내</span>
        </nav>

        {/* 상단 타이틀 헤더 배너 */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-ink-black/15 p-6 sm:p-10 shadow-xl mb-10 relative overflow-hidden">
          {/* 배경 전각 워터마크 */}
          <div className="absolute -right-6 -bottom-8 pointer-events-none opacity-5 font-hunmin text-8xl select-none">
            走路
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/30 text-burnt-orange text-xs font-bold font-hunmin mb-3">
            <span className="seal-stamp text-burnt-orange border-burnt-orange scale-90">코스</span>
            <span>1446 SEJONG RUN OFFICIAL COURSE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-hunmin font-bold text-ink-black leading-tight mb-3">
            공식 마라톤 코스 안내
          </h1>
          <p className="text-sm sm:text-base text-ink-black/75 leading-relaxed max-w-3xl">
            금강의 푸른 물결과 대한민국 랜드마크 이응다리(금강보행교), 세종호수공원, 국립박물관단지를 잇는
            세종만의 친환경 무장애 도심 순환 명품 코스를 소개합니다.
          </p>

          {/* 3대 코스 간편 개요 카드 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-ink-black/10">
            {courseGuides.map((guide, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl bg-white border ${guide.color} shadow-xs space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-ink-black/5 ${guide.textColor}`}>
                    {guide.badge}
                  </span>
                  <span className="text-[11px] text-ink-black/60 font-mono font-medium">
                    {guide.limit}
                  </span>
                </div>
                <h3 className="text-sm font-hunmin font-bold text-ink-black">
                  {guide.title}
                </h3>
                <p className="text-xs text-ink-black/70 leading-relaxed">
                  {guide.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 공식 코스 맵 및 상세 정보 인터랙티브 섹션 */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-ink-black/10 shadow-traditional overflow-hidden">
          <Suspense
            fallback={
              <div className="p-16 text-center text-xs font-hunmin text-ink-black/60">
                코스 지도를 불러오는 중입니다...
              </div>
            }
          >
            <CourseSection />
          </Suspense>
        </div>

        {/* 코스 안전 및 주자 안내 수칙 */}
        <div className="mt-12 bg-white/80 rounded-2xl border border-ink-black/15 p-6 sm:p-8 font-pretendard text-xs text-ink-black/80 space-y-3">
          <h4 className="text-sm font-hunmin font-bold text-ink-black flex items-center gap-1.5 text-burnt-orange">
            <ShieldCheck className="w-4 h-4" />
            <span>코스 이용 및 레이스 안전 수칙</span>
          </h4>
          <ul className="list-disc list-inside space-y-1.5 pl-1 leading-relaxed text-ink-black/75">
            <li>모든 참가자는 코스별 엄격한 제한시간(14.46km: 2시간 20분 / 10km: 1시간 40분 / 5km: 1시간 10분)을 준수해야 하며, 제한시간 초과 시 회송 차량에 탑승해야 합니다.</li>
            <li>코스 곳곳에 급수대(물, 이온음료, 스펀지)와 응급 구급차가 배치되어 있으며, 몸에 이상을 느낄 경우 즉시 레이스를 중단하고 안전요원에게 알려야 합니다.</li>
            <li>이응다리(보행교) 구간 진입 시 보행자 안전과 병목 방지를 위해 주로의 우측통행 질서를 철저히 유지해 주시기 바랍니다.</li>
            <li>유모차 및 휠체어 동반 참가자는 5km 해례본 가족 걷기 코스에 한해 참여 가능하며 후미 그룹에서 안전하게 출발합니다.</li>
          </ul>
        </div>
      </main>

      {/* 푸터 */}
      <Footer />

      {/* 모달 */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        defaultTab={registerDefaultTab}
      />
      <MediaModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
      />
    </div>
  );
}

export default function CoursePage() {
  return <CoursePageContent />;
}
