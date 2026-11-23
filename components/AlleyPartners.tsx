"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Coffee,
  Utensils,
  Sparkles,
  MapPin,
  Tag,
  CheckCircle,
  ExternalLink,
  Search,
  Gift,
  Ticket,
  BadgePercent,
  Compass,
  Check,
} from "lucide-react";

export type DistrictType =
  | "1생활권"
  | "2생활권"
  | "3생활권"
  | "4생활권"
  | "5생활권"
  | "6생활권"
  | "조치원읍"
  | "면지역";

export interface DistrictOption {
  key: DistrictType;
  name: string;
  detail?: string;
  keywords: string[];
}

export const DISTRICT_OPTIONS: DistrictOption[] = [
  {
    key: "1생활권",
    name: "1생활권",
    detail: "고운, 도담, 아름, 어진, 종촌",
    keywords: ["고운", "도담", "아름", "어진", "종촌"],
  },
  {
    key: "2생활권",
    name: "2생활권",
    detail: "나성, 다정, 새롬, 한솔",
    keywords: ["나성", "다정", "새롬", "한솔"],
  },
  {
    key: "3생활권",
    name: "3생활권",
    detail: "보람, 대평, 소담",
    keywords: ["보람", "대평", "소담"],
  },
  {
    key: "4생활권",
    name: "4생활권",
    detail: "반곡, 집현",
    keywords: ["반곡", "집현"],
  },
  {
    key: "5생활권",
    name: "5생활권",
    detail: "다솜, 용호, 합강",
    keywords: ["다솜", "용호", "합강"],
  },
  {
    key: "6생활권",
    name: "6생활권",
    detail: "누리, 산울, 한별, 해밀",
    keywords: ["누리", "산울", "한별", "해밀"],
  },
  {
    key: "조치원읍",
    name: "조치원읍",
    detail: "전통시장 및 원도심 일대",
    keywords: ["조치원"],
  },
  {
    key: "면지역",
    name: "면 지역",
    detail: "연기, 연동, 부강, 금남, 장군, 연서, 전의, 전동, 소정",
    keywords: [
      "연기면",
      "연동면",
      "부강면",
      "금남면",
      "장군면",
      "연서면",
      "전의면",
      "전동면",
      "소정면",
      "면 ",
    ],
  },
];

/**
 * 주소 텍스트 기반 세종시 8대 생활권 자동 판별 유틸리티
 */
export function detectDistrict(addr: string): DistrictType {
  const a = addr || "";
  // 1. 조치원읍
  if (a.includes("조치원")) return "조치원읍";

  // 2. 면 지역
  const myeonKeywords = [
    "연기면",
    "연동면",
    "부강면",
    "금남면",
    "장군면",
    "연서면",
    "전의면",
    "전동면",
    "소정면",
    "면 ",
  ];
  if (myeonKeywords.some((k) => a.includes(k)) || /([가-힣]+면)/.test(a)) {
    return "면지역";
  }

  // 3. 1~6생활권
  if (["고운", "도담", "아름", "어진", "종촌"].some((k) => a.includes(k))) return "1생활권";
  if (["나성", "다정", "새롬", "한솔"].some((k) => a.includes(k))) return "2생활권";
  if (["보람", "대평", "소담"].some((k) => a.includes(k))) return "3생활권";
  if (["반곡", "집현"].some((k) => a.includes(k))) return "4생활권";
  if (["다솜", "용호", "합강"].some((k) => a.includes(k))) return "5생활권";
  if (["누리", "산울", "한별", "해밀"].some((k) => a.includes(k))) return "6생활권";

  return "1생활권";
}

interface PartnerShop {
  id: number;
  name: string;
  category: "cafe" | "food" | "wellness" | "culture";
  categoryName: string;
  district: DistrictType;
  districtName: string;
  location: string;
  benefit: string;
  runnerSet?: string; // 14,460원 러너 세트 메뉴
  yeominjeon: boolean;
  voucherAccepted: boolean; // 상생 바우처 10,000원 사용 가능
  distanceFromCourse: string;
  badge?: string;
}

const PARTNER_SHOPS: PartnerShop[] = [
  {
    id: 1,
    name: "세종 훈민 제빵소",
    category: "cafe",
    categoryName: "카페·베이커리",
    district: "2생활권",
    districtName: "2생활권 (나성동)",
    location: "세종시 나성로 96 어반아트리움 P2 1층",
    benefit: "배번호 제시 시 한글 단팥빵 1개 무료 + 전 음료 20% 할인",
    runnerSet: "14,460원 러너 세트: 단백질 베이글 샌드위치 + 훈민 콜드브루 보틀",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "코스 12.8km 지점 바로 앞",
    badge: "공식 달림이 쉼터",
  },
  {
    id: 2,
    name: "이응다리 로스터리",
    category: "cafe",
    categoryName: "카페·베이커리",
    district: "3생활권",
    districtName: "3생활권 (보람동)",
    location: "세종시 호려울로 19 금강시티빌딩 2층",
    benefit: "완주 메달 인증 시 상징 훈민 블렌드 콜드브루 1잔 증정",
    runnerSet: "14,460원 러너 세트: 스페셜티 핸드드립 2잔 + 한글 수제 쿠키 4종",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "코스 8.5km 금강 반환점",
    badge: "금강 전망 맛집",
  },
  {
    id: 3,
    name: "도담 세종 숯불갈비",
    category: "food",
    categoryName: "지역 맛집",
    district: "1생활권",
    districtName: "1생활권 (도담동)",
    location: "세종시 보듬9로 11 도담프라자 1층",
    benefit: "마라톤 참가자 테이블당 한우 육회 1접시 서비스 + 10% 할인",
    runnerSet: "14,460원 러너 세트: 한우 불고기 뚝배기 영양 솥밥 정식",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "코스 4.2km 청사 인근",
  },
  {
    id: 4,
    name: "시청광장 달림이 쉼터",
    category: "wellness",
    categoryName: "건강·운동",
    district: "3생활권",
    districtName: "3생활권 (보람동)",
    location: "세종시 호려울로 19 시청광장 복합센터",
    benefit: "대회 당일 짐 보관 무료 & 근육 이완 폼롤러 스트레칭 제공",
    runnerSet: "14,460원 러너 세트: 리커버리 스포츠 타월 + 전해질 음료 2종 팩",
    yeominjeon: false,
    voucherAccepted: true,
    distanceFromCourse: "대회 출발/도착 지점",
    badge: "달리기 동호회 제휴",
  },
  {
    id: 5,
    name: "조치원 전통 파닭 본가",
    category: "food",
    categoryName: "지역 맛집",
    district: "조치원읍",
    districtName: "조치원읍 (전통시장)",
    location: "세종시 조치원읍 장터길 24 전통시장 내",
    benefit: "완주 메달 제시 시 파닭 3,000원 즉시 할인 + 탄산음료 1캔 무료",
    runnerSet: "14,460원 러너 세트: 싱글 순살 파닭 박스 + 떡볶이 콤보",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "조치원 상권 연계 셔틀 운행",
    badge: "30년 전통 백년가게",
  },
  {
    id: 6,
    name: "어진동 한글 도자기 공방",
    category: "culture",
    categoryName: "문화·공방",
    district: "1생활권",
    districtName: "1생활권 (어진동)",
    location: "세종시 가름로 143 세종엠코타운 상가 2층",
    benefit: "훈민정음 자모 각인 도자기 컵 일일 강좌 30% 할인",
    runnerSet: "14,460원 러너 세트: 세종 완주 기념 자모 각인 핸드메이드 잔 1개",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "코스 2.1km 지점",
  },
  {
    id: 7,
    name: "금강 보행교 국수주막",
    category: "food",
    categoryName: "지역 맛집",
    district: "3생활권",
    districtName: "3생활권 (대평동)",
    location: "세종시 종합운동장로 29 1층",
    benefit: "마라톤 완주자 잔치국수 곱빼기 무료 변경 + 동동주 1잔 서비스",
    runnerSet: "14,460원 러너 세트: 비빔국수 1그릇 + 해물파전 반접시 + 미니 동동주",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "코스 9.4km 이응다리 남측 출구",
  },
  {
    id: 8,
    name: "세종 상생 북카페 '세종실록'",
    category: "culture",
    categoryName: "문화·공방",
    district: "2생활권",
    districtName: "2생활권 (다정동)",
    location: "세종시 다정중앙로 45 3층",
    benefit: "도서 구매 시 10% 적립 + 아메리카노 1,000원 특가 제공",
    runnerSet: "14,460원 러너 세트: 독서노트 + 핸드드립 커피 + 바스크 치즈케이크",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "코스 13.5km 나성동 인접",
  },
  {
    id: 9,
    name: "반곡 수변 브런치 라운지",
    category: "cafe",
    categoryName: "카페·베이커리",
    district: "4생활권",
    districtName: "4생활권 (반곡동)",
    location: "세종시 반곡1길 22 수변테라스 1층",
    benefit: "완주 메달 제시 시 아메리카노 1잔 무료 + 브런치 메뉴 15% 할인",
    runnerSet: "14,460원 러너 세트: 단백질 아보카도 샌드위치 + 착즙 주스",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "코스 10.2km 지점 연계",
    badge: "수변 테라스 명소",
  },
  {
    id: 10,
    name: "합강 캠핑 바베큐 가든",
    category: "food",
    categoryName: "지역 맛집",
    district: "5생활권",
    districtName: "5생활권 (합강동)",
    location: "세종시 합강길 45 캠핑빌리지 1동",
    benefit: "러너 배번호 인증 시 모둠 바베큐 소시지 플래터 무료 제공",
    runnerSet: "14,460원 러너 세트: 직화 목살 덮밥 도시락 + 전해질 음료",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "합강 오토캠핑장 인접",
    badge: "캠핑 감성 명소",
  },
  {
    id: 11,
    name: "해밀 힐링 티하우스",
    category: "cafe",
    categoryName: "카페·베이커리",
    district: "6생활권",
    districtName: "6생활권 (해밀동)",
    location: "세종시 해밀3로 31 1층",
    benefit: "배번호 제시 시 전통 수제 대추차 1+1 제공",
    runnerSet: "14,460원 러너 세트: 한글 전통 다과상 + 하동 녹차 2인 세트",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "6생활권 생태천 인접",
    badge: "전통 힐링 찻집",
  },
  {
    id: 12,
    name: "금남 대평장터 손두부마을",
    category: "food",
    categoryName: "지역 맛집",
    district: "면지역",
    districtName: "면 지역 (금남면)",
    location: "세종시 금남면 용포로 67 1층",
    benefit: "완주 메달 제시 시 순두부 뚝배기 1그릇 무료 증정",
    runnerSet: "14,460원 러너 세트: 얼큰 해물순두부 + 녹두전 반접시 + 도토리묵",
    yeominjeon: true,
    voucherAccepted: true,
    distanceFromCourse: "금남면 상권 연계",
    badge: "3대째 전통 손두부",
  },
];

export default function AlleyPartners() {
  const [shops, setShops] = useState<PartnerShop[]>(PARTNER_SHOPS);
  const [selectedDistricts, setSelectedDistricts] = useState<DistrictType[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [claimedShopId, setClaimedShopId] = useState<number | null>(null);

  // DB(Vercel Postgres)에 업로드된 참여 상점 최신 목록 실시간 연동
  useEffect(() => {
    const fetchLiveShops = async () => {
      try {
        const res = await fetch("/api/shops");
        const data = await res.json();
        if (data.success && Array.isArray(data.shops) && data.shops.length > 0) {
          const mapped: PartnerShop[] = data.shops.map((s: any, idx: number) => {
            const rawCat = s.category || "";
            const isCafe = rawCat.includes("카페") || rawCat.toLowerCase().includes("cafe");
            const isFood = rawCat.includes("식당") || rawCat.includes("음식") || rawCat.toLowerCase().includes("food");
            const categoryType = isCafe ? "cafe" : isFood ? "food" : "culture";

            // 주소 기반 세종시 8대 생활권 자동 판별
            const addr = s.address || "";
            const district = detectDistrict(addr);
            const dongMatch = addr.match(/([가-힣]+(?:동|읍|면|리))/);
            const dongText = dongMatch ? dongMatch[1] : "";

            return {
              id: s.id || idx + 1,
              name: s.shopName || s.name || "참여 상점",
              category: categoryType,
              categoryName: rawCat || (isCafe ? "카페·베이커리" : isFood ? "지역 맛집" : "문화·체험"),
              district,
              districtName: dongText ? `${district} (${dongText})` : `${district}`,
              location: addr,
              benefit: s.discountInfo || "완주 메달 및 배번호 제시 시 할인 혜택",
              runnerSet: s.discountInfo?.includes("14,460") || s.discountInfo?.includes("14460")
                ? s.discountInfo
                : `14,460원 러너 전용 에너지 세트 (수용: ${s.capacity || 30}석)`,
              yeominjeon: true,
              voucherAccepted: true,
              distanceFromCourse: s.capacity ? `수용 인원 ${s.capacity}명` : "코스 인근 상생 상권",
              badge: s.capacity && s.capacity >= 50 ? "단체 크루 추천" : "공식 달림이 쉼터",
            };
          });
          setShops(mapped);
        }
      } catch (err) {
        console.warn("[AlleyPartners] Failed to load live shops from DB, using fallback:", err);
      }
    };

    fetchLiveShops();
  }, []);

  const toggleDistrict = (key: DistrictType) => {
    setSelectedDistricts((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const clearDistricts = () => {
    setSelectedDistricts([]);
  };

  const categories = [
    { key: "all", label: "전체 업종", icon: Store },
    { key: "cafe", label: "카페·베이커리", icon: Coffee },
    { key: "food", label: "지역 맛집", icon: Utensils },
    { key: "wellness", label: "건강·운동", icon: Sparkles },
    { key: "culture", label: "문화·체험", icon: Tag },
  ];

  const filteredShops = shops.filter((shop) => {
    const matchesDistrict =
      selectedDistricts.length === 0 || selectedDistricts.includes(shop.district);
    const matchesCategory =
      categoryFilter === "all" || shop.category === categoryFilter;
    const matchesSearch =
      searchTerm === "" ||
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.benefit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shop.runnerSet && shop.runnerSet.toLowerCase().includes(searchTerm.toLowerCase())) ||
      shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.districtName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDistrict && matchesCategory && matchesSearch;
  });

  const handleClaim = (shopId: number) => {
    setClaimedShopId(shopId);
    setTimeout(() => {
      setClaimedShopId(null);
    }, 2500);
  };

  return (
    <section
      id="after-run"
      className="relative py-24 sm:py-32 bg-transparent border-t border-ink-black/10 overflow-hidden font-pretendard"
    >
      {/* 구 앵커 연결 호환 태그 */}
      <span id="partners" className="absolute -top-20 opacity-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 타이틀 및 슬로건 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center space-x-2 text-burnt-orange font-bold text-xs uppercase tracking-widest mb-2.5 font-pretendard">
              <Store className="w-4 h-4" />
              <span>1446 애프터런 · 상권 활성화 프로젝트</span>
            </div>
            {/* 타이틀: font-hunmin 적용 */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-hunmin font-bold text-ink-black tracking-tight leading-tight">
              1446 애프터런 (상권 활성화)
            </h2>
            {/* 핵심 슬로건 강조 */}
            <p className="text-lg sm:text-xl md:text-2xl font-hunmin font-bold text-burnt-orange mt-2.5">
              “완주 직후 애프터런, 세종시 상권에서 즐기세요”
            </p>
            <p className="text-sm sm:text-base font-pretendard text-ink-black/75 mt-1.5 max-w-2xl">
              완주선에서 달리기가 끝나면 세종 골목의 축제가 시작됩니다. 5,000명의 러너가 함께 만드는
              전국 유일의 상생 애프터런을 만나보세요.
            </p>
          </div>

          {/* 핵심 혜택 하이라이트 배지: 골목 상생 바우처 10,000원 */}
          <div className="px-5 py-4 rounded-2xl bg-gradient-to-br from-[#04151F] to-[#0A2533] border border-burnt-orange/40 shadow-xl flex items-center space-x-4 flex-shrink-0 text-white font-pretendard">
            <div className="w-12 h-12 rounded-xl bg-burnt-orange/20 border border-burnt-orange/40 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-6 h-6 text-burnt-orange" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-burnt-orange animate-ping" />
                <span className="text-[11px] text-wheat uppercase font-bold tracking-wider">
                  참가자 전원 제공
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5">
                골목 상생 바우처 <strong className="text-wheat font-mono font-black">10,000원권</strong>
              </p>
              <span className="text-[10px] text-white/60">세종시 300여 가맹점 즉시 사용 가능</span>
            </div>
          </div>
        </div>

        {/* 
          [주요 혜택 3대 축 카드 UI]
          1) 완주 메달 및 배번호 제시 시 할인 혜택
          2) 14,460원 러너 세트 (골목 맛집·카페 전용 14,460원 기획 메뉴)
          3) 스탬프 투어 및 온누리상품권/지역화폐 연계 혜택
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 font-pretendard">
          {/* 카드 1: 완주 메달 & 배번호 제시 할인 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-sm border border-ink-black/10 rounded-2xl p-6 sm:p-7 shadow-traditional flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-burnt-orange/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-burnt-orange/10 flex items-center justify-center text-burnt-orange mb-4 group-hover:scale-105 transition-transform">
                <BadgePercent className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-burnt-orange uppercase tracking-wider font-mono">
                혜택 01
              </span>
              <h3 className="text-lg sm:text-xl font-hunmin font-bold text-ink-black mt-1 mb-2.5">
                완주 메달 및 배번호 제시 할인
              </h3>
              <p className="text-xs sm:text-sm text-ink-black/75 leading-relaxed">
                대회 당일 배번호 또는 훈민정음 완주 메달을 보여주시면, 세종시 300여 함께하는 상점에서
                <strong className="text-ink-black font-semibold"> 최대 10~30% 즉시 할인</strong>과
                한글 단팥빵, 수제 음료 등 웰컴 서비스를 제공합니다.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-ink-black/10 flex items-center justify-between text-xs text-ink-black/60 font-medium">
              <span>적용 대상: 전 참가자</span>
              <span className="text-burnt-orange font-semibold">배번호 · 메달 제시</span>
            </div>
          </motion.div>

          {/* 카드 2: 14,460원 러너 세트 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-ink-black text-white rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between relative overflow-hidden border border-wheat/25 group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-wheat/10 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-wheat/15 flex items-center justify-center text-wheat mb-4 group-hover:scale-105 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-wheat uppercase tracking-wider font-mono">
                기획 메뉴 02
              </span>
              <h3 className="text-lg sm:text-xl font-hunmin font-bold text-wheat mt-1 mb-2.5">
                14,460원 러너 전용 기획 세트
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                세종의 맛집과 베이커리·카페가 1446 세종런을 위해 특별 기획한
                <strong className="text-wheat font-semibold"> ‘14,460원 한정 메뉴’</strong>!
                러너 전용 단백질 영양 식사부터 스페셜티 커피·디저트 콤보까지 1446 상징 가격으로 즐기세요.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60 font-medium">
              <span>바우처 10,000원 결제 차감 가능</span>
              <span className="text-wheat font-mono font-bold">₩ 14,460</span>
            </div>
          </motion.div>

          {/* 카드 3: 스탬프 투어 및 온누리·지역화폐 연계 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-sm border border-ink-black/10 rounded-2xl p-6 sm:p-7 shadow-traditional flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 mb-4 group-hover:scale-105 transition-transform">
                <Gift className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
                연계 혜택 03
              </span>
              <h3 className="text-lg sm:text-xl font-hunmin font-bold text-ink-black mt-1 mb-2.5">
                스탬프 투어 및 지역화폐 연계
              </h3>
              <p className="text-xs sm:text-sm text-ink-black/75 leading-relaxed">
                세종 골목 상점 3곳 이상 방문 스탬프 적립 시
                <strong className="text-ink-black font-semibold"> ‘훈민정음 한정판 굿즈’</strong>를 증정합니다.
                세종 지역화폐 ‘여민전’ 10% 캐시백 및 디지털 온누리상품권 100% 결제 연계로 더 알뜰하게 소비하세요.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-ink-black/10 flex items-center justify-between text-xs text-ink-black/60 font-medium">
              <span>스탬프 3곳 달성 선물</span>
              <span className="text-emerald-700 font-semibold">여민전 · 온누리상품권</span>
            </div>
          </motion.div>
        </div>

        {/* 상점 검색 및 생활권/업종 필터 영역 */}
        <div className="space-y-4 mb-6 font-pretendard bg-white/80 p-4 sm:p-5 rounded-2xl border border-ink-black/10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-ink-black/10">
            <div>
              <h4 className="text-base font-hunmin font-bold text-ink-black flex items-center gap-2">
                <span>1446 애프터런 함께하는 상점 목록</span>
                <span className="text-xs font-pretendard px-2.5 py-0.5 rounded-full bg-burnt-orange text-white font-bold">
                  총 {filteredShops.length}곳
                </span>
              </h4>
              <p className="text-xs text-ink-black/65 mt-0.5">
                완주 메달 및 배번호 제시 시 할인 혜택과 14,460원 러너 세트가 준비된 상점입니다.
              </p>
            </div>

            {/* 검색창 */}
            <div className="relative w-full lg:w-72 flex-shrink-0">
              <Search className="w-4 h-4 text-ink-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="상호명, 혜택, 동 이름 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-ink-black/15 rounded-xl text-xs text-ink-black placeholder:text-ink-black/40 focus:outline-none focus:border-burnt-orange shadow-xs font-pretendard"
              />
            </div>
          </div>

          {/* 상단 드롭다운 및 칩 필터링: 생활권 & 업종 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* 생활권 드롭다운 필터 */}
            <div className="flex items-center space-x-2">
              <label htmlFor="district-select" className="text-xs font-bold text-ink-black/70 flex items-center gap-1 flex-shrink-0">
                <Compass className="w-3.5 h-3.5 text-burnt-orange" />
                <span>생활권:</span>
              </label>
              <select
                id="district-select"
                value={selectedDistricts.length === 1 ? selectedDistricts[0] : selectedDistricts.length === 0 ? "all" : "multi"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    setSelectedDistricts([]);
                  } else {
                    setSelectedDistricts([val as DistrictType]);
                  }
                }}
                className="w-full bg-white border border-ink-black/15 rounded-xl px-3 py-1.5 text-xs text-ink-black font-medium focus:outline-none focus:border-burnt-orange shadow-xs"
              >
                <option value="all">전체 생활권 (세종시 전역 300곳)</option>
                {DISTRICT_OPTIONS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.name} {d.detail ? `(${d.detail})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 업종 드롭다운 필터 */}
            <div className="flex items-center space-x-2">
              <label htmlFor="category-select" className="text-xs font-bold text-ink-black/70 flex items-center gap-1 flex-shrink-0">
                <Store className="w-3.5 h-3.5 text-burnt-orange" />
                <span>업종:</span>
              </label>
              <select
                id="category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-ink-black/15 rounded-xl px-3 py-1.5 text-xs text-ink-black font-medium focus:outline-none focus:border-burnt-orange shadow-xs"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 빠른 생활권 칩 버튼 */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-ink-black/5">
            <span className="text-[11px] font-bold text-ink-black/50 flex-shrink-0 mr-1">
              빠른 선택:
            </span>
            <button
              type="button"
              onClick={clearDistricts}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                selectedDistricts.length === 0
                  ? "bg-ink-black text-wheat font-bold shadow-xs"
                  : "bg-white text-ink-black/70 border border-ink-black/10 hover:border-ink-black/30"
              }`}
            >
              전체
            </button>
            {DISTRICT_OPTIONS.map((d) => {
              const isSelected = selectedDistricts.includes(d.key);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => {
                    if (selectedDistricts.includes(d.key)) {
                      setSelectedDistricts(selectedDistricts.filter((k) => k !== d.key));
                    } else {
                      setSelectedDistricts([d.key]);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                    isSelected
                      ? "bg-burnt-orange text-white shadow-xs font-bold"
                      : "bg-white text-ink-black/70 border border-ink-black/10 hover:border-ink-black/30"
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 컴팩트 리스트 / 테이블 형태: [생활권] | [상호명] | [애프터런 할인/제공 혜택] */}
        <div className="bg-white rounded-2xl border border-ink-black/10 shadow-traditional overflow-hidden font-pretendard">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-12 bg-wheat/30 border-b border-ink-black/15 py-3 px-4 sm:px-6 text-xs font-bold text-ink-black">
            <div className="col-span-3 sm:col-span-2 text-burnt-orange flex items-center">
              [생활권]
            </div>
            <div className="col-span-4 sm:col-span-3 text-ink-black flex items-center">
              [상호명]
            </div>
            <div className="col-span-5 sm:col-span-7 text-ink-black flex items-center">
              [애프터런 할인/제공 혜택]
            </div>
          </div>

          {/* 테이블 바디 (스크롤 가능한 리스트) */}
          <div className="divide-y divide-ink-black/10 max-h-[620px] overflow-y-auto">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="grid grid-cols-12 py-3 px-4 sm:px-6 text-xs items-center hover:bg-wheat/15 transition-colors gap-2"
              >
                {/* 1. 생활권 */}
                <div className="col-span-3 sm:col-span-2 font-medium text-slate-grey flex items-center gap-1.5 pr-2">
                  <span className="px-2 py-0.5 rounded bg-wheat/40 text-ink-black/80 font-semibold text-[11px] truncate">
                    {shop.districtName || shop.district}
                  </span>
                </div>

                {/* 2. 상호명 */}
                <div className="col-span-4 sm:col-span-3 pr-2">
                  <div className="font-hunmin font-bold text-ink-black text-xs sm:text-sm truncate">
                    {shop.name}
                  </div>
                  <div className="text-[10px] text-ink-black/50 truncate font-pretendard mt-0.5">
                    {shop.location}
                  </div>
                </div>

                {/* 3. 애프터런 할인/제공 혜택 */}
                <div className="col-span-5 sm:col-span-7 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="text-ink-black/90 font-medium leading-tight">
                    <span>{shop.benefit}</span>
                    {shop.runnerSet && (
                      <span className="block sm:inline sm:ml-2 text-burnt-orange font-semibold text-[11px]">
                        · 14,460원 기획: {shop.runnerSet}
                      </span>
                    )}
                  </div>
                  {shop.voucherAccepted && (
                    <span className="self-start sm:self-auto flex-shrink-0 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      바우처 사용
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-ink-black/20 font-pretendard mt-4">
            <Store className="w-10 h-10 text-ink-black/30 mx-auto mb-2" />
            <p className="text-sm text-ink-black/60 font-medium">
              조건에 맞는 상점을 찾을 수 없습니다. 생활권이나 업종 필터를 변경해 보세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
