"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Pin,
  Share2,
  Printer,
  List,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
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
  updatedAt?: string;
}

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params?.id as string;

  const [notice, setNotice] = useState<NoticeItem | null>(null);
  const [allNotices, setAllNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultTab, setRegisterDefaultTab] = useState<"register" | "lookup">("register");
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const handleOpenRegister = (tab?: "register" | "lookup") => {
    setRegisterDefaultTab(tab || "register");
    setIsRegisterOpen(true);
  };

  useEffect(() => {
    if (!noticeId) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [resDetail, resList] = await Promise.all([
          fetch(`/api/notices/${noticeId}`),
          fetch("/api/notices"),
        ]);

        const dataDetail = await resDetail.json();
        const dataList = await resList.json();

        if (dataDetail.success && dataDetail.notice) {
          setNotice(dataDetail.notice);
        } else {
          setError(dataDetail.error || "해당 공지사항을 찾을 수 없습니다.");
        }

        if (dataList.success && Array.isArray(dataList.notices)) {
          setAllNotices(dataList.notices);
        }
      } catch (err: any) {
        console.error("공지사항 상세 불러오기 오류:", err);
        setError("공지사항을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [noticeId]);

  // 이전 글 / 다음 글 계산
  const currentIndex = allNotices.findIndex((n) => String(n.id) === String(noticeId));
  const prevNotice = currentIndex > 0 ? allNotices[currentIndex - 1] : null;
  const nextNotice =
    currentIndex >= 0 && currentIndex < allNotices.length - 1 ? allNotices[currentIndex + 1] : null;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      alert("공지사항 주소가 클립보드에 복사되었습니다.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen relative font-pretendard">
      {/* 최상단 리본 배지 */}
      <RibbonShieldBadge />

      {/* 상단 GNB */}
      <GNB
        onOpenRegister={handleOpenRegister}
        onOpenMedia={() => setIsMediaOpen(true)}
      />

      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 브레드크럼 */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-ink-black/60">
          <Link href="/" className="hover:text-burnt-orange transition-colors">홈</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/community/notice" className="hover:text-burnt-orange transition-colors">공지사항</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-burnt-orange font-bold">상세보기</span>
        </nav>

        {isLoading ? (
          <div className="py-24 text-center space-y-3 bg-white/80 rounded-3xl border border-ink-black/15 shadow-xl">
            <div className="inline-block w-8 h-8 border-3 border-burnt-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-ink-black/60 font-medium">공지사항을 불러오고 있습니다...</p>
          </div>
        ) : error || !notice ? (
          <div className="py-20 text-center space-y-4 bg-white/80 rounded-3xl border border-ink-black/15 shadow-xl p-8">
            <AlertCircle className="w-12 h-12 text-burnt-orange mx-auto" />
            <h2 className="text-lg font-hunmin font-bold text-ink-black">
              {error || "공지사항을 찾을 수 없습니다."}
            </h2>
            <p className="text-xs text-ink-black/60 max-w-md mx-auto">
              삭제되었거나 주소가 올바르지 않습니다. 공지사항 목록으로 돌아가 최신 글을 확인해 주세요.
            </p>
            <div className="pt-2">
              <Link
                href="/community/notice"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-burnt-orange text-white text-xs font-bold shadow-md hover:bg-burnt-orange/90 transition-colors"
              >
                <List className="w-4 h-4" />
                <span>공지사항 목록으로</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 본문 카드 */}
            <article className="bg-white/95 rounded-3xl border border-ink-black/15 p-6 sm:p-12 shadow-xl relative overflow-hidden">
              {/* 우측 상단 배경 전각 워터마크 */}
              <div className="absolute -right-4 -bottom-6 pointer-events-none opacity-5 font-hunmin text-8xl select-none">
                公示
              </div>

              {/* 게시물 헤더 */}
              <header className="border-b border-ink-black/10 pb-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {notice.isImportant ? (
                      <span className="px-3 py-1 rounded-full bg-burnt-orange text-white text-xs font-bold shadow-2xs flex items-center space-x-1">
                        <Pin className="w-3 h-3" />
                        <span>중요 공지</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-ink-black/10 text-ink-black/70 text-xs font-semibold">
                        대회 공식 안내
                      </span>
                    )}
                    <span className="text-xs text-ink-black/40 font-mono">
                      No. {notice.id}
                    </span>
                  </div>

                  {/* 공유 & 인쇄 버튼 */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleShare}
                      type="button"
                      className="p-2 rounded-xl border border-ink-black/10 hover:border-burnt-orange hover:text-burnt-orange text-ink-black/60 bg-hanji-bg/60 transition-colors text-xs flex items-center space-x-1"
                      title="URL 주소 복사"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">공유</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      type="button"
                      className="p-2 rounded-xl border border-ink-black/10 hover:border-burnt-orange hover:text-burnt-orange text-ink-black/60 bg-hanji-bg/60 transition-colors text-xs flex items-center space-x-1"
                      title="인쇄하기"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">인쇄</span>
                    </button>
                  </div>
                </div>

                <h1 className="text-xl sm:text-3xl font-hunmin font-bold text-ink-black leading-snug mb-4">
                  {notice.title}
                </h1>

                {/* 메타데이터 라인 */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-black/60 pt-2">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-burnt-orange" />
                    <span className="font-medium text-ink-black/80">1446 세종런 조직위원회</span>
                  </div>
                  <span className="text-ink-black/20">|</span>
                  <div className="flex items-center space-x-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-burnt-orange" />
                    <span>
                      {new Date(notice.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </header>

              {/* 본문 내용: 텍스트가 시원하게 읽히는 타이포그래피 */}
              <div className="prose prose-stone max-w-none">
                <div className="text-base sm:text-lg leading-relaxed text-ink-black/85 font-medium whitespace-pre-wrap font-pretendard">
                  {notice.content}
                </div>
              </div>

              {/* 대회 공식 안내 푸터 배너 */}
              <div className="mt-12 p-5 rounded-2xl bg-hanji-bg/80 border border-ink-black/10 flex items-start space-x-3 text-xs text-ink-black/75">
                <CheckCircle2 className="w-4 h-4 text-burnt-orange flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-ink-black">대회 참가자 준수 사항</p>
                  <p className="leading-relaxed text-[11px] text-ink-black/65">
                    본 공지사항에 기재된 일정과 안내는 원활한 대회 운영을 위해 현장 상황 및 기상 여건에 따라 일부 조정될 수 있습니다. 추가 문의 사항은 조직위 사무국(044-144-6000)으로 연락 주시기 바랍니다.
                  </p>
                </div>
              </div>
            </article>

            {/* 이전 글 / 다음 글 네비게이터 */}
            <div className="bg-white/80 rounded-2xl border border-ink-black/15 divide-y divide-ink-black/10 overflow-hidden shadow-xs text-xs">
              {prevNotice ? (
                <Link
                  href={`/community/notice/${prevNotice.id}`}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-burnt-orange/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="text-ink-black/40 font-bold flex items-center space-x-1 flex-shrink-0">
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-burnt-orange" />
                      <span>이전 글</span>
                    </span>
                    <span className="font-medium text-ink-black group-hover:text-burnt-orange transition-colors truncate">
                      {prevNotice.title}
                    </span>
                  </div>
                  <span className="text-ink-black/40 font-mono flex-shrink-0 ml-4 hidden sm:inline">
                    {new Date(prevNotice.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </Link>
              ) : (
                <div className="px-5 py-3.5 text-ink-black/30 flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>이전 공지사항이 없습니다.</span>
                </div>
              )}

              {nextNotice ? (
                <Link
                  href={`/community/notice/${nextNotice.id}`}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-burnt-orange/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="text-ink-black/40 font-bold flex items-center space-x-1 flex-shrink-0">
                      <span>다음 글</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-burnt-orange" />
                    </span>
                    <span className="font-medium text-ink-black group-hover:text-burnt-orange transition-colors truncate">
                      {nextNotice.title}
                    </span>
                  </div>
                  <span className="text-ink-black/40 font-mono flex-shrink-0 ml-4 hidden sm:inline">
                    {new Date(nextNotice.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </Link>
              ) : (
                <div className="px-5 py-3.5 text-ink-black/30 flex items-center space-x-2">
                  <span>다음 공지사항이 없습니다.</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* 하단 버튼 바 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href="/community/notice"
                className="px-5 py-2.5 rounded-xl bg-ink-black/10 hover:bg-ink-black/15 text-ink-black text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-2xs"
              >
                <List className="w-4 h-4" />
                <span>목록으로 돌아가기</span>
              </Link>

              <div className="flex items-center space-x-2">
                <Link
                  href="/info/rules"
                  className="px-4 py-2.5 rounded-xl border border-burnt-orange/30 text-burnt-orange hover:bg-burnt-orange/10 text-xs font-bold transition-colors"
                >
                  참가자 유의사항 보기
                </Link>
                <button
                  onClick={() => handleOpenRegister("register")}
                  className="px-5 py-2.5 rounded-xl bg-burnt-orange hover:bg-burnt-orange/90 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1"
                >
                  <span>참가 신청하기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
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
