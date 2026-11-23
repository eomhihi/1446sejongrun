"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Award,
  Compass,
  FileText,
  MessageSquare,
  Film,
  Store,
  HelpCircle,
  Bell,
  CheckCircle,
} from "lucide-react";
import { EVENT_LOCATION } from "@/constants/event";
import { useDDay } from "@/hooks/useDDay";

export interface SubMenuItem {
  name: string;
  href?: string;
  action?:
    | "register"
    | "lookup"
    | "notice"
    | "media"
    | "course-1446"
    | "course-10"
    | "course-5"
    | "guide";
  badge?: string;
}

export interface MainMenuItem {
  title: string;
  key: string;
  subItems: SubMenuItem[];
}

const NAV_CATEGORIES: MainMenuItem[] = [
  {
    title: "대회 안내",
    key: "about",
    subItems: [
      { name: "1446 브랜드 스토리", href: "#about" },
      { name: "대회 개요", href: "#about" },
      { name: "1446 애프터런", href: "#after-run", badge: "300곳" },
      { name: "기념품 안내", href: "/info/souvenir", badge: "훈민정음 메달" },
    ],
  },
  {
    title: "코스 안내",
    key: "courses",
    subItems: [
      {
        name: "14.46km 상징 코스",
        href: "/course?tab=14.46km",
        badge: "대표 코스",
      },
      { name: "10km 도심 도전", href: "/course?tab=10km" },
      { name: "5km 가족 걷기", href: "/course?tab=5km" },
    ],
  },
  {
    title: "참가신청/확인",
    key: "registration",
    subItems: [
      { name: "참가 신청하기", action: "register", badge: "선착순" },
      { name: "참가 확인 및 수정", action: "lookup" },
      { name: "참가자 유의사항", href: "/info/rules" },
    ],
  },
  {
    title: "커뮤니티",
    key: "community",
    subItems: [
      { name: "공지사항", href: "/community/notice" },
      { name: "FAQ", href: "/community/faq" },
      { name: "미디어(영상)", href: "/community/media", badge: "NEW" },
    ],
  },
];

interface GNBProps {
  onOpenRegister?: (defaultTab?: "register" | "lookup") => void;
  onOpenNotice?: () => void;
  onOpenMedia?: () => void;
}

export default function GNB({
  onOpenRegister,
  onOpenNotice,
  onOpenMedia,
}: GNBProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedKey, setMobileExpandedKey] = useState<string | null>(
    "about"
  );
  const { displayDday } = useDDay(1.6);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredKey(key);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredKey(null);
    }, 150);
  };

  const executeItemAction = (item: SubMenuItem) => {
    setHoveredKey(null);
    setMobileMenuOpen(false);

    if (item.action === "register") {
      if (onOpenRegister) {
        onOpenRegister("register");
      } else {
        router.push("/?modal=register");
      }
      return;
    }

    if (item.action === "lookup") {
      if (onOpenRegister) {
        onOpenRegister("lookup");
      } else {
        router.push("/?modal=lookup");
      }
      return;
    }

    if (item.action === "notice") {
      router.push("/community/notice");
      return;
    }

    if (item.action === "media") {
      if (onOpenMedia) {
        onOpenMedia();
      } else {
        router.push("/?modal=media");
      }
      return;
    }

    if (item.action === "course-1446") {
      router.push("/course?tab=14.46km");
      return;
    }
    if (item.action === "course-10") {
      router.push("/course?tab=10km");
      return;
    }
    if (item.action === "course-5") {
      router.push("/course?tab=5km");
      return;
    }

    if (item.href) {
      if (item.href.startsWith("/")) {
        router.push(item.href);
        return;
      }
      if (item.href.startsWith("#")) {
        if (pathname === "/") {
          const targetEl = document.querySelector(item.href);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          router.push(`/${item.href}`);
        }
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-pretendard ${
        isScrolled
          ? "bg-hanji-bg/95 backdrop-blur-md border-b border-ink-black/10 py-3 shadow-xs"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* 좌측 배지 공간 확보용 Spacer (좌측 오각형 배지가 위치함) */}
        <div className="w-14 sm:w-20 md:w-32 flex-shrink-0" />

        {/* 
          [한글런 벤치마킹 데스크톱 GNB 드롭다운 네비게이션]
          4대 대분류: [대회 안내] / [코스 안내] / [참가신청/확인] / [커뮤니티]
        */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
          {NAV_CATEGORIES.map((category) => {
            const isHovered = hoveredKey === category.key;

            return (
              <div
                key={category.key}
                onMouseEnter={() => handleMouseEnter(category.key)}
                onMouseLeave={handleMouseLeave}
                className="relative py-2"
              >
                {/* 대분류 버튼 */}
                <button
                  type="button"
                  className={`text-sm lg:text-base font-pretendard tracking-tight flex items-center space-x-1.5 transition-colors duration-200 py-1 ${
                    isHovered
                      ? "text-burnt-orange font-bold"
                      : "text-ink-black/85 hover:text-ink-black font-semibold"
                  }`}
                >
                  <span>{category.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isHovered ? "rotate-180 text-burnt-orange" : "text-ink-black/40"
                    }`}
                  />
                </button>

                {/* 호버 시 부드럽게 펼쳐지는 소분류 드롭다운 (한지 톤앤매너) */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-52 sm:w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-burnt-orange/20 shadow-2xl p-2 z-50 ring-1 ring-wheat/50"
                    >
                      {/* 미세 꼭짓점 삼각형 장식 */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-l border-t border-burnt-orange/20" />

                      <div className="space-y-1 relative z-10">
                        {category.subItems.map((sub) => (
                          <button
                            key={sub.name}
                            type="button"
                            onClick={() => executeItemAction(sub)}
                            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-burnt-orange/10 hover:text-burnt-orange text-ink-black/85 transition-all text-xs lg:text-sm font-medium flex items-center justify-between group"
                          >
                            <span className="font-semibold group-hover:translate-x-0.5 transition-transform">
                              {sub.name}
                            </span>
                            {sub.badge ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-burnt-orange/10 text-burnt-orange group-hover:bg-burnt-orange group-hover:text-white transition-colors">
                                {sub.badge}
                              </span>
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-burnt-orange" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* 우측 상단 유틸리티: D-DAY & 퀵 접수 버튼 */}
        <div className="hidden sm:flex items-center space-x-3">
          <div className="px-2.5 py-1 rounded-full border border-ink-black/15 bg-white/70 text-[11px] font-pretendard font-medium text-ink-black flex items-center space-x-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-burnt-orange animate-pulse" />
            <span className="font-bold text-burnt-orange font-mono">
              D-{String(displayDday).padStart(3, "0")}
            </span>
            <span className="text-ink-black/50 text-[10px]">|</span>
            <span className="text-ink-black/80">{EVENT_LOCATION}</span>
          </div>

          <button
            onClick={() => {
              if (onOpenRegister) {
                onOpenRegister("register");
              } else {
                router.push("/?modal=register");
              }
            }}
            className="px-4 py-1.5 bg-burnt-orange text-white hover:bg-burnt-orange/90 transition-all text-xs font-pretendard font-bold rounded-full flex items-center space-x-1 shadow-sm shadow-burnt-orange/30 hover:scale-105"
          >
            <span>참가 접수</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 모바일 상단 바 로고 & 햄버거 토글 */}
        <div className="flex md:hidden items-center space-x-2">
          <Link href="/" className="w-20 sm:w-24 flex-shrink-0 block">
            <Image
              src="/images/logo-1446.svg"
              alt="1446 세종런 로고"
              width={100}
              height={44}
              priority
              className="w-full h-auto drop-shadow-sm"
            />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-ink-black hover:text-burnt-orange focus:outline-none"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 모바일 아코디언 메뉴 드로어 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-hanji-bg/98 backdrop-blur-xl border-b border-ink-black/10 px-6 pt-4 pb-6 space-y-4 shadow-2xl font-pretendard overflow-hidden"
          >
            {/* 상단 D-DAY 배너 */}
            <div className="flex items-center justify-between pb-3 border-b border-ink-black/10">
              <span className="text-xs font-bold font-hunmin text-ink-black">
                2027 1446 세종런 마라톤
              </span>
              <span className="text-xs font-mono font-bold text-burnt-orange px-2.5 py-0.5 rounded-full bg-burnt-orange/10">
                대회까지 D-{String(displayDday).padStart(3, "0")}
              </span>
            </div>

            {/* 대분류 아코디언 목록 */}
            <div className="space-y-2">
              {NAV_CATEGORIES.map((category) => {
                const isExpanded = mobileExpandedKey === category.key;

                return (
                  <div
                    key={category.key}
                    className="border border-ink-black/10 rounded-2xl bg-white/80 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedKey(isExpanded ? null : category.key)
                      }
                      className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-sm text-ink-black"
                    >
                      <span>{category.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-burnt-orange" : "text-ink-black/40"
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-3 pt-1 space-y-1 bg-hanji-bg/50 border-t border-ink-black/5"
                        >
                          {category.subItems.map((sub) => (
                            <button
                              key={sub.name}
                              type="button"
                              onClick={() => executeItemAction(sub)}
                              className="w-full text-left py-2 px-2.5 rounded-lg text-xs font-medium text-ink-black/80 hover:text-burnt-orange hover:bg-burnt-orange/10 flex items-center justify-between transition-colors"
                            >
                              <span>{sub.name}</span>
                              {sub.badge && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-burnt-orange/10 text-burnt-orange font-bold">
                                  {sub.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* 모바일 참가신청 CTA */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenRegister) {
                    onOpenRegister("register");
                  } else {
                    router.push("/?modal=register");
                  }
                }}
                className="w-full py-3 bg-burnt-orange text-white text-sm font-bold rounded-2xl text-center shadow-lg shadow-burnt-orange/30 flex items-center justify-center space-x-1.5"
              >
                <span>참가신청 바로가기</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
