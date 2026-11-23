"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Award, Shield, Sparkles, Building2, ExternalLink } from "lucide-react";

interface SponsorItem {
  id: number;
  sponsorName: string;
  tier: "메인" | "골드" | "실버" | "브론즈" | "현물";
  logoImageUrl: string;
  websiteUrl?: string | null;
  sortOrder: number;
}

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch("/api/sponsors");
        const data = await res.json();
        if (data.success && Array.isArray(data.sponsors)) {
          setSponsors(data.sponsors);
        }
      } catch (err) {
        console.warn("[SponsorsSection] 후원사 로딩 실패:", err);
      }
    };

    fetchSponsors();
  }, []);

  const handleImageError = (id: number) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const mainSponsors = sponsors.filter((s) => s.tier === "메인");
  const goldSponsors = sponsors.filter((s) => s.tier === "골드");
  const silverSponsors = sponsors.filter((s) => s.tier === "실버");
  const bronzeSponsors = sponsors.filter((s) => s.tier === "브론즈");
  const supplySponsors = sponsors.filter((s) => s.tier === "현물");

  const renderSponsorCard = (
    sponsor: SponsorItem,
    sizeClasses: string,
    textClasses: string
  ) => {
    const isError = imageErrors[sponsor.id];
    const CardContent = (
      <div
        className={`bg-white rounded-2xl border border-ink-black/10 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:border-burnt-orange/40 transition-all duration-200 group relative ${sizeClasses}`}
      >
        {!isError && sponsor.logoImageUrl ? (
          <div className="relative w-full h-12 sm:h-14 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sponsor.logoImageUrl}
              alt={sponsor.sponsorName}
              onError={() => handleImageError(sponsor.id)}
              className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
            />
          </div>
        ) : (
          <div className="w-full h-12 sm:h-14 flex flex-col items-center justify-center text-center">
            <Building2 className="w-5 h-5 text-burnt-orange/60 mb-1 group-hover:scale-110 transition-transform" />
            <span className={`font-hunmin font-bold text-ink-black leading-tight ${textClasses}`}>
              {sponsor.sponsorName}
            </span>
          </div>
        )}

        {sponsor.websiteUrl && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3.5 h-3.5 text-burnt-orange" />
          </div>
        )}

        <span className="text-[10px] text-ink-black/50 mt-1 truncate max-w-full font-pretendard">
          {sponsor.sponsorName}
        </span>
      </div>
    );

    if (sponsor.websiteUrl) {
      return (
        <a
          key={sponsor.id}
          href={sponsor.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {CardContent}
        </a>
      );
    }

    return <div key={sponsor.id}>{CardContent}</div>;
  };

  return (
    <section
      id="sponsors"
      className="relative py-20 sm:py-28 bg-hanji-bg/60 border-t border-ink-black/10 overflow-hidden font-pretendard"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 라벨 */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/20 text-burnt-orange text-xs font-hunmin font-bold tracking-widest mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>공식 후원 및 상생 파트너</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-hunmin font-bold text-ink-black tracking-tight">
            1446 세종런과 함께 달리는 기업
          </h2>
          <p className="text-xs sm:text-sm text-ink-black/70 mt-2 font-pretendard break-keep">
            세종의 미래를 밝히고 지역 골목 상권을 응원하는 공식 파트너사입니다.
          </p>
        </div>

        <div className="space-y-12">
          {/* 1. 메인 파트너 (Main Partners) */}
          {mainSponsors.length > 0 && (
            <div>
              <div className="flex items-center justify-center space-x-3 mb-5">
                <div className="w-8 h-[1px] bg-burnt-orange/40" />
                <h3 className="text-xs sm:text-sm font-bold font-hunmin text-burnt-orange tracking-widest uppercase">
                  주최 · 주관 및 메인 파트너
                </h3>
                <div className="w-8 h-[1px] bg-burnt-orange/40" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-4">
                {mainSponsors.map((s) =>
                  renderSponsorCard(s, "h-24 sm:h-28 border-burnt-orange/25 bg-white shadow-sm", "text-sm sm:text-base")
                )}
              </div>
            </div>
          )}

          {/* 2. 골드 파트너 (Gold Partners) */}
          {goldSponsors.length > 0 && (
            <div>
              <div className="flex items-center justify-center space-x-3 mb-5">
                <div className="w-8 h-[1px] bg-ink-black/20" />
                <h3 className="text-xs sm:text-sm font-bold font-pretendard text-ink-black/70 tracking-wider">
                  골드 파트너 (GOLD)
                </h3>
                <div className="w-8 h-[1px] bg-ink-black/20" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {goldSponsors.map((s) =>
                  renderSponsorCard(s, "h-20 sm:h-24", "text-xs sm:text-sm")
                )}
              </div>
            </div>
          )}

          {/* 3. 실버 및 브론즈 파트너 (Silver & Bronze) */}
          {(silverSponsors.length > 0 || bronzeSponsors.length > 0) && (
            <div>
              <div className="flex items-center justify-center space-x-3 mb-5">
                <div className="w-8 h-[1px] bg-ink-black/20" />
                <h3 className="text-xs sm:text-sm font-bold font-pretendard text-ink-black/70 tracking-wider">
                  공식 협력 기관 및 파트너
                </h3>
                <div className="w-8 h-[1px] bg-ink-black/20" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[...silverSponsors, ...bronzeSponsors].map((s) =>
                  renderSponsorCard(s, "h-18 sm:h-20", "text-[11px]")
                )}
              </div>
            </div>
          )}

          {/* 4. 현물 및 보급 협찬 (Official In-Kind & Suppliers) */}
          {supplySponsors.length > 0 && (
            <div>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-6 h-[1px] bg-ink-black/15" />
                <h3 className="text-[11px] sm:text-xs font-semibold text-ink-black/60 tracking-wider">
                  공식 보급 협찬 및 물품 후원
                </h3>
                <div className="w-6 h-[1px] bg-ink-black/15" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-3xl mx-auto">
                {supplySponsors.map((s) =>
                  renderSponsorCard(s, "h-16", "text-[10px]")
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
