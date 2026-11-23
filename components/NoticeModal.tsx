"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Pin, Search, RefreshCw, Calendar, Sparkles } from "lucide-react";

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NoticeModal({ isOpen, onClose }: NoticeModalProps) {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      if (data.success && Array.isArray(data.notices)) {
        setNotices(data.notices);
      }
    } catch (err) {
      console.error("공지사항 불러오기 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotices();
      setSelectedNotice(null);
    }
  }, [isOpen]);

  const filteredNotices = notices.filter(
    (n) =>
      searchTerm === "" ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-pretendard">
        {/* 백드롭 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink-black/70 backdrop-blur-sm"
        />

        {/* 모달 창 */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-hanji-bg rounded-3xl border border-wheat/40 shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[85vh]"
        >
          {/* 모달 헤더 */}
          <div className="bg-[#04151F] text-white p-5 sm:p-6 border-b border-wheat/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-burnt-orange/20 border border-burnt-orange/40 flex items-center justify-center text-burnt-orange">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 text-xs text-wheat">
                  <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
                  <span>1446 세종런 공식 알림</span>
                </div>
                <h3 className="text-lg sm:text-xl font-hunmin font-bold text-white">
                  대회 공지사항 게시판
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 검색 및 새로고침 바 */}
          <div className="p-4 sm:p-5 pb-3 bg-white/80 border-b border-ink-black/10 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="공지사항 제목 또는 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-ink-black/15 rounded-xl text-xs text-ink-black focus:outline-none focus:border-burnt-orange"
              />
            </div>

            <button
              onClick={fetchNotices}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white border border-ink-black/15 text-ink-black/70 hover:text-burnt-orange transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* 공지사항 목록 본문 */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 divide-y divide-ink-black/5">
            {selectedNotice ? (
              // 상세 보기 모드
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="inline-flex items-center space-x-1 text-xs text-burnt-orange font-bold hover:underline mb-1"
                >
                  <span>← 목록으로 돌아가기</span>
                </button>

                <div className="pb-3 border-b border-ink-black/10">
                  <div className="flex items-center space-x-2 mb-2">
                    {selectedNotice.isImportant && (
                      <span className="px-2 py-0.5 rounded-full bg-burnt-orange text-white text-[10px] font-bold flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        <span>중요 공지</span>
                      </span>
                    )}
                    <span className="text-xs text-ink-black/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(selectedNotice.createdAt).toLocaleDateString("ko-KR")}</span>
                    </span>
                  </div>

                  <h4 className="text-lg sm:text-xl font-hunmin font-bold text-ink-black">
                    {selectedNotice.title}
                  </h4>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-ink-black/10 text-xs sm:text-sm text-ink-black/85 leading-relaxed whitespace-pre-wrap font-pretendard">
                  {selectedNotice.content}
                </div>
              </div>
            ) : (
              // 공지사항 리스트 모드
              <>
                {filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className={`pt-3.5 first:pt-0 p-4 rounded-2xl transition-all cursor-pointer group ${
                      notice.isImportant
                        ? "bg-amber-50/70 border border-amber-200/80 hover:border-burnt-orange"
                        : "bg-white/80 border border-ink-black/10 hover:border-burnt-orange hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        {notice.isImportant && (
                          <span className="px-2 py-0.5 rounded-full bg-burnt-orange text-white text-[10px] font-bold flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" />
                            <span>상단 고정</span>
                          </span>
                        )}
                        <h4 className="text-sm sm:text-base font-bold text-ink-black group-hover:text-burnt-orange transition-colors font-hunmin">
                          {notice.title}
                        </h4>
                      </div>

                      <span className="text-[11px] text-ink-black/50 flex-shrink-0">
                        {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>

                    <p className="text-xs text-ink-black/70 line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                ))}

                {filteredNotices.length === 0 && (
                  <div className="text-center py-12 text-ink-black/40 text-xs">
                    {isLoading ? "공지사항을 불러오는 중입니다..." : "등록된 공지사항이 없습니다."}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 하단 푸터 */}
          <div className="p-4 bg-white/70 border-t border-ink-black/10 flex items-center justify-between text-xs text-ink-black/60">
            <span>총 {filteredNotices.length}건의 공식 공지</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-ink-black text-wheat hover:bg-burnt-orange hover:text-white transition-colors font-bold"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
