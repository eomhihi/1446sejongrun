"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Store, Compass } from "lucide-react";
import { EVENT_LOCATION, MAIN_SLOGAN } from "@/constants/event";

function CounterNumber({
  value,
  duration = 1.5,
  decimals = 0,
  suffix = "",
  suffixClassName = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  suffixClassName?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = easeProgress * value;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <span className="font-mono">
        {decimals > 0 ? displayValue.toFixed(decimals) : Math.floor(displayValue)}
      </span>
      {suffix && (
        <span className={`font-pretendard ${suffixClassName}`}>
          {suffix}
        </span>
      )}
    </span>
  );
}

export default function AboutSection() {
  return (
    <section id="about" className="relative py-20 sm:py-28 overflow-hidden font-pretendard">
      {/* 
        [중반부 브릿지: 1446 브랜드 스토리 페이드인]
        여백의 미를 살린 공간 중앙에 스르륵 나타나는 1446 브랜드 선언문
      */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 sm:mb-28 pt-2 sm:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-6 sm:space-y-8"
        >
          {/* 상단 라벨 */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/20 text-burnt-orange text-xs font-hunmin font-bold tracking-widest">
            <span>1446 브랜드 선언문</span>
          </div>

          {/* 메인 카피: 명조/서리프 (font-hunmin) */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-hunmin font-bold text-ink-black tracking-tight leading-[1.5] sm:leading-[1.6] break-keep max-w-3xl mx-auto">
            <span className="text-burnt-orange block text-xl sm:text-2xl md:text-3xl mb-2 font-hunmin font-bold tracking-tight">
              {MAIN_SLOGAN}
            </span>
            1446, 백성을 향한 혁신이<br />
            대한민국의 내일을 이끄는<br />
            세종으로 이어지다
          </h2>

          {/* 정갈한 구분선 */}
          <div className="w-12 h-[2px] bg-burnt-orange/60 mx-auto" />

          {/* 서브 카피: 시집을 읽듯 차분하고 정돈된 타이포그래피 (자간과 행간 확보) */}
          <p className="text-base sm:text-lg md:text-[19px] font-pretendard text-ink-black/85 leading-[2.1] sm:leading-[2.4] max-w-2xl sm:max-w-3xl mx-auto break-keep tracking-wide font-normal">
            1446년 훈민정음 반포에 담긴 세종대왕의 애민과 혁신가 정신.<br />
            그 지혜가 오늘날 국가균형성장의 중심이자 실질적 행정수도 세종특별자치시의 비전으로 피어나<br />
            대한민국을 선도합니다. 1446, 혁신 도시 세종을 상징하는 새로운 브랜드 캠페인이<br />
            이제 시민 러너들의 발걸음을 통해 골목 곳곳의 온기로 퍼져나갑니다.
          </p>
        </motion.div>
      </div>

      {/* 정갈한 섹션 구분선 */}
      <div className="max-w-xl mx-auto border-t border-ink-black/10 mb-16 sm:mb-24" />

      {/* 
        여백의 미가 살아있는 한지 배경 위에 에디토리얼 레이아웃 렌더링
      */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 라벨: 외래어 순화 */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-5 h-[2px] bg-burnt-orange" />
          <span className="text-xs sm:text-sm font-hunmin font-bold tracking-widest text-burnt-orange uppercase">
            대회 취지 및 이야기
          </span>
        </div>

        {/* 
          에디토리얼 메인 헤드라인:
          역사성과 정통성을 강조하는 에디토리얼 헤드라인 -> 훈민정음체 (font-hunmin)
          상세 설명 및 본문 -> 프리텐다드 (font-pretendard)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-16 sm:mb-20">
          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-hunmin font-bold text-ink-black leading-[1.3] sm:leading-[1.35] tracking-tight break-keep">
              완주선에서 끝나지 않고,
              <br />
              <span className="text-burnt-orange underline decoration-wheat decoration-wavy decoration-2">
                세종의 골목을 깨우는
              </span>
              <br />
              새로운 달리기 축제
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-4 text-ink-black/80 font-pretendard leading-relaxed text-sm sm:text-base">
            <p>
              1446년, 세종대왕은 백성이 뜻을 쉽게 펴도록 훈민정음 28자를 반포했습니다.
              그로부터 580년이 지난 오늘, 우리는 그 뜻을 이어받아 도심 대로변에 갇힌 마라톤을
              골목 안으로 옮겨왔습니다.
            </p>
            <p className="font-medium text-ink-black">
              1446 세종런은 러너가 달린 발걸음마다 지역 소상공인 골목 상권에 불을 밝히는
              전국 유일의 <strong className="text-burnt-orange font-semibold">‘골목 상생 마라톤’</strong>입니다.
            </p>
          </div>
        </div>

        {/* 숫자 카운트업 그리드: 외래어 순화 적용 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-20 font-pretendard">
          {/* 카드 1: 14.46km */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-ink-black/10 rounded-2xl p-6 sm:p-8 shadow-traditional relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 flex items-center justify-center text-burnt-orange mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-ink-black mb-1">
              <CounterNumber value={14.46} duration={1.6} decimals={2} suffix="km" suffixClassName="font-pretendard text-2xl sm:text-3xl lg:text-4xl font-bold ml-1" />
            </div>
            <h3 className="text-base font-hunmin font-bold text-ink-black mb-2">
              상징 상생 달리기 코스
            </h3>
            <p className="text-xs sm:text-sm font-pretendard text-ink-black/70 leading-normal">
              1446년을 상징하는 14.46km. {EVENT_LOCATION}에서 시작해 금강을 건너 골목 상권으로 이어집니다.
            </p>
          </motion.div>

          {/* 카드 2: 300곳 ('곳'은 Pretendard 적용) */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-ink-black text-white rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-wheat/20"
          >
            <div className="w-10 h-10 rounded-xl bg-wheat/15 flex items-center justify-center text-wheat mb-4">
              <Store className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-wheat mb-1">
              <CounterNumber value={300} duration={1.8} decimals={0} suffix="곳" suffixClassName="font-pretendard text-2xl sm:text-3xl lg:text-4xl font-bold ml-1" />
            </div>
            <h3 className="text-base font-hunmin font-bold text-white mb-2">
              골목 상생 함께하는 상점
            </h3>
            <p className="text-xs sm:text-sm font-pretendard text-white/70 leading-normal">
              세종시 전역 카페, 식당, 공방이 참여합니다. 완주 메달을 제시하면 특별한 혜택을 제공합니다.
            </p>
          </motion.div>

          {/* 카드 3: 28자 ('자'는 Pretendard 적용) */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-ink-black/10 rounded-2xl p-6 sm:p-8 shadow-traditional relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-burnt-orange/10 flex items-center justify-center text-burnt-orange mb-4">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-burnt-orange mb-1">
              <CounterNumber value={28} duration={1.4} decimals={0} suffix="자" suffixClassName="font-pretendard text-2xl sm:text-3xl lg:text-4xl font-bold ml-1" />
            </div>
            <h3 className="text-base font-hunmin font-bold text-ink-black mb-2">
              훈민정음 소장용 메달 모음
            </h3>
            <p className="text-xs sm:text-sm font-pretendard text-ink-black/70 leading-normal">
              초성 17자와 중성 11자로 구성된 한글 메달. 계절마다 자모를 모아 완성하는 특별한 기념품입니다.
            </p>
          </motion.div>
        </div>

        {/* 3대 핵심 미션 그리드: 외래어 순화 */}
        <div className="bg-slate-grey/5 border border-slate-grey/15 rounded-3xl p-6 sm:p-10 font-pretendard">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="seal-stamp mb-2 font-hunmin">세종정신</span>
            <h3 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black">
              1446 세종런이 약속하는 3가지 변화
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-burnt-orange text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                01
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-hunmin font-bold text-ink-black">
                  1km당 100원 골목 상생 기금
                </h4>
                <p className="text-xs sm:text-sm font-pretendard text-ink-black/75 leading-relaxed">
                  모든 참가자가 완주한 총 누적 거리를 환산해 세종 소상공인 응원 상품권으로 전액 지원합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-slate-grey text-wheat flex items-center justify-center flex-shrink-0 font-bold text-sm">
                02
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-hunmin font-bold text-ink-black">
                  쓰레기 없는 친환경 한글 달리기
                </h4>
                <p className="text-xs sm:text-sm font-pretendard text-ink-black/75 leading-relaxed">
                  일회용 종이컵 대신 생분해 컵과 친환경 타이벡 배번호를 사용하여 탄소 배출을 65% 감축합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-ink-black text-wheat flex items-center justify-center flex-shrink-0 font-bold text-sm">
                03
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-hunmin font-bold text-ink-black">
                  지역 화폐 ‘여민전’ 연동
                </h4>
                <p className="text-xs sm:text-sm font-pretendard text-ink-black/75 leading-relaxed">
                  참가자 전원에게 세종시 지역화폐 여민전 10,000원 할인권을 지급하여 대회 직후 골목 소비를 촉진합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
