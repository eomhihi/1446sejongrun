"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Award, Compass, Sparkles } from "lucide-react";
import HeroMediaCard from "./HeroMediaCard";
import { EVENT_DATE, EVENT_LOCATION, EVENT_HOST, EVENT_ORGANIZER, MAIN_SLOGAN, formatEventDate } from "@/constants/event";

interface HeroProps {
  onOpenRegister: () => void;
  onOpenMedia?: () => void;
}

export default function Hero({ onOpenRegister, onOpenMedia }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[840px] lg:min-h-[920px] lg:h-screen lg:max-h-[1080px] flex flex-col justify-between pt-24 sm:pt-28 pb-0 overflow-hidden font-pretendard"
    >
      {/* 
        기존의 복잡한 한글 무늬('ㅅ','ㅔ','ㅈ','ㆍ','ㅡ','ㅣ')와 
        기하학적 도로망/원형 SVG 패턴은 모두 삭제하고 여백의 미를 극대화
      */}

      {/* 중앙 메인 콘텐츠 영역 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center my-auto">
        {/* 상단 소제목: '행사 소개' & 국가균형성장의 중심 카피 */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-5 break-keep">
          <div className="w-5 sm:w-8 h-[2px] bg-burnt-orange flex-shrink-0" />
          <span className="text-sm sm:text-base md:text-lg font-hunmin font-bold tracking-widest text-burnt-orange uppercase">
            행사 소개
          </span>
          <span className="text-xs sm:text-sm md:text-base font-pretendard text-ink-black/70 tracking-wider">
            <span className="mx-1.5 text-ink-black/30 font-light">|</span> {MAIN_SLOGAN}
          </span>
        </div>

        {/* 
          중앙 메인 타이틀 그리드:
          좌측: public/images/logo-1446.svg 공식 로고 파일 (모바일 max-w-[260px] ~ 데스크탑 max-w-[700px] 반응형)
          우측: 훈민정음체 핵심 슬로건 & 프리텐다드 서브 카피 대비 영역
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* 공식 1446 SVG 로고: 모바일에서는 overflow 방지(max-w-[260px]), 데스크탑에서는 웅장하게(max-w-[700px]) */}
          <div className="lg:col-span-7 flex items-center justify-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[260px] xs:max-w-[290px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[640px] xl:max-w-[700px] select-none mx-auto lg:mx-0"
            >
              <Image
                src="/images/logo-1446.svg"
                alt="1446 세종런 공식 로고 (Modern 144 in Ink Black and Calligraphic Brush 6 in Burnt Orange)"
                width={1100}
                height={480}
                priority
                className="w-full h-auto drop-shadow-sm pointer-events-none"
              />
            </motion.div>
          </div>

          {/* 
            타이포그래피 에디토리얼 카피 블록:
            - 훈민정음체 (font-hunmin): 핵심 슬로건 ("달린 만큼 골목이 켜진다")
            - 서브 카피 영역: "훈민정음 반포의 해, 골목의 불을 밝히는..." 영역에 훈민정음체와 프리텐다드의 우아한 대비
            - 프리텐다드 (font-pretendard): 세부 수치(14.46km / 10km / 5km), 버튼 텍스트
          */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="space-y-3"
            >
              {/* 상단 칩 배지: 국가균형성장의 중심 & 훈민정음 580돌 */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/25 text-burnt-orange text-xs font-hunmin font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{MAIN_SLOGAN}</span>
                </div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-ink-black/5 border border-ink-black/10 text-ink-black/75 text-xs font-pretendard font-semibold">
                  <span>
                    <strong className="font-hunmin font-normal text-burnt-orange">훈민정음</strong> 반포 580돌 기념
                  </span>
                </div>
              </div>

              {/* 핵심 슬로건: 훈민정음체(font-hunmin) */}
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-hunmin font-bold text-ink-black leading-[1.25] tracking-tight">
                달린 만큼 골목이 켜진다
              </h2>

              {/* 서브 카피: 훈민정음체 포인트 + 프리텐다드 본문 대비 */}
              <p className="text-sm sm:text-base font-pretendard text-ink-black/80 leading-relaxed tracking-[-0.01em]">
                <span className="font-hunmin text-base sm:text-lg text-ink-black font-semibold mr-1">
                  훈민정음 반포의 해(1446년)
                </span>
                를 기념하여, 골목의 불을 밝히는 상생의 발걸음. <span className="font-hunmin font-bold text-ink-black">국가균형성장의 중심 행정수도 세종</span>의 도심 랜드마크에서 소상공인 골목 상권까지 힘차게 달립니다.
              </p>
            </motion.div>

            {/* 코스 거리 태그 리스트: 외래어 순화 및 가독성을 위해 프리텐다드 적용 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-2 pt-1 font-pretendard"
            >
              <div className="px-3.5 py-1.5 rounded-lg bg-white border border-ink-black/15 shadow-sm flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-burnt-orange" />
                <span className="font-extrabold text-xs sm:text-sm text-ink-black font-mono">14.46km</span>
                <span className="text-[11px] text-ink-black/60 font-medium">상징 코스</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-lg bg-white/70 border border-ink-black/10 text-xs text-ink-black/80 flex items-center space-x-1.5">
                <span className="font-bold text-ink-black font-mono">10km</span>
                <span className="text-[11px] text-ink-black/50">도심 도전</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-lg bg-white/70 border border-ink-black/10 text-xs text-ink-black/80 flex items-center space-x-1.5">
                <span className="font-bold text-ink-black font-mono">5km</span>
                <span className="text-[11px] text-ink-black/50">가족 달리기</span>
              </div>
            </motion.div>

            {/* 간편 인포 배지 */}
            <div className="pt-1 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-pretendard text-ink-black/70">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-burnt-orange" />
                {EVENT_LOCATION} 출발
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-burnt-orange" />
                <span>
                  <span className="font-hunmin font-semibold text-ink-black">훈민정음</span>{" "}
                  <span className="font-mono font-bold text-ink-black">28</span>
                  <span className="font-pretendard font-semibold text-ink-black">자</span>
                </span>{" "}
                완주 메달 증정
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 다크 밴드 (#04151F Ink Black) & 경계선에 걸친 CTA 버튼 & 플로팅 카드 */}
      <div className="relative z-20 mt-12 sm:mt-16">
        {/* 경계선 정중앙 캡슐형 CTA 버튼 (데스크탑 이상) */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <motion.button
            onClick={onOpenRegister}
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 sm:px-12 py-3.5 sm:py-4 bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-full font-pretendard font-bold text-sm sm:text-base flex items-center space-x-3 shadow-xl transition-all duration-300 border border-wheat/40"
            style={{
              boxShadow: "0 10px 25px -4px rgba(196, 73, 0, 0.55), 0 0 15px rgba(196, 73, 0, 0.4)",
            }}
          >
            <span className="tracking-wide">참가신청 바로가기</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </motion.button>
        </div>

        {/* 우측 하단 대회 공식 미디어 플로팅 카드 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:absolute lg:-top-32 lg:right-8 z-30 flex justify-center lg:justify-end pt-12 lg:pt-0 pb-6 lg:pb-0">
            <HeroMediaCard onOpenMediaModal={onOpenMedia} />
          </div>
        </div>

        {/* 하단 20% 딥 잉크블랙 다크 밴드 */}
        <div className="bg-ink-black text-white pt-8 sm:pt-14 pb-8 sm:pb-12 border-t border-wheat/10 font-pretendard">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 데스크탑 뷰에서 우측 플로팅 비디오 카드를 위한 안전 지대 확보 (lg:pr-[470px] xl:pr-[490px]) */}
            <div className="pr-0 lg:pr-[470px] xl:pr-[490px]">
              {/* 정보 텍스트: 모바일(md 이하)에서는 세로 1열(flex-col gap-4)로 차곡차곡 정렬, 데스크탑에서는 가로 정렬 */}
              <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-start md:gap-x-10 lg:gap-x-12 xl:gap-x-14 md:gap-y-4 text-left">
                {/* 일시 */}
                <div className="space-y-1 pb-3 md:pb-0 border-b border-white/10 md:border-b-0">
                  <span className="text-[11px] text-wheat uppercase tracking-widest font-semibold block">
                    일시
                  </span>
                  <p className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                    {formatEventDate(EVENT_DATE)}
                  </p>
                </div>

                {/* 출발지 (장소) */}
                <div className="space-y-1 pb-3 md:pb-0 border-b border-white/10 md:border-b-0">
                  <span className="text-[11px] text-wheat uppercase tracking-widest font-semibold block">
                    출발지 (장소)
                  </span>
                  <p className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                    {EVENT_LOCATION}
                  </p>
                </div>

                {/* 모집 인원 */}
                <div className="space-y-1 pb-3 md:pb-0 border-b border-white/10 md:border-b-0">
                  <span className="text-[11px] text-wheat uppercase tracking-widest font-semibold block">
                    모집 인원
                  </span>
                  <p className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                    전 코스 선착순 5,000명
                  </p>
                </div>

                {/* 골목 상생 기금 */}
                <div className="space-y-1 pb-3 md:pb-0 border-b border-white/10 md:border-b-0">
                  <span className="text-[11px] text-wheat uppercase tracking-widest font-semibold block">
                    골목 상생 기금
                  </span>
                  <p className="text-sm sm:text-base font-bold text-burnt-orange font-mono whitespace-nowrap">
                    1km당 100원 골목 적립
                  </p>
                </div>

                {/* 참가 신청 버튼: 모바일(md: 이하)에서는 세로 1열 리스트 하단에 차곡차곡 배치 */}
                <div className="md:hidden pt-2">
                  <button
                    onClick={onOpenRegister}
                    className="w-full py-3.5 bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-xl font-pretendard font-bold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-[0.98]"
                  >
                    <span>참가신청 바로가기</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* 공식 주최 및 주관 명시 바 */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-start gap-x-4 gap-y-1 text-xs text-wheat/80 font-pretendard">
                <span>
                  <strong className="text-white">주최:</strong> {EVENT_HOST}
                </span>
                <span className="text-white/30 hidden sm:inline">|</span>
                <span>
                  <strong className="text-white">주관:</strong> {EVENT_ORGANIZER}
                </span>
                <span className="text-white/30 hidden sm:inline">|</span>
                <span className="text-[11px] text-white/50">
                  1446 세종 골목 상생 마라톤 공식 기획안 승인
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
