"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Play,
  Youtube,
  ChevronRight,
  Sparkles,
  Search,
  Clock,
  Tag,
} from "lucide-react";
import GNB from "@/components/GNB";
import RibbonShieldBadge from "@/components/RibbonShieldBadge";
import Footer from "@/components/Footer";
import RegistrationModal from "@/components/RegistrationModal";

interface MediaVideoItem {
  id: number;
  youtubeId: string;
  title: string;
  type: string;
  isMainExposure: boolean;
  createdAt: string;
}

export default function CommunityMediaPage() {
  const [videos, setVideos] = useState<MediaVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlayId, setActivePlayId] = useState<string | null>("o5P6K_26VfM");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultTab, setRegisterDefaultTab] = useState<"register" | "lookup">("register");

  const handleOpenRegister = (tab?: "register" | "lookup") => {
    setRegisterDefaultTab(tab || "register");
    setIsRegisterOpen(true);
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/media", { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      } catch (err) {
        console.warn("[CommunityMediaPage] 영상 로딩 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // 기본 대표 영상
  const mainVideo = videos[0] || {
    id: 1,
    youtubeId: "o5P6K_26VfM",
    title: "2027 1446 세종런 공식 브랜드 필름 : 달린 만큼 골목이 켜집니다",
    type: "홍보영상",
    isMainExposure: true,
    createdAt: new Date().toISOString(),
  };

  const currentPlayYoutubeId = activePlayId || mainVideo.youtubeId;

  return (
    <div className="min-h-screen relative font-pretendard">
      {/* 최상단 리본 배지 */}
      <RibbonShieldBadge />

      {/* 상단 GNB */}
      <GNB
        onOpenRegister={handleOpenRegister}
        onOpenMedia={() => {}}
      />

      <main className="pt-28 sm:pt-36 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 브레드크럼 */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-ink-black/60">
          <Link href="/" className="hover:text-burnt-orange transition-colors">
            홈
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>커뮤니티</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-burnt-orange font-bold">미디어(영상)</span>
        </nav>

        {/* 상단 타이틀 헤더 배너 */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-ink-black/15 p-6 sm:p-10 shadow-xl mb-10 relative overflow-hidden">
          {/* 배경 전각 워터마크 */}
          <div className="absolute -right-6 -bottom-8 pointer-events-none opacity-5 font-hunmin text-8xl select-none">
            映像
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/30 text-burnt-orange text-xs font-bold font-hunmin mb-3">
            <span className="seal-stamp text-burnt-orange border-burnt-orange scale-90">미디어</span>
            <span>1446 SEJONG RUN MEDIA ARCHIVE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-hunmin font-bold text-ink-black leading-tight mb-3">
            공식 미디어 및 영상 갤러리
          </h1>
          <p className="text-sm sm:text-base text-ink-black/75 leading-relaxed max-w-3xl">
            1446 세종런의 공식 브랜드 필름 및 주요 영상 기록을 확인하실 수 있습니다.
            세종의 도심 랜드마크에서 골목 상권까지, 5,000명 러너가 만들어갈 역동적인 감동을 미리 만나보세요.
          </p>
        </div>

        {/* 메인 비디오 플레이어 영역 (액자 스타일링) */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-ink-black/15 p-4 sm:p-8 shadow-traditional mb-12">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-ink-black/10">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-burnt-orange text-white text-xs font-bold">
                {mainVideo.type || "공식 홍보영상"}
              </span>
              <h2 className="text-base sm:text-lg font-hunmin font-bold text-ink-black">
                {mainVideo.title}
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center space-x-1 text-xs text-ink-black/60 font-mono">
              <Youtube className="w-4 h-4 text-red-500 fill-current" />
              <span>공식 유튜브 연동</span>
            </span>
          </div>

          {/* 비디오 프레임 */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-ink-black/20 aspect-video shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${currentPlayYoutubeId}?autoplay=0&rel=0&modestbranding=1`}
              title={mainVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* 영상 설명 & 안내 캡션 */}
          <div className="mt-4 pt-4 border-t border-ink-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-black/70">
            <span className="font-hunmin text-ink-black/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
              <span>훈민정음 580돌 기념 1446 세종런 공식 브랜드 홍보영상</span>
            </span>
            <span className="text-[11px] text-ink-black/50">
              ※ 추가 공식 영상 및 현장 스케치는 대회 일정에 맞추어 순차 공개될 예정입니다.
            </span>
          </div>
        </div>

        {/* 영상 아카이브 목록 (현재 등록된 1개 샘플 영상 카드) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-hunmin font-bold text-ink-black flex items-center gap-2">
              <Film className="w-4 h-4 text-burnt-orange" />
              <span>등록된 영상 목록 ({videos.length}개)</span>
            </h3>
            <span className="text-xs text-slate-grey font-medium">
              대표 샘플 영상
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((v) => (
              <div
                key={v.id}
                onClick={() => setActivePlayId(v.youtubeId)}
                className={`bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden group shadow-sm hover:shadow-md ${
                  activePlayId === v.youtubeId
                    ? "border-burnt-orange ring-2 ring-burnt-orange/20"
                    : "border-ink-black/15 hover:border-burnt-orange/50"
                }`}
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-burnt-orange text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-burnt-orange text-white text-[10px] font-bold">
                    {v.type}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="text-xs sm:text-sm font-hunmin font-bold text-ink-black line-clamp-2 group-hover:text-burnt-orange transition-colors">
                    {v.title}
                  </h4>
                  <div className="mt-2.5 pt-2 border-t border-ink-black/10 flex items-center justify-between text-[11px] text-ink-black/50">
                    <span>1446 세종런 공식</span>
                    <span className="text-burnt-orange font-semibold">재생하기</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}
