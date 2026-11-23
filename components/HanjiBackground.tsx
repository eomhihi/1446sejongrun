"use client";

import React from "react";

export default function HanjiBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-hanji-bg select-none"
    >
      {/* 
        한지 질감(Base Texture) 유지
        - 전체 배경 #F7F5F0 (bg-hanji-bg)
        - SVG feTurbulence 기반 fractalNoise를 opacity: 0.04, mix-blend-mode: multiply로 전체 오버레이
      */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='hanjiNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23hanjiNoise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* 
        1. 좌측 훈민정음 이미지 워터마크 (투명도 opacity-5 로 원복)
        - absolute left-0 top-0 w-[45%] md:w-[35%] h-full pointer-events-none
        - backgroundSize: '200% auto', backgroundPosition: 'right top', backgroundRepeat: 'repeat-y'
        - 원본 이미지의 '오른쪽 절반'에 해당하는 텍스트 뭉치가 화면의 '왼쪽 가장자리'에 온전하게 렌더링
        - 투명도: opacity-5 (0.05)로 시선을 빼앗지 않고 한지 베이스 배경에 아주 연하게 스며든 느낌만 부여
      */}
      <div
        className="absolute left-0 top-0 w-[45%] md:w-[35%] h-full pointer-events-none opacity-5 mix-blend-multiply transition-opacity duration-300"
        style={{
          backgroundImage: "url('/fonts/Hunmin_Jeongeum.svg')",
          backgroundSize: "200% auto",
          backgroundPosition: "right top",
          backgroundRepeat: "repeat-y",
        }}
      />
    </div>
  );
}
