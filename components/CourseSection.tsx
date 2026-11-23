"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Flag, Droplets, HeartHandshake } from "lucide-react";
import { EVENT_LOCATION } from "@/constants/event";
import CourseMap from "./CourseMap";

export default function CourseSection() {
  const searchParams = useSearchParams();
  const [selectedCourse, setSelectedCourse] = useState<"14.46km" | "10km" | "5km">("14.46km");

  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get("tab");
      if (tab === "10km" || tab === "5km" || tab === "14.46km") {
        setSelectedCourse(tab);
      }
    }
  }, [searchParams]);

  const courses = {
    "14.46km": {
      title: "14.46km 상징 훈민정음 달리기",
      sub: "금강과 이응다리, 호수공원 남측 및 햇무리교를 아우르는 최대 상징 코스",
      distance: "14.46 km",
      timeLimit: "2시간 20분",
      startPoint: EVENT_LOCATION,
      turnPoint: "금강 남측 학나래교 방면 / 햇무리교 남단",
      alleyPoint: "국립어린이박물관 및 세종호수공원 남측 수변길",
      waterStations: "4개소 (3.5km, 7km, 10.5km, 13km)",
      features: [
        "금강 남측 자전거도로 서진 후 이응다리 남단→북단 횡단",
        "국립어린이박물관 및 세종호수공원 남측 도로 횡단",
        "햇무리교 남단 방면 회차 후 세종시청 앞 광장 대단원 완주",
      ],
    },
    "10km": {
      title: "10km 골목 활력 도전",
      sub: "금강 남측 수변 자전거길 서진 후 이응다리를 왕복하는 도심 도전 코스",
      distance: "10.00 km",
      timeLimit: "1시간 40분",
      startPoint: EVENT_LOCATION,
      turnPoint: "금강 남측 학나래교 방면 / 이응다리 북단",
      alleyPoint: "이응다리 남측 수변 상생 쉼터",
      waterStations: "3개소 (3km, 6km, 8.5km)",
      features: [
        "금강 남측 자전거도로를 따라 서쪽(학나래교 방향) 질주",
        "서측 반환점 회차 후 이응다리 남단→북단 통과 및 북단 반환",
        "이응다리를 다시 건너 세종시청 앞 광장 완주",
      ],
    },
    "5km": {
      title: "5km 해례본 가족 걷기·달리기",
      sub: "이응다리 중앙 원형 구간을 반시계 방향으로 일주하는 온 가족 순환 코스",
      distance: "5.00 km",
      timeLimit: "1시간 10분",
      startPoint: EVENT_LOCATION,
      turnPoint: "이응다리 원형 보행교 중앙부",
      alleyPoint: "시청 앞 광장 문화마당",
      waterStations: "2개소 (이응다리 남단, 도착 지점)",
      features: [
        `${EVENT_LOCATION} 출발 후 이응다리 남단 진입`,
        "이응다리 중앙 원형 구간 반시계 방향 1회전 순환",
        "유모차 및 휠체어 동반 가능한 턱 없는 무장애 안심 코스",
      ],
    },
  };

  const current = courses[selectedCourse];

  return (
    <section id="courses" className="py-24 sm:py-32 bg-transparent border-t border-ink-black/10 relative overflow-hidden font-pretendard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* [후반부: 마라톤 코스로의 자연스러운 연결 브릿지 카피] */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 sm:mb-16 pb-8 sm:pb-10 border-b border-ink-black/10"
        >
          <div className="flex items-center space-x-2.5 mb-2.5">
            <span className="w-5 h-[2px] bg-burnt-orange" />
            <span className="text-xs sm:text-sm font-hunmin font-bold text-burnt-orange tracking-widest">
              혁신의 발걸음
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-hunmin font-bold text-ink-black tracking-tight leading-snug break-keep">
            이 거대한 혁신의 발걸음, 당신과 함께 세종의 골목을 깨웁니다.
          </h3>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-2 text-burnt-orange font-bold text-xs uppercase tracking-widest mb-2 font-pretendard">
              <MapPin className="w-4 h-4" />
              <span>공식 마라톤 코스 안내</span>
            </div>
            {/* 공식 코스 타이틀: font-hunmin 적용 */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-hunmin font-bold text-ink-black tracking-tight leading-tight">
              1446 세종런 공식 코스 안내
            </h2>
            <p className="text-sm sm:text-base font-pretendard text-ink-black/75 mt-2">
              세종의 상징 명소인 이응다리와 금강을 건너 골목의 온기 속으로 들어가는 3가지 코스를 확인하세요.
            </p>
          </div>

          {/* 코스 선택 버튼 그룹: [14.46km 상징 코스] / [10km 도심 도전] / [5km 가족 걷기] */}
          <div className="flex items-center space-x-2 bg-ink-black/5 p-1 rounded-2xl border border-ink-black/10 font-pretendard">
            {[
              { id: "14.46km", label: "14.46km 상징 코스" },
              { id: "10km", label: "10km 도심 도전" },
              { id: "5km", label: "5km 가족 걷기" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedCourse(id as any)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedCourse === id
                    ? "bg-burnt-orange text-white shadow-md shadow-burnt-orange/30"
                    : "text-ink-black/70 hover:text-ink-black hover:bg-white/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 대화형 다크 네온 코스 맵 (금강 & 이응다리 베이스) */}
        <div className="mb-10 sm:mb-12">
          <CourseMap
            selectedCourse={selectedCourse}
            onSelectCourse={setSelectedCourse}
          />
        </div>

        {/* 선택된 코스 상세 카드 */}
        <div className="bg-white rounded-3xl border border-ink-black/10 p-6 sm:p-10 shadow-traditional space-y-6 font-pretendard">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 rounded-md bg-burnt-orange/10 text-burnt-orange font-mono font-bold text-xs mb-2">
                거리 {current.distance} · 제한시간 {current.timeLimit}
              </div>
              <h3 className="text-2xl sm:text-3xl font-hunmin font-bold text-ink-black">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm font-pretendard text-ink-black/70 mt-1">
                {current.sub}
              </p>
            </div>
          </div>

          {/* 주요 지점 정보 그리드 (출발/도착, 반환점, 골목상권, 급수대) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1 font-pretendard">
            <div className="p-4 rounded-2xl bg-hanji-bg/70 border border-ink-black/10">
              <span className="text-[10px] font-bold text-ink-black/50 uppercase flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-burnt-orange" /> 출발/도착
              </span>
              <p className="text-xs sm:text-sm font-bold text-ink-black mt-1.5">
                {current.startPoint}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-hanji-bg/70 border border-ink-black/10">
              <span className="text-[10px] font-bold text-ink-black/50 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-burnt-orange" /> 반환점
              </span>
              <p className="text-xs sm:text-sm font-bold text-ink-black mt-1.5">
                {current.turnPoint}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-hanji-bg/70 border border-ink-black/10">
              <span className="text-[10px] font-bold text-burnt-orange uppercase flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-burnt-orange" /> 골목 상권 진입
              </span>
              <p className="text-xs sm:text-sm font-bold text-ink-black mt-1.5">
                {current.alleyPoint}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-hanji-bg/70 border border-ink-black/10">
              <span className="text-[10px] font-bold text-ink-black/50 uppercase flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-burnt-orange" /> 급수대 운영
              </span>
              <p className="text-xs sm:text-sm font-bold text-ink-black mt-1.5">
                {current.waterStations}
              </p>
            </div>
          </div>

          {/* 특징 리스트 */}
          <div className="space-y-2.5 pt-2 border-t border-ink-black/5">
            <h4 className="text-xs font-bold text-ink-black uppercase tracking-wider font-pretendard">
              코스 주요 특징
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm font-pretendard text-ink-black/80">
              {current.features.map((feat, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-burnt-orange flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
