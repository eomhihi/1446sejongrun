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

export default function MainFeaturedVideo({
  onOpenMediaModal,
}: {
  onOpenMediaModal?: () => void;
}) {
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
        console.warn("[MainFeaturedVideo] 메인 영상 로딩 실패:", err);
      }
    };

    fetchMainVideo();
  }, []);

  // 기본 영상 (유튜브 식별자)
  const currentYoutubeId = video?.youtubeId || "o5P6K_26VfM";
  const currentTitle =
    video?.title || "2027 1446 세종런 공식 브랜드 필름 : 달린 만큼 골목이 켜집니다";

  return (
    <section
      id="media-highlight"
      className="relative py-20 sm:py-28 bg-hanji-bg/80 border-t border-ink-black/10 overflow-hidden font-pretendard"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 라벨 및 타이틀 */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/25 text-burnt-orange text-xs font-hunmin font-bold tracking-widest mb-3">
            <Film className="w-3.5 h-3.5" />
            <span>대회 공식 미디어</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-hunmin font-bold text-ink-black tracking-tight leading-tight">
            영상으로 만나는 1446 세종런
          </h2>
          <p className="text-xs sm:text-sm text-ink-black/70 mt-2 font-pretendard break-keep">
            세종의 도심 랜드마크에서 골목 상권까지, 5,000명 러너의 뜨거운 숨결과 역동적인 레이스를 미리 확인하세요.
          </p>
        </div>

        {/* 
          [한폭의 액자 스타일링]
          - 영상 플레이어 외곽을 rounded-2xl ~ rounded-3xl로 부드럽게 라운딩
          - 은은한 갈색빛과 훈민정음 한지 테두리(border-burnt-orange/20, border-wheat/60)
          - 고풍스러운 전통 그림자(shadow-2xl shadow-ink-black/15)
        */}
        <div className="relative p-2.5 sm:p-4 rounded-3xl bg-white/90 border border-burnt-orange/25 shadow-2xl shadow-ink-black/15 ring-1 ring-wheat/40">
          {/* 액자 내측 매트(Matte) 여백 레이어 */}
          <div className="relative rounded-2xl overflow-hidden bg-ink-black border border-ink-black/20 aspect-video shadow-inner">
            {isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={currentTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
                {/* 유튜브 고화질 썸네일 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${currentYoutubeId}/maxresdefault.jpg`}
                  alt={currentTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // maxresdefault가 없는 경우 hqdefault로 폴백
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentYoutubeId}/hqdefault.jpg`;
                  }}
                />

                {/* 영상 위 어두운 비네팅 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/20 to-transparent pointer-events-none" />

                {/* 중앙 재생 버튼 (한지 & Burnt Orange 글로우) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-burnt-orange/90 text-white flex items-center justify-center shadow-xl shadow-burnt-orange/40 group-hover:scale-110 group-hover:bg-burnt-orange transition-all duration-300 ring-4 ring-white/30">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* 하단 영상 타이틀 바 */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white flex items-end justify-between gap-4 pointer-events-none">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-burnt-orange text-[10px] font-bold uppercase tracking-wider mb-1.5 inline-block">
                      {video?.type || "공식 홍보영상"}
                    </span>
                    <h3 className="text-base sm:text-xl font-hunmin font-bold text-white drop-shadow-md">
                      {currentTitle}
                    </h3>
                  </div>

                  <span className="hidden sm:inline-flex items-center space-x-1 text-xs text-wheat/90 font-medium">
                    <Youtube className="w-4 h-4 text-red-500 fill-current" />
                    <span>클릭하여 바로 재생</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 액자 하단 캡션 및 전체 영상 갤러리 열기 버튼 */}
          <div className="mt-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-black/70">
            <span className="font-hunmin text-ink-black/80">
              세종의 숨결을 담은 공식 영상 아카이브
            </span>
            {onOpenMediaModal && (
              <button
                type="button"
                onClick={onOpenMediaModal}
                className="inline-flex items-center space-x-1.5 text-burnt-orange hover:underline font-bold"
              >
                <span>전체 영상 갤러리 보기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
