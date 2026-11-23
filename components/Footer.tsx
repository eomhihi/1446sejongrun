"use client";

import React from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { EVENT_HOST, EVENT_ORGANIZER } from "@/constants/event";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-ink-black text-white relative pt-16 pb-12 border-t border-wheat/20 overflow-hidden font-pretendard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* 브랜드 로고 & 슬로건: 다크 모드용 반전 로고 적용 ('144' Wheat #EFD6AC + '6' Burnt Orange) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-36">
                <Image
                  src="/images/logo-1446-light.svg"
                  alt="1446 세종런 로고"
                  width={140}
                  height={60}
                  className="w-full h-auto drop-shadow-sm"
                />
              </div>
              <span className="seal-stamp text-burnt-orange border-burnt-orange font-hunmin">
                공식인증
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm font-pretendard">
              훈민정음 반포 580돌 기념 골목 상생 마라톤. 러너의 걸음마다 세종 골목 상권의 불을 밝힙니다.
            </p>
            <div className="text-xs text-wheat/80 font-pretendard">
              주최: {EVENT_HOST} | 주관: {EVENT_ORGANIZER}
            </div>
          </div>

          {/* 주요 링크: 외래어 순화 및 km 단위 적용 */}
          <div className="md:col-span-2 space-y-3 font-pretendard">
            <h4 className="text-xs font-bold text-wheat tracking-wider uppercase">
              코스 및 대회 안내
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><a href="/course?tab=14.46km" className="hover:text-burnt-orange transition-colors">14.46km 상징 코스</a></li>
              <li><a href="/course?tab=10km" className="hover:text-burnt-orange transition-colors">10km 도심 도전</a></li>
              <li><a href="/course?tab=5km" className="hover:text-burnt-orange transition-colors">5km 가족 달리기</a></li>
              <li><a href="/info/rules" className="hover:text-burnt-orange transition-colors font-semibold text-wheat/90">참가자 유의사항 (규정집)</a></li>
              <li><a href="/community/notice" className="hover:text-burnt-orange transition-colors">공지사항 게시판</a></li>
              <li><a href="/community/faq" className="hover:text-burnt-orange transition-colors">자주 묻는 질문(FAQ)</a></li>
              <li><a href="/community/media" className="hover:text-burnt-orange transition-colors">공식 미디어(영상)</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3 font-pretendard">
            <h4 className="text-xs font-bold text-wheat tracking-wider uppercase">
              골목 상생 혜택
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><a href="/#after-run" className="hover:text-burnt-orange transition-colors">1446 애프터런 (300곳)</a></li>
              <li><a href="/#after-run" className="hover:text-burnt-orange transition-colors">상생 바우처 10,000원</a></li>
              <li><a href="/#after-run" className="hover:text-burnt-orange transition-colors">14,460원 러너 세트</a></li>
              <li><a href="/info/souvenir" className="hover:text-burnt-orange transition-colors">훈민정음 28자 메달</a></li>
            </ul>
          </div>

          {/* 조직위 문의처: font-pretendard */}
          <div className="md:col-span-3 space-y-3 font-pretendard">
            <h4 className="text-xs font-bold text-wheat tracking-wider uppercase">
              사무국 안내
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              세종특별자치시 보람동 시청대로 180 세종시청 별관 3층<br />
              이메일: contact@1446sejongrun.kr<br />
              문의전화: 044-144-6000 (평일 09:00 - 18:00)
            </p>
            <div className="pt-1">
              <a
                href="/admin/login"
                className="inline-flex items-center space-x-1 text-[11px] text-white/50 hover:text-wheat transition-colors underline decoration-dotted"
              >
                <span>대회 관리자 전용 포털</span>
              </a>
            </div>
          </div>
        </div>

        {/* 하단 카피라이트 & 맨 위로 가기 버튼 */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-pretendard text-white/50">
          <p>© 2026 1446 SEJONG RUN. All rights reserved.</p>

          {/* 훈민정음 인장 타이포그래피 & 맨 위로 가기 버튼 컨테이너 */}
          <div className="flex items-center gap-4 sm:gap-6">
            <span
              className="font-serif text-2xl md:text-4xl tracking-widest text-[#F7F5F0] opacity-20 select-none pointer-events-none"
            >
              훈민정음
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-burnt-orange hover:text-white transition-all text-wheat font-semibold"
            >
              <span>맨 위로</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
