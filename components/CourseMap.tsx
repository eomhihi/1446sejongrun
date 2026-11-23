"use client";

import React, { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Map, Polyline, CustomOverlayMap } from "react-kakao-maps-sdk";
import { Compass, Layers, Maximize2, RotateCcw, Sparkles } from "lucide-react";
import { EVENT_LOCATION } from "@/constants/event";

declare global {
  interface Window {
    kakao: any;
  }
}

export type CourseType = "all" | "14.46km" | "10km" | "5km";

interface CourseMapProps {
  selectedCourse?: "14.46km" | "10km" | "5km";
  onSelectCourse?: (course: "14.46km" | "10km" | "5km") => void;
}

interface LatLngPoint {
  lat: number;
  lng: number;
}

// 이응다리 원형(ㅇ) 궤적 좌표 생성 헬퍼 함수 (반경 약 230m)
function generateCirclePoints(
  centerLat: number,
  centerLng: number,
  radiusLat = 0.00207,
  radiusLng = 0.00258,
  steps = 28
): LatLngPoint[] {
  const points: LatLngPoint[] = [];
  // 6시 방향(남단, -90도)에서 출발하여 시계방향 일주 후 복귀
  for (let i = 0; i <= steps; i++) {
    const angle = -Math.PI / 2 + (i / steps) * 2 * Math.PI;
    const lat = centerLat + radiusLat * Math.sin(angle);
    const lng = centerLng + radiusLng * Math.cos(angle);
    points.push({ lat, lng });
  }
  return points;
}

export default function CourseMap({
  selectedCourse = "14.46km",
  onSelectCourse,
}: CourseMapProps) {
  const [activeTab, setActiveTab] = useState<CourseType>(selectedCourse);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  // 상위 컴포넌트의 selectedCourse prop과 동기화
  useEffect(() => {
    if (selectedCourse && selectedCourse !== activeTab) {
      setActiveTab(selectedCourse);
    }
  }, [selectedCourse]);

  // 카카오 지도 SDK 비동기 로딩 감지 및 초기화
  useEffect(() => {
    const checkKakao = () => {
      if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsMapLoaded(true);
        });
        return true;
      }
      return false;
    };

    if (checkKakao()) return;

    const timer = setInterval(() => {
      if (checkKakao()) {
        clearInterval(timer);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  // 1. 실제 지리 좌표 데이터 (위도, 경도)
  const CITY_HALL: LatLngPoint = { lat: 36.48028, lng: 127.28915 }; // 세종시청 앞 광장 (출발/도착)
  const IEUNG_SOUTH: LatLngPoint = { lat: 36.4881, lng: 127.28915 }; // 이응다리 남측
  const IEUNG_CENTER: LatLngPoint = { lat: 36.4918, lng: 127.28915 }; // 이응다리 중심
  const IEUNG_NORTH: LatLngPoint = { lat: 36.4955, lng: 127.28915 }; // 이응다리 북측

  // 이응다리 원형 데크 궤적 좌표 (반시계 방향 순환)
  const circleDeckPoints = generateCirclePoints(IEUNG_CENTER.lat, IEUNG_CENTER.lng);
  const halfCircleWest = circleDeckPoints.slice(0, Math.floor(circleDeckPoints.length / 2));
  const halfCircleEast = circleDeckPoints.slice(Math.floor(circleDeckPoints.length / 2));

  // 5km 실제 좌표: 세종시청 앞 광장 출발 → 이응다리 남단 진입 → 이응다리 중앙 원형 구간 진입 → 보행교 원형 코스를 반시계 방향으로 돌아 시청 쪽으로 다시 나오는 단순 순환 코스
  const polyline5k: LatLngPoint[] = [
    CITY_HALL,
    { lat: 36.482, lng: 127.28915 },
    { lat: 36.4845, lng: 127.28915 },
    { lat: 36.4868, lng: 127.28915 },
    IEUNG_SOUTH,
    ...circleDeckPoints,
    IEUNG_SOUTH,
    { lat: 36.4868, lng: 127.28915 },
    { lat: 36.4845, lng: 127.28915 },
    { lat: 36.482, lng: 127.28915 },
    CITY_HALL,
  ];

  // 10km 실제 좌표: 세종시청 앞 광장 출발 → 금강 남측 자전거도로를 따라 서쪽(학나래교 방향)으로 이동 → 반환점을 돌아 금강을 따라 쭉 직진 → 이응다리를 통과(남단에서 북단으로 횡단) → 북단 반환 후 다시 이응다리를 건너와 시청으로 도착
  const polyline10k: LatLngPoint[] = [
    CITY_HALL,
    { lat: 36.483, lng: 127.28915 },
    { lat: 36.487, lng: 127.2885 },
    { lat: 36.4875, lng: 127.284 },
    { lat: 36.4862, lng: 127.278 },
    { lat: 36.4842, lng: 127.272 },
    { lat: 36.4818, lng: 127.266 },
    { lat: 36.4788, lng: 127.26 },
    { lat: 36.476, lng: 127.254 }, // 10km 서측 반환점 (학나래교 방면)
    { lat: 36.4765, lng: 127.2542 },
    { lat: 36.4792, lng: 127.2602 },
    { lat: 36.4822, lng: 127.2662 },
    { lat: 36.4846, lng: 127.2722 },
    { lat: 36.4866, lng: 127.2782 },
    { lat: 36.4878, lng: 127.2842 },
    IEUNG_SOUTH,
    { lat: 36.4897, lng: 127.28915 },
    ...halfCircleWest,
    IEUNG_NORTH,
    { lat: 36.4958, lng: 127.28915 }, // 10km 북단 반환점
    IEUNG_NORTH,
    ...halfCircleEast,
    { lat: 36.4897, lng: 127.28915 },
    IEUNG_SOUTH,
    { lat: 36.4855, lng: 127.28915 },
    { lat: 36.4825, lng: 127.28915 },
    CITY_HALL,
  ];

  // 14.46km 실제 좌표: 세종시청 앞 광장 출발 → 금강 남측 도로 서쪽(학나래교 방향) 이동 → 반환점을 돌아 직진 → 이응다리 횡단(남단→북단) → 이응다리 북단과 중앙공원 사이 도로를 통해 세종호수공원 남측/국립어린이박물관 인근 도로 진입 → 다시 강변으로 나와 수변길을 따라 동쪽(햇무리교 방향)으로 이동 → 햇무리교 남단 방면으로 반환하여 출발지로 돌아오는 가장 큰 루프
  const polyline14k: LatLngPoint[] = [
    CITY_HALL,
    { lat: 36.483, lng: 127.28915 },
    { lat: 36.487, lng: 127.2885 },
    { lat: 36.4875, lng: 127.284 },
    { lat: 36.4862, lng: 127.278 },
    { lat: 36.4842, lng: 127.272 },
    { lat: 36.4818, lng: 127.266 },
    { lat: 36.4788, lng: 127.26 },
    { lat: 36.4755, lng: 127.2515 },
    { lat: 36.4735, lng: 127.245 }, // 14.46km 서측 1차 반환점 (학나래교 인접)
    { lat: 36.474, lng: 127.2452 },
    { lat: 36.4758, lng: 127.2517 },
    { lat: 36.4792, lng: 127.2602 },
    { lat: 36.4822, lng: 127.2662 },
    { lat: 36.4846, lng: 127.2722 },
    { lat: 36.4866, lng: 127.2782 },
    { lat: 36.4878, lng: 127.2842 },
    IEUNG_SOUTH,
    { lat: 36.4897, lng: 127.28915 },
    ...halfCircleWest,
    IEUNG_NORTH,
    { lat: 36.498, lng: 127.2892 },
    { lat: 36.5005, lng: 127.2895 },
    { lat: 36.502, lng: 127.2925 }, // 국립어린이박물관 및 세종박물관단지
    { lat: 36.503, lng: 127.2965 }, // 세종호수공원 남측 수변길
    { lat: 36.5015, lng: 127.3005 },
    { lat: 36.4985, lng: 127.3035 },
    { lat: 36.496, lng: 127.3065 },
    { lat: 36.4945, lng: 127.308 }, // 햇무리교 북단 수변길
    { lat: 36.493, lng: 127.3085 },
    { lat: 36.4905, lng: 127.3082 }, // 햇무리교 남단 반환 거점
    { lat: 36.487, lng: 127.306 },
    { lat: 36.484, lng: 127.3015 },
    { lat: 36.4818, lng: 127.2965 },
    { lat: 36.4805, lng: 127.2925 },
    CITY_HALL,
  ];

  // 코스별 상세 메타데이터 (순수 우리말)
  const courseDetails = {
    "14.46km": {
      title: "14.46km 상징 코스",
      badge: "훈민정음 반포 기념",
      color: "#C44900",
      desc: `${EVENT_LOCATION} 출발 → 금강 남측 도로 서진 → 학나래교 방면 반환 → 이응다리 횡단(남단→북단) → 국립어린이박물관·세종호수공원 남측 순환 → 금강 수변길 동진 → 햇무리교 남단 반환 → ${EVENT_LOCATION} 완주`,
      distance: "14.46km",
      timeLimit: "2시간 20분",
    },
    "10km": {
      title: "10km 도심 도전",
      badge: "수변 활력 코스",
      color: "#EFD6AC",
      desc: `${EVENT_LOCATION} 출발 → 금강 남측 자전거도로 서진(학나래교 방면) → 반환점 회차 → 이응다리 횡단(남단→북단) → 북단 반환 후 이응다리 재횡단 → ${EVENT_LOCATION} 완주`,
      distance: "10.00km",
      timeLimit: "1시간 40분",
    },
    "5km": {
      title: "5km 가족 걷기",
      badge: "누구나 편안한 치유",
      color: "#5E8C85",
      desc: `${EVENT_LOCATION} 출발 → 이응다리 남단 진입 → 이응다리 중앙 원형 구간 반시계 방향 순환 → 남단 출구 복귀 → ${EVENT_LOCATION} 완주`,
      distance: "5.00km",
      timeLimit: "1시간 10분",
    },
  };

  // 탭 변경 시 코스 영역에 맞게 지도 화면 부드럽게 조정
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao || !isMapLoaded) return;

    const targetCoords =
      activeTab === "5km"
        ? polyline5k
        : activeTab === "10km"
        ? polyline10k
        : polyline14k;

    const bounds = new window.kakao.maps.LatLngBounds();
    targetCoords.forEach((pt) => {
      bounds.extend(new window.kakao.maps.LatLng(pt.lat, pt.lng));
    });

    mapInstanceRef.current.setBounds(bounds, 50, 50, 50, 50);
  }, [activeTab, isMapLoaded]);

  // 탭 변경 핸들러
  const handleTabClick = (tab: CourseType) => {
    setActiveTab(tab);
    if (tab !== "all" && onSelectCourse) {
      onSelectCourse(tab);
    }
  };

  // 지도 중심 복귀 (세종시청 앞 광장)
  const handleRecenter = () => {
    if (mapInstanceRef.current && window.kakao) {
      mapInstanceRef.current.setLevel(5);
      mapInstanceRef.current.panTo(new window.kakao.maps.LatLng(CITY_HALL.lat, CITY_HALL.lng));
    }
  };

  // 전체 코스 화면 맞춤
  const handleFitAll = () => {
    if (mapInstanceRef.current && window.kakao) {
      const bounds = new window.kakao.maps.LatLngBounds();
      polyline14k.forEach((pt) => {
        bounds.extend(new window.kakao.maps.LatLng(pt.lat, pt.lng));
      });
      mapInstanceRef.current.setBounds(bounds, 50, 50, 50, 50);
    }
  };

  return (
    <div className="w-full bg-[#04151F] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative font-pretendard select-none">
      {/* Kakao Map 비동기 스크립트 로더 (next/script) */}
      {process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY && (
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services,clusterer`}
          strategy="afterInteractive"
          onReady={() => {
            if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
              window.kakao.maps.load(() => {
                setIsMapLoaded(true);
              });
            }
          }}
        />
      )}

      {/* 상단 헤더 & 코스 선택 버튼 (100% 한글화, 외래어 전면 배제) */}
      <div className="relative z-30 flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 pb-3 md:pb-4 border-b border-white/10 bg-[#04151F]/90 backdrop-blur-md gap-4">
        <div>
          <div className="flex items-center space-x-2 text-burnt-orange text-[11px] font-bold tracking-wider">
            <Compass className="w-3.5 h-3.5 text-burnt-orange" />
            <span>카카오 지도 지리 정보 연동 · 세종 금강 야간 도로망</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-hunmin font-bold text-white mt-1 flex items-center gap-2">
            <span>세종시청 및 금강 공식 코스 지도</span>
            <span className="text-[10px] font-pretendard font-bold px-2 py-0.5 rounded-full bg-burnt-orange/20 text-burnt-orange border border-burnt-orange/30">
              야간 모드
            </span>
          </h3>
        </div>

        {/* 코스 선택 탭 버튼: [14.46km 상징 코스] / [10km 도심 도전] / [5km 가족 걷기] / [전체 코스 보기] */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 text-xs overflow-x-auto scrollbar-none">
          {/* 14.46km 버튼 */}
          <button
            onClick={() => handleTabClick("14.46km")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              activeTab === "14.46km"
                ? "bg-burnt-orange text-white shadow-lg shadow-burnt-orange/50"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === "14.46km" ? "bg-white animate-pulse" : "bg-burnt-orange"
              }`}
            />
            <span>14.46km 상징 코스</span>
          </button>

          {/* 10km 버튼 */}
          <button
            onClick={() => handleTabClick("10km")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              activeTab === "10km"
                ? "bg-[#EFD6AC] text-ink-black shadow-lg shadow-[#EFD6AC]/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === "10km" ? "bg-ink-black animate-pulse" : "bg-[#EFD6AC]"
              }`}
            />
            <span>10km 도심 도전</span>
          </button>

          {/* 5km 버튼 */}
          <button
            onClick={() => handleTabClick("5km")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              activeTab === "5km"
                ? "bg-[#5E8C85] text-white shadow-lg shadow-[#5E8C85]/40"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === "5km" ? "bg-white animate-pulse" : "bg-[#5E8C85]"
              }`}
            />
            <span>5km 가족 걷기</span>
          </button>

          {/* 전체 코스 보기 버튼 */}
          <button
            onClick={() => handleTabClick("all")}
            className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold transition-all flex items-center space-x-1 flex-shrink-0 ${
              activeTab === "all"
                ? "bg-white text-ink-black shadow-lg shadow-white/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>전체 코스 보기</span>
          </button>
        </div>
      </div>

      {/* 카카오맵 렌더링 영역 */}
      <div className="relative w-full h-[480px] sm:h-[560px] md:h-[640px] bg-[#04151F] overflow-hidden">
        {/* 
          카카오맵 최상위 컨테이너: CSS 필터 트릭을 적용하여 다크 테마 야간 모드 강제 연출
          filter invert-[90%] hue-rotate-180 brightness-75 contrast-125
        */}
        <div className="w-full h-full relative kakao-dark-container filter invert-[90%] hue-rotate-180 brightness-75 contrast-125">
          {isMapLoaded && (
            <Map
              center={IEUNG_CENTER}
              level={6}
              isPanto={true}
              onCreate={(map) => {
                mapInstanceRef.current = map;
              }}
              style={{ width: "100%", height: "100%" }}
            >
              {/* 5km 코스 폴리라인 (청자/옥색 #5E8C85) */}
              {(activeTab === "all" || activeTab === "5km") && (
                <>
                  <Polyline
                    path={polyline5k}
                    strokeWeight={activeTab === "5km" ? 10 : 3}
                    strokeColor="#5E8C85"
                    strokeOpacity={activeTab === "5km" ? 0.4 : 0.25}
                    strokeStyle="solid"
                    zIndex={activeTab === "5km" ? 10 : 2}
                  />
                  {activeTab === "5km" && (
                    <Polyline
                      path={polyline5k}
                      strokeWeight={5}
                      strokeColor="#5E8C85"
                      strokeOpacity={1.0}
                      strokeStyle="solid"
                      zIndex={11}
                    />
                  )}
                </>
              )}

              {/* 10km 코스 폴리라인 (Wheat #EFD6AC) */}
              {(activeTab === "all" || activeTab === "10km") && (
                <>
                  <Polyline
                    path={polyline10k}
                    strokeWeight={activeTab === "10km" ? 10 : 3}
                    strokeColor="#EFD6AC"
                    strokeOpacity={activeTab === "10km" ? 0.45 : 0.25}
                    strokeStyle="solid"
                    zIndex={activeTab === "10km" ? 10 : 2}
                  />
                  {activeTab === "10km" && (
                    <Polyline
                      path={polyline10k}
                      strokeWeight={5}
                      strokeColor="#EFD6AC"
                      strokeOpacity={1.0}
                      strokeStyle="solid"
                      zIndex={11}
                    />
                  )}
                </>
              )}

              {/* 14.46km 코스 폴리라인 (Burnt Orange #C44900) */}
              {(activeTab === "all" || activeTab === "14.46km") && (
                <>
                  <Polyline
                    path={polyline14k}
                    strokeWeight={activeTab === "14.46km" ? 11 : 3}
                    strokeColor="#C44900"
                    strokeOpacity={activeTab === "14.46km" ? 0.45 : 0.25}
                    strokeStyle="solid"
                    zIndex={activeTab === "14.46km" ? 10 : 2}
                  />
                  {activeTab === "14.46km" && (
                    <Polyline
                      path={polyline14k}
                      strokeWeight={5}
                      strokeColor="#C44900"
                      strokeOpacity={1.0}
                      strokeStyle="solid"
                      zIndex={11}
                    />
                  )}
                </>
              )}

              {/* 커스텀 오버레이 1: 출발 및 도착 - 세종시청 앞 광장 (항상 노출) */}
              <CustomOverlayMap
                position={CITY_HALL}
                yAnchor={1.15}
                zIndex={35}
              >
                <div className="kakao-custom-overlay flex flex-col items-center">
                  <div className="px-3 py-1.5 rounded-xl bg-[#04151F]/95 backdrop-blur-md border border-burnt-orange shadow-2xl flex flex-col items-center mb-1">
                    <span className="text-[9px] font-black text-burnt-orange tracking-wider">
                      출발 및 도착
                    </span>
                    <span className="text-[11px] font-bold text-white font-pretendard">
                      {EVENT_LOCATION}
                    </span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-6 h-6 rounded-full bg-burnt-orange animate-ping opacity-60" />
                    <span className="relative w-4 h-4 rounded-full bg-[#04151F] border-2 border-burnt-orange shadow-lg shadow-burnt-orange/50" />
                  </div>
                </div>
              </CustomOverlayMap>

              {/* 커스텀 오버레이 2: 이응다리 (상징 명소) */}
              <CustomOverlayMap
                position={IEUNG_CENTER}
                yAnchor={1.15}
                zIndex={25}
              >
                <div className="kakao-custom-overlay flex flex-col items-center">
                  <div className="px-2.5 py-1 rounded-xl bg-[#04151F]/95 backdrop-blur-md border border-[#EFD6AC]/60 shadow-xl flex flex-col items-center mb-1">
                    <span className="text-[9px] font-extrabold text-wheat tracking-wider">
                      상징 명소
                    </span>
                    <span className="text-[11px] font-bold text-white font-pretendard">
                      이응다리 (금강보행교)
                    </span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-[#04151F] border-2 border-wheat shadow-md shadow-wheat/50" />
                </div>
              </CustomOverlayMap>

              {/* 커스텀 오버레이 3: 5km 순환 거점 (이응다리 원형 전망대) */}
              {(activeTab === "all" || activeTab === "5km") && (
                <CustomOverlayMap
                  position={{ lat: 36.4939, lng: 127.28915 }}
                  yAnchor={1.15}
                  zIndex={24}
                >
                  <div className="kakao-custom-overlay flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-xl bg-[#04151F]/95 backdrop-blur-md border border-[#5E8C85]/60 shadow-xl flex flex-col items-center mb-1">
                      <span className="text-[9px] font-extrabold text-[#5E8C85] tracking-wider">
                        5km 순환 거점
                      </span>
                      <span className="text-[11px] font-bold text-white font-pretendard">
                        이응다리 원형 전망대 (반시계)
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#04151F] border-2 border-[#5E8C85] shadow-md" />
                  </div>
                </CustomOverlayMap>
              )}

              {/* 커스텀 오버레이 4: 10km 서측 반환점 (학나래교 방면) */}
              {(activeTab === "all" || activeTab === "10km") && (
                <CustomOverlayMap
                  position={{ lat: 36.476, lng: 127.254 }}
                  yAnchor={1.15}
                  zIndex={24}
                >
                  <div className="kakao-custom-overlay flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-xl bg-[#04151F]/95 backdrop-blur-md border border-[#EFD6AC]/60 shadow-xl flex flex-col items-center mb-1">
                      <span className="text-[9px] font-extrabold text-wheat tracking-wider">
                        10km 서측 반환점
                      </span>
                      <span className="text-[11px] font-bold text-white font-pretendard">
                        금강 남측 (학나래교 방면)
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#04151F] border-2 border-wheat shadow-md" />
                  </div>
                </CustomOverlayMap>
              )}

              {/* 커스텀 오버레이 5: 10km 북단 반환점 (이응다리 북단) */}
              {(activeTab === "all" || activeTab === "10km") && (
                <CustomOverlayMap
                  position={{ lat: 36.4958, lng: 127.28915 }}
                  yAnchor={1.15}
                  zIndex={24}
                >
                  <div className="kakao-custom-overlay flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-xl bg-[#04151F]/95 backdrop-blur-md border border-[#EFD6AC]/60 shadow-xl flex flex-col items-center mb-1">
                      <span className="text-[9px] font-extrabold text-wheat tracking-wider">
                        10km 북단 반환점
                      </span>
                      <span className="text-[11px] font-bold text-white font-pretendard">
                        이응다리 북단 광장
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#04151F] border-2 border-wheat shadow-md" />
                  </div>
                </CustomOverlayMap>
              )}

              {/* 커스텀 오버레이 6: 14.46km 서측 1차 반환점 (학나래교 인접) */}
              {(activeTab === "all" || activeTab === "14.46km") && (
                <CustomOverlayMap
                  position={{ lat: 36.4735, lng: 127.245 }}
                  yAnchor={1.15}
                  zIndex={24}
                >
                  <div className="kakao-custom-overlay flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-xl bg-[#04151F]/95 backdrop-blur-md border border-burnt-orange/60 shadow-xl flex flex-col items-center mb-1">
                      <span className="text-[9px] font-extrabold text-burnt-orange tracking-wider">
                        14.46km 1차 반환점
                      </span>
                      <span className="text-[11px] font-bold text-white font-pretendard">
                        금강 남측 (학나래교 인접)
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#04151F] border-2 border-burnt-orange shadow-md" />
                  </div>
                </CustomOverlayMap>
              )}

              {/* 커스텀 오버레이 7: 14.46km 순환 거점 (국립어린이박물관 · 호수공원 남측) */}
              {(activeTab === "all" || activeTab === "14.46km") && (
                <CustomOverlayMap
                  position={{ lat: 36.502, lng: 127.2925 }}
                  yAnchor={1.15}
                  zIndex={24}
                >
                  <div className="kakao-custom-overlay flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-xl bg-[#04151F]/95 backdrop-blur-md border border-burnt-orange/60 shadow-xl flex flex-col items-center mb-1">
                      <span className="text-[9px] font-extrabold text-burnt-orange tracking-wider">
                        14.46km 순환 거점
                      </span>
                      <span className="text-[11px] font-bold text-white font-pretendard">
                        국립어린이박물관 · 호수공원 남측
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#04151F] border-2 border-burnt-orange shadow-md" />
                  </div>
                </CustomOverlayMap>
              )}

              {/* 커스텀 오버레이 8: 14.46km 2차 반환점 (햇무리교 남단) */}
              {(activeTab === "all" || activeTab === "14.46km") && (
                <CustomOverlayMap
                  position={{ lat: 36.4905, lng: 127.3082 }}
                  yAnchor={1.15}
                  zIndex={24}
                >
                  <div className="kakao-custom-overlay flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-xl bg-[#04151F]/95 backdrop-blur-md border border-burnt-orange/60 shadow-xl flex flex-col items-center mb-1">
                      <span className="text-[9px] font-extrabold text-burnt-orange tracking-wider">
                        14.46km 2차 반환점
                      </span>
                      <span className="text-[11px] font-bold text-white font-pretendard">
                        햇무리교 남단
                      </span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#04151F] border-2 border-burnt-orange shadow-md" />
                  </div>
                </CustomOverlayMap>
              )}
            </Map>
          )}
        </div>

        {/* 지도 로딩 인디케이터 (필터 밖 오버레이) */}
        {!isMapLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#04151F] text-wheat space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-burnt-orange border-t-transparent animate-spin" />
            <p className="text-xs font-pretendard text-white/70">
              세종시 금강 일대의 카카오 지도 지리 정보를 불러오는 중입니다...
            </p>
          </div>
        )}

        {/* 우측 상단 빠른 지도 조작 도구 (필터 밖 오버레이) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
          <button
            onClick={handleRecenter}
            title="세종시청 앞 광장 중심 보기"
            className="p-2.5 rounded-xl bg-[#04151F]/90 hover:bg-burnt-orange text-wheat hover:text-white border border-white/15 shadow-xl transition-all flex items-center justify-center group"
          >
            <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-90" />
          </button>
          <button
            onClick={handleFitAll}
            title="전체 코스 한눈에 보기"
            className="p-2.5 rounded-xl bg-[#04151F]/90 hover:bg-burnt-orange text-wheat hover:text-white border border-white/15 shadow-xl transition-all flex items-center justify-center group"
          >
            <Maximize2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* 좌측 하단 활성 코스 정보 및 범례 카드 (필터 밖 오버레이, 100% 한글) */}
        <div className="absolute bottom-4 left-4 sm:left-6 z-20 max-w-sm sm:max-w-md bg-[#04151F]/95 backdrop-blur-md p-4 rounded-2xl border border-white/15 shadow-2xl text-white space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
            <span className="font-bold text-wheat flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
              <span>카카오 지도 기반 코스 안내</span>
            </span>
            <span className="text-[11px] text-white/50">
              {activeTab === "all" ? "전체 코스 표기 중" : "선택된 코스"}
            </span>
          </div>

          {/* 3가지 코스 간편 선택 칩 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* 14.46km 칩 */}
            <button
              onClick={() => handleTabClick("14.46km")}
              className={`p-2 rounded-xl text-left border transition-all ${
                activeTab === "14.46km"
                  ? "bg-burnt-orange/25 border-burnt-orange text-white"
                  : "bg-white/5 border-transparent text-white/70 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-burnt-orange shadow-sm shadow-burnt-orange" />
                <span className="font-bold">14.46km</span>
              </div>
              <p className="text-[10px] text-white/60 truncate mt-0.5">상징 코스</p>
            </button>

            {/* 10km 칩 */}
            <button
              onClick={() => handleTabClick("10km")}
              className={`p-2 rounded-xl text-left border transition-all ${
                activeTab === "10km"
                  ? "bg-[#EFD6AC]/20 border-[#EFD6AC] text-white"
                  : "bg-white/5 border-transparent text-white/70 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EFD6AC] shadow-sm shadow-[#EFD6AC]" />
                <span className="font-bold">10km</span>
              </div>
              <p className="text-[10px] text-white/60 truncate mt-0.5">도심 도전</p>
            </button>

            {/* 5km 칩 */}
            <button
              onClick={() => handleTabClick("5km")}
              className={`p-2 rounded-xl text-left border transition-all ${
                activeTab === "5km"
                  ? "bg-[#5E8C85]/20 border-[#5E8C85] text-white"
                  : "bg-white/5 border-transparent text-white/70 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5E8C85] shadow-sm shadow-[#5E8C85]" />
                <span className="font-bold">5km</span>
              </div>
              <p className="text-[10px] text-white/60 truncate mt-0.5">가족 걷기</p>
            </button>
          </div>

          {/* 선택된 코스 경로 안내 (100% 한글) */}
          {activeTab !== "all" && (
            <div className="pt-1 space-y-1.5 text-xs text-white/85">
              <div className="flex items-center justify-between text-[11px] text-wheat/90 font-medium">
                <span>거리: <strong>{courseDetails[activeTab].distance}</strong></span>
                <span>제한시간: <strong>{courseDetails[activeTab].timeLimit}</strong></span>
              </div>
              <p className="text-[11px] text-white/75 leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                {courseDetails[activeTab].desc}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}