"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, CheckCircle2, Layers, Award } from "lucide-react";
import confetti from "canvas-confetti";

export default function MedalSection() {
  const [isCombined, setIsCombined] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "consonant" | "vowel">("all");

  const consonants = ["ㄱ", "ㅋ", "ㆁ", "ㄷ", "ㅌ", "ㄴ", "ㅂ", "ㅍ", "ㅁ", "ㅈ", "ㅊ", "ㅅ", "ㆆ", "ㅎ", "ㅇ", "ㄹ", "ㅿ"];
  const vowels = ["ㆍ", "ㅡ", "ㅣ", "ㅗ", "ㅏ", "ㅜ", "ㅓ", "ㅛ", "ㅑ", "ㅠ", "ㅕ"];

  const handleCombine = () => {
    if (!isCombined) {
      setIsCombined(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C44900", "#EFD6AC", "#04151F", "#F7F5F0"],
      });
    } else {
      setIsCombined(false);
    }
  };

  return (
    <section id="medals" className="relative py-24 sm:py-32 border-t border-ink-black/10 overflow-hidden font-pretendard">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더: 스토리텔링 타이틀은 font-hunmin 적용 */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/20 text-burnt-orange text-xs font-pretendard font-bold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>완주 기념 메달 모음</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-hunmin font-bold text-ink-black tracking-tight leading-tight mb-4">
            훈민정음{" "}
            <span className="font-mono font-bold">28</span>
            <span className="font-pretendard font-bold">자</span> 완주 메달 모음
          </h2>

          <p className="text-sm sm:text-base font-pretendard text-ink-black/75 max-w-2xl mx-auto leading-relaxed">
            세종런의 완주 메달은 단순한 기념품이 아닙니다. 계절마다 자음과 모음을 모아
            하나의 단어로 결합할 수 있는 자석식 조립 결합 메달입니다.
          </p>
        </div>

        {/* 메달 결합 시뮬레이터 카드 */}
        <div className="max-w-4xl mx-auto bg-slate-grey/5 border border-slate-grey/15 rounded-3xl p-6 sm:p-10 mb-16 shadow-traditional">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-ink-black/10">
            <div>
              <span className="text-xs font-pretendard font-bold text-burnt-orange tracking-widest uppercase">
                체험형 전시 및 소개
              </span>
              <h3 className="text-lg sm:text-xl font-hunmin font-bold text-ink-black mt-0.5">
                계절별 메달 자석 결합 체험
              </h3>
            </div>

            {/* 결합 / 분리 토글 액션 버튼: font-pretendard 적용 */}
            <motion.button
              onClick={handleCombine}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-5 py-2.5 rounded-full font-pretendard font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all duration-300 ${
                isCombined
                  ? "bg-ink-black text-wheat hover:bg-ink-black/90"
                  : "bg-burnt-orange text-white hover:bg-burnt-orange-hover shadow-burnt-orange/30"
              }`}
            >
              {isCombined ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>메달 분리하기 (다시 시도)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-wheat animate-pulse" />
                  <span>봄철 &apos;ㅔ&apos; 메달 결합하기</span>
                </>
              )}
            </motion.button>
          </div>

          {/* 메달 결합 스테이지 */}
          <div className="relative py-12 sm:py-16 flex items-center justify-center min-h-[260px] overflow-hidden">
            <AnimatePresence>
              {isCombined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.25 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                >
                  <div className="w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-burnt-orange/20 blur-3xl" />
                  <div className="absolute w-48 h-48 rounded-full bg-wheat/30 blur-xl animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-8">
              {/* 겨울 메달: 초성 'ㅅ' (font-hunmin 적용) */}
              <motion.div
                animate={
                  isCombined
                    ? { x: 38, rotate: 0, scale: 1.05 }
                    : { x: -30, rotate: -4, scale: 1 }
                }
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-ink-black text-wheat border-2 border-wheat/40 shadow-2xl flex flex-col items-center justify-center cursor-pointer select-none"
              >
                <div className="absolute -top-3 w-4 h-4 rounded-full bg-wheat/40 border border-wheat" />
                <span className="text-4xl sm:text-5xl font-hunmin font-bold text-wheat">
                  ㅅ
                </span>
                <span className="absolute bottom-2 text-[9px] font-pretendard font-bold text-wheat/60 tracking-wider">
                  2025년 겨울
                </span>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 bg-burnt-orange/60 rounded-full" />
              </motion.div>

              <motion.div
                animate={{
                  scale: isCombined ? [1, 1.4, 0] : 1,
                  opacity: isCombined ? [1, 1, 0] : 0.4,
                }}
                transition={{ duration: 0.4 }}
                className="text-burnt-orange font-bold text-xl select-none"
              >
                +
              </motion.div>

              {/* 봄 메달: 중성 'ㅔ' (font-hunmin 적용) */}
              <motion.div
                animate={
                  isCombined
                    ? { x: -38, rotate: 0, scale: 1.05 }
                    : { x: 30, rotate: 4, scale: 1 }
                }
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-burnt-orange text-white border-2 border-wheat/60 shadow-2xl flex flex-col items-center justify-center cursor-pointer select-none"
              >
                <div className="absolute -top-3 w-4 h-4 rounded-full bg-wheat/60 border border-white" />
                <span className="text-4xl sm:text-5xl font-hunmin font-bold text-white">
                  ㅔ
                </span>
                <span className="absolute bottom-2 text-[9px] font-pretendard font-bold text-white/80 tracking-wider">
                  2026년 봄
                </span>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 bg-ink-black/60 rounded-full" />
              </motion.div>
            </div>
          </div>

          {/* 결합 완료 메시지 배너: 외래어 순화 */}
          <AnimatePresence>
            {isCombined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-4 border border-burnt-orange/30 shadow-md text-center max-w-md mx-auto"
              >
                <div className="flex items-center justify-center space-x-2 text-burnt-orange font-bold text-sm sm:text-base font-hunmin mb-1">
                  <CheckCircle2 className="w-5 h-5 text-burnt-orange" />
                  <span>‘세’ 완성! 결합 혜택 활성화</span>
                </div>
                <p className="text-xs font-pretendard text-ink-black/75">
                  ‘ㅅ’ 메달과 ‘ㅔ’ 메달이 결합되었습니다. 세종시 함께하는 상점 300곳에서
                  골목 상품권 5,000원 추가 할인이 적용됩니다.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 훈민정음 28자 전체 메달 도감 그리드 */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h4 className="text-lg font-hunmin font-bold text-ink-black flex items-center gap-2">
              <Layers className="w-4 h-4 text-burnt-orange" />
              <span>
                훈민정음 <span className="font-mono font-bold">28</span>
                <span className="font-pretendard font-bold">자</span> 메달 도감
              </span>
            </h4>

            {/* 필터 탭: font-pretendard */}
            <div className="flex space-x-2 bg-ink-black/5 p-1 rounded-lg text-xs font-pretendard">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "all"
                    ? "bg-white text-ink-black font-bold shadow-sm"
                    : "text-ink-black/60 hover:text-ink-black"
                }`}
              >
                전체 (28자)
              </button>
              <button
                onClick={() => setActiveTab("consonant")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "consonant"
                    ? "bg-white text-ink-black font-bold shadow-sm"
                    : "text-ink-black/60 hover:text-ink-black"
                }`}
              >
                초성 (17자)
              </button>
              <button
                onClick={() => setActiveTab("vowel")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "vowel"
                    ? "bg-white text-ink-black font-bold shadow-sm"
                    : "text-ink-black/60 hover:text-ink-black"
                }`}
              >
                중성 (11자)
              </button>
            </div>
          </div>

          {/* 28자 메달 자모 그리드: 자모 폰트는 font-hunmin 적용 */}
          <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-14 gap-2.5 sm:gap-3">
            {(activeTab === "vowel"
              ? vowels
              : activeTab === "consonant"
              ? consonants
              : [...consonants, ...vowels]
            ).map((char, index) => {
              const isHighlight = char === "ㅅ" || char === "ㅔ";
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 border transition-all cursor-pointer relative group ${
                    isHighlight
                      ? "bg-burnt-orange text-white border-burnt-orange shadow-md shadow-burnt-orange/20"
                      : "bg-white/80 hover:bg-white text-ink-black border-ink-black/10 hover:border-burnt-orange/50 shadow-sm"
                  }`}
                >
                  <span className="text-xl sm:text-2xl font-hunmin font-bold">
                    {char}
                  </span>
                  <span
                    className={`text-[9px] font-mono mt-0.5 ${
                      isHighlight ? "text-wheat" : "text-ink-black/40 group-hover:text-burnt-orange"
                    }`}
                  >
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
