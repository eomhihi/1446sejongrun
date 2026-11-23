"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Pin,
  ChevronRight,
  Calendar,
  AlertCircle,
  FileText,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import GNB from "@/components/GNB";
import RibbonShieldBadge from "@/components/RibbonShieldBadge";
import Footer from "@/components/Footer";
import RegistrationModal from "@/components/RegistrationModal";
import MediaModal from "@/components/MediaModal";

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}

export default function NoticeListPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "IMPORTANT" | "NORMAL">("ALL");

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultTab, setRegisterDefaultTab] = useState<"register" | "lookup">("register");
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const handleOpenRegister = (tab?: "register" | "lookup") => {
    setRegisterDefaultTab(tab || "register");
    setIsRegisterOpen(true);
  };

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/notices", { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      } catch (err) {
        console.error("공지사항 목록 불러오기 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "IMPORTANT") return item.isImportant;
    if (filterType === "NORMAL") return !item.isImportant;
    return true;
  });

  return (
    <div className="min-h-screen relative font-pretendard">
      {/* 최상단 리본 배지 */}
      <RibbonShieldBadge />

      {/* 상단 GNB */}
      <GNB
        onOpenRegister={handleOpenRegister}
        onOpenMedia={() => setIsMediaOpen(true)}
      />

      <main className="pt-28 sm:pt-36 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 브레드크럼 */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-ink-black/60">
          <Link href="/" className="hover:text-burnt-orange transition-colors">홈</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>커뮤니티</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-burnt-orange font-bold">공지사항</span>
        </nav>

        {/* 게시판 헤더 배너 */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-ink-black/15 p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-8 pointer-events-none opacity-5 font-hunmin text-8xl select-none">
            公示
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/30 text-burnt-orange text-xs font-bold font-hunmin mb-3">
            <span className="seal-stamp text-burnt-orange border-burnt-orange scale-90">소식</span>
            <span>1446 SEJONG RUN OFFICIAL NOTICES</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-hunmin font-bold text-ink-black leading-tight mb-3">
            대회 공지사항
          </h1>
          <p className="text-sm sm:text-base text-ink-black/75 leading-relaxed max-w-2xl">
            2027 1446 세종 골목 상생 마라톤의 공식 일정, 참가자 패키지 배송, 교통 통제 안내 등 중요한 소식을 신속하게 전해드립니다.
          </p>
        </div>

        {/* 검색 및 필터 컨트롤 바 */}
        <div className="bg-white/90 rounded-2xl border border-ink-black/15 p-4 sm:p-5 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* 필터 탭 */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === "ALL"
                  ? "bg-burnt-orange text-white shadow-xs"
                  : "bg-ink-black/5 hover:bg-ink-black/10 text-ink-black/70"
              }`}
            >
              전체 ({notices.length})
            </button>
            <button
              onClick={() => setFilterType("IMPORTANT")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                filterType === "IMPORTANT"
                  ? "bg-burnt-orange text-white shadow-xs"
                  : "bg-ink-black/5 hover:bg-ink-black/10 text-ink-black/70"
              }`}
            >
              <Pin className="w-3 h-3" />
              <span>중요 공지 ({notices.filter((n) => n.isImportant).length})</span>
            </button>
            <button
              onClick={() => setFilterType("NORMAL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === "NORMAL"
                  ? "bg-burnt-orange text-white shadow-xs"
                  : "bg-ink-black/5 hover:bg-ink-black/10 text-ink-black/70"
              }`}
            >
              일반 안내 ({notices.filter((n) => !n.isImportant).length})
            </button>
          </div>

          {/* 검색창 */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-ink-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목 및 내용 검색..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-hanji-bg/60 border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* 게시판 목록 테이블 / 카드 뷰 */}
        <div className="bg-white/95 rounded-3xl border border-ink-black/15 shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-burnt-orange border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-ink-black/60 font-medium">공지사항을 불러오고 있습니다...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-ink-black/30 mx-auto" />
              <p className="text-sm font-bold text-ink-black/70">
                {searchTerm ? `&apos;${searchTerm}&apos; 검색 결과가 없습니다.` : "등록된 공지사항이 없습니다."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-burnt-orange font-bold underline underline-offset-4"
                >
                  검색어 초기화
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-ink-black/10">
              {/* 데스크톱 헤더 라인 */}
              <div className="hidden md:grid grid-cols-12 px-6 py-3.5 bg-ink-black/5 text-ink-black/70 text-xs font-bold border-b border-ink-black/10">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-2 text-center">분류</div>
                <div className="col-span-6 pl-2">제목</div>
                <div className="col-span-1 text-center">작성자</div>
                <div className="col-span-2 text-right">등록일</div>
              </div>

              {/* 목록 항목 */}
              {filteredNotices.map((notice, idx) => {
                const formattedDate = new Date(notice.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                });

                return (
                  <Link
                    key={notice.id}
                    href={`/community/notice/${notice.id}`}
                    className={`block transition-colors group ${
                      notice.isImportant
                        ? "bg-burnt-orange/[0.03] hover:bg-burnt-orange/[0.08]"
                        : "hover:bg-hanji-bg/60"
                    }`}
                  >
                    {/* 데스크톱 로우 */}
                    <div className="hidden md:grid grid-cols-12 px-6 py-4 items-center text-xs">
                      {/* 번호 */}
                      <div className="col-span-1 text-center font-mono font-bold text-ink-black/50">
                        {notice.isImportant ? (
                          <Pin className="w-3.5 h-3.5 text-burnt-orange inline" />
                        ) : (
                          filteredNotices.length - idx
                        )}
                      </div>

                      {/* 분류 뱃지 */}
                      <div className="col-span-2 text-center">
                        {notice.isImportant ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-burnt-orange text-white text-[11px] font-bold shadow-2xs">
                            중요 공지
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-ink-black/10 text-ink-black/70 text-[11px] font-medium">
                            대회 안내
                          </span>
                        )}
                      </div>

                      {/* 제목 */}
                      <div className="col-span-6 pl-2 flex items-center space-x-2">
                        <span className="font-bold text-sm text-ink-black group-hover:text-burnt-orange transition-colors truncate">
                          {notice.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-burnt-orange opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>

                      {/* 작성자 */}
                      <div className="col-span-1 text-center text-ink-black/60 font-medium truncate text-[11px]">
                        조직위
                      </div>

                      {/* 등록일 */}
                      <div className="col-span-2 text-right font-mono text-ink-black/50 text-[11px]">
                        {formattedDate}
                      </div>
                    </div>

                    {/* 모바일 카드 뷰 */}
                    <div className="md:hidden p-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        {notice.isImportant ? (
                          <span className="px-2 py-0.5 rounded-md bg-burnt-orange text-white font-bold text-[10px]">
                            중요 공지
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-ink-black/10 text-ink-black/70 font-medium text-[10px]">
                            대회 안내
                          </span>
                        )}
                        <span className="font-mono text-ink-black/50 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-ink-black group-hover:text-burnt-orange transition-colors leading-snug">
                        {notice.title}
                      </h3>

                      <p className="text-xs text-ink-black/70 line-clamp-2 leading-relaxed">
                        {notice.content}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 고객센터 및 안내 박스 */}
        <div className="mt-10 p-6 rounded-2xl bg-white/70 border border-ink-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-black/70">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-full bg-burnt-orange/10 flex items-center justify-center text-burnt-orange flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-ink-black">대회 참가 및 공지 관련 문의</p>
              <p className="text-[11px] text-ink-black/60">
                1446 세종런 조직위원회 사무국: 044-144-6000 (평일 09:00 - 18:00)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/info/rules"
              className="px-3.5 py-2 rounded-xl bg-ink-black/5 hover:bg-ink-black/10 text-ink-black font-bold transition-colors"
            >
              대회 규정집 보기
            </Link>
            <button
              onClick={() => handleOpenRegister("register")}
              className="px-4 py-2 rounded-xl bg-burnt-orange hover:bg-burnt-orange/90 text-white font-bold transition-colors"
            >
              참가 신청하기
            </button>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <Footer />

      {/* 참가신청/조회 모달 */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        defaultTab={registerDefaultTab}
      />

      {/* 미디어 모달 */}
      <MediaModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
      />
    </div>
  );
}
