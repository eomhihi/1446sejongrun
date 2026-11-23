"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, X, ChevronRight, Megaphone } from "lucide-react";

interface BannerItem {
  id: number;
  type: string;
  content: string;
  linkUrl?: string | null;
  isActive: boolean;
}

export default function TopBanner() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/announcements?type=BANNER");
        const data = await res.json();
        if (data.success && Array.isArray(data.banners)) {
          setBanners(data.banners);
        }
      } catch (err) {
        console.warn("[TopBanner] 공지 배너 로딩 실패:", err);
      }
    };

    fetchBanners();
  }, []);

  const activeBanner = banners.find((b) => b.isActive && !dismissedIds.includes(b.id));

  if (!activeBanner) return null;

  return (
    <aside
      aria-label="대회 긴급 공지"
      className="relative z-[60] bg-burnt-orange text-white px-4 py-2 sm:py-2.5 shadow-md border-b border-burnt-orange/30 font-pretendard transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2.5 overflow-hidden flex-1">
          <span className="flex-shrink-0 px-2 py-0.5 rounded bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 font-hunmin">
            <Megaphone className="w-3 h-3 text-wheat" />
            긴급 알림
          </span>
          {activeBanner.linkUrl ? (
            <a
              href={activeBanner.linkUrl}
              className="hover:underline flex items-center gap-1 truncate font-medium tracking-tight text-white/95"
            >
              <span className="truncate">{activeBanner.content}</span>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-wheat" />
            </a>
          ) : (
            <span className="truncate font-medium tracking-tight text-white/95">
              {activeBanner.content}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDismissedIds((prev) => [...prev, activeBanner.id])}
          className="p-1 rounded hover:bg-black/15 text-white/80 hover:text-white transition-colors flex-shrink-0"
          aria-label="배너 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
