"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  ChevronRight,
  Gift,
  Package,
  Sparkles,
  Shirt,
  Ticket,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import GNB from "@/components/GNB";
import RibbonShieldBadge from "@/components/RibbonShieldBadge";
import Footer from "@/components/Footer";
import MedalSection from "@/components/MedalSection";
import RegistrationModal from "@/components/RegistrationModal";
import MediaModal from "@/components/MediaModal";

export default function SouvenirPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultTab, setRegisterDefaultTab] = useState<"register" | "lookup">("register");
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const handleOpenRegister = (tab?: "register" | "lookup") => {
    setRegisterDefaultTab(tab || "register");
    setIsRegisterOpen(true);
  };

  const souvenirPackages = [
    {
      title: "훈민정음 28자 결합식 완주 메달",
      category: "완주자 전원",
      badge: "핵심 기념품",
      desc: "계절마다 자음과 모음을 모아 하나의 단어로 결합할 수 있는 자석식 특수 조립 메달 (봄 시즌 'ㅔ' 메달 지급).",
      icon: Award,
      highlight: true,
    },
    {
      title: "1446 세종런 공식 기능성 런닝 티셔츠",
      category: "전 참가자",
      badge: "사전 배송",
      desc: "흡습속건 고기능성 원단에 훈민정음 자모 타이포그래피 그래픽이 감각적으로 인쇄된 공식 기념 티셔츠.",
      icon: Shirt,
      highlight: false,
    },
    {
      title: "세종 골목 상생 바우처 (10,000원권)",
      category: "전 참가자",
      badge: "현장 즉시 사용",
      desc: "대회 당일 및 뒷풀이 주간 동안 세종시 300여 함께하는 상점에서 현금처럼 쓸 수 있는 상생 상품권.",
      icon: Ticket,
      highlight: true,
    },
    {
      title: "공식 배번호 및 기록측정용 스마트 칩",
      category: "14.46km / 10km",
      badge: "사전 배송",
      desc: "개인별 영구 고유번호가 부여된 배번호와 넷타임(Net-Time) 정밀 기록 계측용 일회용 RFID 칩.",
      icon: Package,
      highlight: false,
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
          <span>대회 안내</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-burnt-orange font-bold">기념품 및 완주 메달 안내</span>
        </nav>

        {/* 상단 타이틀 헤더 배너 */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-ink-black/15 p-6 sm:p-10 shadow-xl mb-12 relative overflow-hidden">
          {/* 배경 전각 워터마크 */}
          <div className="absolute -right-6 -bottom-8 pointer-events-none opacity-5 font-hunmin text-8xl select-none">
            賞品
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/30 text-burnt-orange text-xs font-bold font-hunmin mb-3">
            <span className="seal-stamp text-burnt-orange border-burnt-orange scale-90">기념품</span>
            <span>1446 SEJONG RUN OFFICIAL SOUVENIRS</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-hunmin font-bold text-ink-black leading-tight mb-3">
            기념품 및 완주 메달 안내
          </h1>
          <p className="text-sm sm:text-base text-ink-black/75 leading-relaxed max-w-3xl">
            1446 세종런은 참가자 여러분의 값진 땀방울을 기리기 위해 특수 제작된 자석 결합식 훈민정음 28자 완주 메달과
            세종 골목 상생 바우처(10,000원), 최고급 기능성 런닝 티셔츠를 풍성하게 준비했습니다.
          </p>

          {/* 배송 안내 알림 바 */}
          <div className="mt-6 p-4 rounded-2xl bg-wheat/20 border border-wheat/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-black/80">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-burnt-orange flex-shrink-0" />
              <span>
                <strong>기념품 배송:</strong> 티셔츠, 배번호 등은 대회 1주일 전 입력하신 주소지로 택배 일괄 무료 발송됩니다.
              </span>
            </div>
            <span className="text-burnt-orange font-bold font-mono">
              (완주 메달은 결승선 통과 시 현장 수여)
            </span>
          </div>
        </div>

        {/* 공식 패키지 4대 구성 그리드 */}
        <div className="mb-16">
          <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-6 flex items-center gap-2">
            <Gift className="w-5 h-5 text-burnt-orange" />
            <span>2027 공식 참가 패키지 안내</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {souvenirPackages.map((pkg, idx) => {
              const Icon = pkg.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-5 sm:p-6 border transition-all ${
                    pkg.highlight
                      ? "bg-white border-burnt-orange/30 shadow-md ring-1 ring-burnt-orange/15"
                      : "bg-white/70 border-ink-black/10 shadow-sm hover:border-ink-black/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          pkg.highlight
                            ? "bg-burnt-orange text-white"
                            : "bg-ink-black/5 text-ink-black"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-grey">
                          {pkg.category}
                        </span>
                        <h3 className="text-base font-hunmin font-bold text-ink-black">
                          {pkg.title}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pkg.highlight
                          ? "bg-burnt-orange/15 text-burnt-orange"
                          : "bg-ink-black/10 text-ink-black/70"
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-black/75 leading-relaxed pl-1">
                    {pkg.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 완주 메달 모음 섹션 (자석 결합 시뮬레이터 & 28자 아카이브) */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-ink-black/10 shadow-traditional p-4 sm:p-8">
          <MedalSection />
        </div>

        {/* 기념품 수령 및 유의사항 안내 박스 */}
        <div className="mt-12 bg-white/80 rounded-2xl border border-ink-black/15 p-6 sm:p-8 font-pretendard text-xs text-ink-black/80 space-y-3">
          <h4 className="text-sm font-hunmin font-bold text-ink-black flex items-center gap-1.5 text-burnt-orange">
            <AlertCircle className="w-4 h-4" />
            <span>기념품 수령 관련 필수 유의사항</span>
          </h4>
          <ul className="list-disc list-inside space-y-1.5 pl-1 leading-relaxed text-ink-black/75">
            <li>기념품(배번호, 안내책자, 티셔츠 등)은 신청 시 기재한 주소지로 행사 전 택배 발송되며, 반송되지 않도록 정확한 주소를 기재해 주시기 바랍니다.</li>
            <li>결제 완료 후에는 제작 발주가 즉시 진행되므로 티셔츠 사이즈 변경이 불가합니다.</li>
            <li>대회 완주 메달은 반환점 및 전자 칩 계측을 정상 통과하여 결승선(FINISH)에 도착한 참가자에게 현장에서만 수여됩니다.</li>
            <li>상생 바우처 10,000원권은 대회 당일 지급되며 분실 시 재발행되지 않습니다.</li>
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
