"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ChevronRight, BellRing } from "lucide-react";

interface PopupItem {
  id: number;
  type: string;
  content: string;
  linkUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function EmergencyPopupModal() {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [activePopup, setActivePopup] = useState<PopupItem | null>(null);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch("/api/announcements?type=POPUP");
        const data = await res.json();
        if (data.success && Array.isArray(data.popups) && data.popups.length > 0) {
          // localStorage에 24시간 동안 보지 않기로 설정된 팝업 확인
          const firstValid = data.popups.find((p: PopupItem) => {
            if (!p.isActive) return false;
            const dismissedAt = localStorage.getItem(`1446_dismiss_popup_${p.id}`);
            if (dismissedAt) {
              const diffHours = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
              if (diffHours < 24) return false;
            }
            return true;
          });
          if (firstValid) {
            setActivePopup(firstValid);
          }
        }
      } catch (err) {
        console.warn("[EmergencyPopupModal] 팝업 로딩 실패:", err);
      }
    };

    fetchPopups();
  }, []);

  const handleClose = () => {
    setActivePopup(null);
  };

  const handleDismissForToday = () => {
    if (activePopup) {
      localStorage.setItem(`1446_dismiss_popup_${activePopup.id}`, String(Date.now()));
      setActivePopup(null);
    }
  };

  if (!activePopup) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-sm font-pretendard">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-burnt-orange/30 overflow-hidden flex flex-col"
        >
          {/* 상단 헤더 띠 */}
          <div className="bg-gradient-to-r from-ink-black to-[#0A2533] p-5 sm:p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-burnt-orange/20 border border-burnt-orange/40 flex items-center justify-center text-burnt-orange">
                  <BellRing className="w-5 h-5 text-burnt-orange" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-wheat font-mono">
                    1446 SEJONG RUN NOTICE
                  </span>
                  <h3 className="text-lg sm:text-xl font-hunmin font-bold text-white">
                    대회 긴급 안내 및 공지
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                aria-label="팝업 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 본문 콘텐츠 */}
          <div className="p-6 sm:p-7 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="p-4 rounded-2xl bg-hanji-bg border border-ink-black/10">
              <p className="text-sm sm:text-base text-ink-black/90 whitespace-pre-wrap leading-relaxed font-normal">
                {activePopup.content}
              </p>
            </div>

            {activePopup.linkUrl && (
              <a
                href={activePopup.linkUrl}
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-5 rounded-xl bg-burnt-orange hover:bg-burnt-orange/90 text-white font-bold text-sm shadow-md transition-all group"
              >
                <span>관련 페이지 바로가기</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>

          {/* 하단 제어 버튼 바 */}
          <div className="px-6 py-3.5 bg-ink-black/5 border-t border-ink-black/10 flex items-center justify-between text-xs text-ink-black/70">
            <button
              type="button"
              onClick={handleDismissForToday}
              className="hover:text-ink-black underline font-medium"
            >
              오늘 하루 보지 않기
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 rounded-lg bg-ink-black text-white hover:bg-ink-black/80 font-bold transition-colors"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
