"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RibbonShieldBadge() {
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-3 sm:left-6 md:left-10 z-50 pointer-events-auto"
      style={{ filter: "drop-shadow(0 6px 12px rgba(4, 21, 31, 0.25))" }}
    >
      <Link href="/" title="1446 세종런 메인으로 이동" className="block cursor-pointer group">
        {/* 
          원칙 1: 오각형 리본 배지(Ribbon Shield)
          배경 #C44900, 금빛/베이지(#EFD6AC) 이중 보더,
          화면 최상단에서 아래로 내려오는 클래식한 훈장/깃발 형태
        */}
        <div
          className="relative bg-burnt-orange text-white px-2.5 sm:px-4 pt-2.5 sm:pt-3 pb-5 sm:pb-6 flex flex-col items-center justify-start transition-transform group-hover:scale-105 duration-200"
          style={{
            width: "clamp(56px, 15vw, 68px)",
            clipPath: "polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)",
          }}
        >
          {/* 금빛/베이지(#EFD6AC) 내부 테두리 라인 */}
          <div
            className="absolute inset-[2.5px] sm:inset-[3px] border border-wheat/80 pointer-events-none"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)",
            }}
          />

          {/* 상단 장식 리벳 */}
          <div className="w-1.5 h-1.5 rounded-full bg-wheat mb-0.5 sm:mb-1" />

          {/* 러너 심볼 SVG */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 sm:w-6 sm:h-6 text-wheat fill-current mb-0.5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="14" cy="4" r="2.2" />
            <path d="M15.5 8.5c-.8-.5-1.9-.4-2.6.2L10 11.2V15h2v-2.8l1.8-1.5 1.2 5.3 4-1.2-.5-2-2.3.7-1.1-4.8 1.4-1.2c.4-.3.6-.8.5-1.3-.1-.5-.5-.9-1-.9h-.5zM7.5 13l2-1.2-1.5-3.3c-.3-.7-1-1-1.7-.8L3 8.7l.6 1.9 2.5-.8 1.4 3.2z" />
            <path d="M7 21h2v-4.5l-2-1.5V21z" />
          </svg>

          {/* 타이포그래피 */}
          <span className="text-[8px] sm:text-[9px] font-sans font-bold tracking-widest text-wheat/90 uppercase leading-none mb-0.5">
            2027
          </span>
          <span className="text-[10px] sm:text-[11px] font-sans font-black tracking-tight text-white leading-none mb-0.5">
            1446
          </span>
          <span className="text-[10px] sm:text-[11px] font-serif font-bold text-wheat tracking-wider leading-none">
            세종런
          </span>

          {/* 디바이더 */}
          <div className="w-4 sm:w-5 h-[1px] bg-wheat/50 my-0.5 sm:my-1" />
          <span className="text-[7px] sm:text-[8px] font-hunmin font-bold tracking-tight text-wheat/90 uppercase">
            세종
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
