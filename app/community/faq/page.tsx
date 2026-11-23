import React from "react";
import Link from "next/link";
import { ChevronRight, HelpCircle, Sparkles } from "lucide-react";
import GNB from "@/components/GNB";
import RibbonShieldBadge from "@/components/RibbonShieldBadge";
import Footer from "@/components/Footer";
import FaqAccordionClient, { FaqItem } from "@/components/FaqAccordionClient";
import { getFaqs } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "자주 묻는 질문 (FAQ) | 2027 1446 세종런",
  description:
    "2027 제1회 1446 세종 골목 상생 마라톤 참가 접수, 기념품 배송, 코스 통제, 취소 및 환불 등 자주 묻는 질문 안내",
};

/**
 * ==============================================================================
 * [FAQ 전용 페이지: Server Component]
 * /community/faq
 * ==============================================================================
 * - 관리자 대시보드 CRUD 연동을 위해 Vercel Postgres DB(getFaqs)를 서버 사이드에서 실시간 조회
 * - 클라이언트 인터랙션(아코디언 애니메이션, 실시간 검색, 카테고리 필터)은 FaqAccordionClient로 위임
 * ==============================================================================
 */
export default async function FaqPage() {
  const rawFaqs = await getFaqs();

  const faqs: FaqItem[] = (rawFaqs || []).map((f: any) => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sortOrder ?? 0,
  }));

  return (
    <div className="min-h-screen relative font-pretendard">
      {/* 최상단 리본 배지 */}
      <RibbonShieldBadge />

      {/* 상단 GNB */}
      <GNB />

      <main className="pt-28 sm:pt-36 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 브레드크럼 */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-ink-black/60">
          <Link href="/" className="hover:text-burnt-orange transition-colors">
            홈
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>커뮤니티</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-burnt-orange font-bold">자주 묻는 질문(FAQ)</span>
        </nav>

        {/* 상단 타이틀 헤더 배너 */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-ink-black/15 p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
          {/* 배경 전각 워터마크 */}
          <div className="absolute -right-6 -bottom-8 pointer-events-none opacity-5 font-hunmin text-8xl select-none">
            問答
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/30 text-burnt-orange text-xs font-bold font-hunmin mb-3">
            <span className="seal-stamp text-burnt-orange border-burnt-orange scale-90">안내</span>
            <span>1446 SEJONG RUN FAQ</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-hunmin font-bold text-ink-black leading-tight mb-3">
            자주 묻는 질문 (FAQ)
          </h1>
          <p className="text-sm sm:text-base text-ink-black/75 leading-relaxed max-w-2xl">
            참가자 기념품 수령, 보험 가입 및 보상 범위, 우천 시 진행 여부, 신청 확인/수정 및 환불 등 가장 많이 문의하시는 질문과 답변을 모았습니다.
          </p>
        </div>

        {/* DB에서 조회한 데이터를 아코디언 UI 클라이언트 컴포넌트로 전달 */}
        <FaqAccordionClient initialFaqs={faqs} />
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
