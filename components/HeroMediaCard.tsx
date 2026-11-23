"use client";

import React, { useState, useEffect } from "react";
import { Film, Play, Sparkles, Youtube, ExternalLink } from "lucide-react";

interface MediaVideoItem {
  id: number;
  youtubeId: string;
  title: string;
  type: string;
  isMainExposure: boolean;
  createdAt: string;
}

interface HeroMediaCardProps {
  onOpenMediaModal?: () => void;
}

export default function HeroMediaCard({ onOpenMediaModal }: HeroMediaCardProps) {
  const [video, setVideo] = useState<MediaVideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchMainVideo = async () => {
      try {
        const res = await fetch("/api/media?main=true");
        const data = await res.json();
        if (data.success && data.video) {
          setVideo(data.video);
        }
      } catch (err) {
        console.warn("[HeroMediaCard] 영상 로딩 실패:", err);
      }
    };

    fetchMainVideo();
  }, []);

  // 기본 샘플 영상 (유튜브 식별자)
  const currentYoutubeId = video?.youtubeId || "o5P6K_26VfM";
  const currentTitle =
    video?.title || "2027 1446 세종런 공식 브랜드 필름 : 달린 만큼 골목이 켜집니다";
  const currentType = video?.type || "공식 홍보영상";

  return (
    <div className="w-full max-w-[390px] lg:max-w-[440px] bg-[#04151F]/95 backdrop-blur-md border border-[#EFD6AC]/30 shadow-2xl rounded-2xl p-4 sm:p-5 text-white transition-all duration-300 font-pretendard ring-1 ring-wheat/20">
      {/* 상단 라벨 & 상태 바 */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-burnt-orange/20 border border-burnt-orange/40 flex items-center justify-center text-burnt-orange">
            <Film className="w-3.5 h-3.5 text-burnt-orange" />
          </div>
          <span className="text-xs font-hunmin font-bold text-wheat tracking-wider">
            대회 공식 미디어
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-burnt-orange text-[10px] font-bold text-white uppercase tracking-wider">
          {currentType}
        </span>
      </div>

      {/* 비디오 재생 영역 (16:9) */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 aspect-video shadow-inner">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={currentTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div
            className="relative w-full h-full group cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            {/* 유튜브 고화질 썸네일 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${currentYoutubeId}/maxresdefault.jpg`}
              alt={currentTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentYoutubeId}/hqdefault.jpg`;
              }}
            />

            {/* 어두운 비네팅 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            {/* 중앙 재생 버튼 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-burnt-orange/90 text-white flex items-center justify-center shadow-xl shadow-burnt-orange/50 group-hover:scale-110 group-hover:bg-burnt-orange transition-all duration-300 ring-4 ring-white/20">
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              </div>
            </div>

            {/* 썸네일 우측 하단 재생 유도 뱃지 */}
            <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] text-wheat font-medium border border-white/10">
                <Youtube className="w-3 h-3 text-red-500 fill-current" />
                <span>영상 재생</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 영상 타이틀 */}
      <div className="mt-3">
        <h3 className="text-xs sm:text-sm font-hunmin font-bold text-white line-clamp-1 leading-snug">
          {currentTitle}
        </h3>
      </div>

      {/* 하단 캡션 및 전체 갤러리 링크 */}
      <div className="pt-2.5 mt-2.5 flex items-center justify-between text-[11px] text-white/60 border-t border-white/10">
        <span className="flex items-center gap-1 text-wheat/80 font-medium">
          <Sparkles className="w-3 h-3 text-burnt-orange" />
          <span>세종의 숨결을 담은 공식 영상</span>
        </span>

        {onOpenMediaModal ? (
          <button
            type="button"
            onClick={onOpenMediaModal}
            className="inline-flex items-center space-x-1 text-burnt-orange hover:text-wheat transition-colors font-bold text-[11px]"
          >
            <span>전체 영상</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        ) : (
          <a
            href="/community/media"
            className="inline-flex items-center space-x-1 text-burnt-orange hover:text-wheat transition-colors font-bold text-[11px]"
          >
            <span>전체 영상</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
