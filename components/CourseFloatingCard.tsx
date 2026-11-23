"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, MapPin, Sparkles } from "lucide-react";
import { EVENT_LOCATION } from "@/constants/event";
import { useCountdown } from "@/hooks/useCountdown";
import { COURSES_DATA, COURSES_MAP } from "@/constants/courseData";

interface CourseFloatingCardProps {
  onSelectCourse?: (courseKey: string) => void;
}

export default function CourseFloatingCard({
  onSelectCourse,
}: CourseFloatingCardProps) {
  const [activeCourse, setActiveCourse] = useState<"14.46km" | "10km" | "5km">(
    "14.46km"
  );

  // 1. 전역 상수 EVENT_DATE 기반 실시간 1초 동기화 카운트다운 훅 연동
  const countdown = useCountdown();

  // 2. 모듈화된 코스 메타데이터 매핑
  const current = COURSES_MAP[activeCourse];

  return (
    <div className="w-full max-w-[380px] lg:max-w-[420px] bg-[#04151F]/95 backdrop-blur-md border border-[#EFD6AC]/25 shadow-2xl rounded-2xl p-4 sm:p-5 text-white transition-all duration-300 font-pretendard">
      {/* 상단 헤더: 대회까지 남은 날 카운트다운 타이머 (실시간 동기화) */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-burnt-orange animate-ping" />
          <span className="text-[11px] font-sans font-bold tracking-wider text-wheat uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-burnt-orange" />
            <span>대회까지 남은 날:</span>
            <span className="font-mono font-black text-burnt-orange text-xs sm:text-sm tracking-normal">
              D-{countdown.isLoaded ? String(countdown.displayDday).padStart(3, "0") : "..."}
            </span>
          </span>
        </div>

        {/* 1초 단위 실시간 시 : 분 : 초 동기화 타이머 수치 */}
        <div className="flex items-baseline space-x-1 font-mono text-xs">
          <span className="px-1.5 py-0.5 rounded bg-black/50 border border-white/15 text-wheat font-semibold">
            {countdown.formattedHours}시
          </span>
          <span className="text-white/60">:</span>
          <span className="px-1.5 py-0.5 rounded bg-black/50 border border-white/15 text-wheat font-semibold">
            {countdown.formattedMinutes}분
          </span>
          <span className="text-white/60">:</span>
          <span className="px-1.5 py-0.5 rounded bg-black/50 border border-white/15 text-white/90 font-mono text-[10px]">
            {countdown.formattedSeconds}초
          </span>
        </div>
      </div>

      {/* 코스 선택 탭: 모듈화된 COURSES_DATA 기반 맵핑 (14.46km / 10km / 5km) */}
      <div className="grid grid-cols-3 gap-1.5 bg-black/50 p-1 rounded-xl mb-3 border border-white/10 font-mono">
        {COURSES_DATA.map((course) => {
          const isSelected = activeCourse === course.id;
          return (
            <button
              key={course.id}
              onClick={() => {
                setActiveCourse(course.id);
                onSelectCourse?.(course.id);
              }}
              className={`relative py-1.5 px-2 text-xs font-bold rounded-lg transition-all duration-200 text-center ${
                isSelected
                  ? "text-white shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              style={{
                backgroundColor: isSelected ? course.color : "transparent",
                color: isSelected && course.color === "#EFD6AC" ? "#04151F" : undefined,
                boxShadow: isSelected ? `0 4px 14px ${course.glowColor}` : undefined,
              }}
            >
              <span>{course.distance}</span>
              {course.badge && (
                <span
                  className="absolute -top-1.5 -right-1 px-1 text-[8px] font-black rounded-full leading-tight font-pretendard"
                  style={{
                    backgroundColor: isSelected ? "#04151F" : course.color,
                    color: isSelected ? course.color : course.color === "#EFD6AC" ? "#04151F" : "#FFFFFF",
                  }}
                >
                  {course.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 미니맵: 코스 디자인 시스템 색상 및 네온(Glow) 효과 완벽 동기화 */}
      <div className="relative h-24 sm:h-28 bg-[#020B10]/90 rounded-xl p-2 border border-white/15 overflow-hidden flex items-center justify-center">
        {/* 미니맵 베이스 그리드 배경 */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(to right, #EFD6AC 1px, transparent 1px), linear-gradient(to bottom, #EFD6AC 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* 세종시청 광장 (출발/도착) 고정 랜드마크 마커 */}
        <div className="absolute bottom-1.5 left-2.5 text-[9px] font-pretendard text-white/80 flex items-center gap-1 z-20 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
          <MapPin className="w-2.5 h-2.5 text-burnt-orange" />
          <span>{EVENT_LOCATION} (출발/도착)</span>
        </div>

        {/* 활성 코스 반환점/경유지 라벨 */}
        <div className="absolute top-1.5 right-2.5 text-[9px] font-pretendard text-wheat/90 flex items-center gap-1 z-20 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
          <Sparkles className="w-2.5 h-2.5" style={{ color: current.color }} />
          <span>{current.turnpointName}</span>
        </div>

        {/* 네온 코스 라인 애니메이션 (framer-motion pathLength & 색상 동기화) */}
        <AnimatePresence mode="wait">
          <motion.svg
            key={activeCourse}
            viewBox="0 0 300 90"
            className="w-full h-full relative z-10"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.3 }}
          >
            {/* 네온 글로우 백그라운드 아우라 */}
            <path
              d={current.glowPath}
              fill="none"
              stroke={current.color}
              strokeWidth="6"
              strokeOpacity="0.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter blur-[3px]"
            />

            {/* 네온 코어 패스: pathLength 0 -> 1 그리기 모션 */}
            <motion.path
              d={current.glowPath}
              fill="none"
              stroke={current.color}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 0 8px ${current.glowColor})`,
              }}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
            />

            {/* 코스 위를 달리는 러너 위치 펄스 도트 */}
            <circle
              cx={current.runnerPosition.x}
              cy={current.runnerPosition.y}
              r="3.5"
              fill={current.color === "#EFD6AC" ? "#FFFFFF" : "#EFD6AC"}
            >
              <animate
                attributeName="r"
                values="2.5;5.5;2.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.9;0.3;0.9"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </motion.svg>
        </AnimatePresence>
      </div>

      {/* 코스 설명 및 메타 정보 (100% 한글화, 모듈 객체 기반 맵핑) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCourse}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-3 space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-wheat">
              {current.name}
            </h4>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-semibold border"
              style={{
                backgroundColor: `${current.color}20`,
                borderColor: `${current.color}55`,
                color: current.color === "#EFD6AC" ? "#EFD6AC" : current.color,
              }}
            >
              제한시간 {current.limitTime}
            </span>
          </div>

          <p className="text-[11px] text-white/75 leading-tight line-clamp-1">
            {current.desc}
          </p>

          <div className="pt-1.5 flex items-center justify-between text-[10px] text-white/60 border-t border-white/10">
            <span className="flex items-center gap-1 font-medium" style={{ color: current.color }}>
              <Flame className="w-3 h-3" />
              <span>{current.checkpoint}</span>
            </span>
            <span className="text-wheat/80 font-mono text-[10px]">
              반환: {current.turnpointName}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
