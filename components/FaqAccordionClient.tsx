"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  Search,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import RegistrationModal from "@/components/RegistrationModal";
import MediaModal from "@/components/MediaModal";
import Link from "next/link";

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
}

interface FaqAccordionClientProps {
  initialFaqs: FaqItem[];
}

const CATEGORY_TABS = [
  { key: "all", label: "전체 질문" },
  { key: "접수", label: "참가 접수" },
  { key: "코스", label: "코스 안내" },
  { key: "결제", label: "결제/환불" },
  { key: "기타", label: "보험·기타" },
];

export default function FaqAccordionClient({ initialFaqs }: FaqAccordionClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<number | null>(initialFaqs[0]?.id ?? null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultTab, setRegisterDefaultTab] = useState<"register" | "lookup">("register");
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const handleOpenRegister = (tab?: "register" | "lookup") => {
    setRegisterDefaultTab(tab || "register");
    setIsRegisterOpen(true);
  };

  const toggleFaq = (id: number) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = initialFaqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      faq.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 font-pretendard">
      {/* 검색창 및 카테고리 탭 필터 바 */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-ink-black/15 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* 카테고리 탭 버튼들 */}
        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 w-full sm:w-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === tab.key
                  ? "bg-burnt-orange text-white shadow-xs"
                  : "bg-ink-black/5 hover:bg-ink-black/10 text-ink-black/75"
              }`}
            >
              {tab.label}
              {tab.key === "all" ? (
                <span className="ml-1 opacity-70">({initialFaqs.length})</span>
              ) : (
                <span className="ml-1 opacity-70">
                  ({initialFaqs.filter((f) => f.category === tab.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 검색창 */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-ink-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="궁금한 질문 검색..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-hanji-bg/60 border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* 아코디언 질문/답변 목록 */}
      {filteredFaqs.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white/80 rounded-3xl border border-ink-black/15 shadow-sm">
          <AlertCircle className="w-10 h-10 text-ink-black/30 mx-auto" />
          <p className="text-sm font-bold text-ink-black/70">
            {searchTerm ? `'${searchTerm}' 검색 결과가 없습니다.` : "해당 분류의 FAQ 항목이 없습니다."}
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
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openFaqId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
                  isOpen
                    ? "bg-white shadow-md border-burnt-orange/40 ring-1 ring-burnt-orange/20"
                    : "bg-white/85 hover:bg-white border-ink-black/12 hover:border-burnt-orange/30 shadow-2xs"
                }`}
              >
                {/* 질문 클릭 헤더 버튼 */}
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 sm:px-6 py-4.5 flex items-start justify-between text-left gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Q 번호 뱃지 */}
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-hunmin font-bold text-xs sm:text-sm flex-shrink-0 transition-colors mt-0.5 ${
                        isOpen
                          ? "bg-burnt-orange text-white shadow-2xs"
                          : "bg-ink-black/5 text-burnt-orange"
                      }`}
                    >
                      Q{index + 1}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-burnt-orange/10 text-burnt-orange">
                          {faq.category}
                        </span>
                      </div>
                      <h3
                        className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                          isOpen ? "text-burnt-orange" : "text-ink-black"
                        }`}
                      >
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  {/* 회전하는 화살표 */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 mt-1 ${
                      isOpen
                        ? "bg-burnt-orange/10 text-burnt-orange rotate-180"
                        : "bg-ink-black/5 text-ink-black/40"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* 부드럽게 펼쳐지는 답변 영역 (Framer Motion) */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-ink-black/5">
                        <div className="p-4 sm:p-5 rounded-xl bg-hanji-bg/70 border border-ink-black/10 flex items-start space-x-3 sm:space-x-3.5">
                          {/* A 뱃지 */}
                          <span className="w-6 h-6 rounded-lg bg-ink-black text-wheat flex items-center justify-center font-hunmin font-bold text-xs flex-shrink-0 mt-0.5 shadow-2xs">
                            A
                          </span>

                          <div className="text-xs sm:text-sm text-ink-black/85 leading-relaxed font-medium whitespace-pre-wrap">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* [지시사항 필수 문구]: FAQ 하단 옅은 회색 안내 문구 */}
      <div className="pt-2">
        <p className="text-xs sm:text-sm text-gray-400 text-center leading-relaxed font-medium">
          ※ 운영사무국 연락처(044-866-1448) 및 이메일(khj@sjr.co.kr)은 대회 준비 상황에 따라 추후 변경될 수 있습니다.
        </p>
      </div>

      {/* 추가 안내 및 문의 지원 카드 */}
      <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white/90 border border-ink-black/15 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-[11px] font-bold text-burnt-orange tracking-widest uppercase">
            NEED MORE HELP?
          </span>
          <h4 className="text-lg sm:text-xl font-hunmin font-bold text-ink-black">
            원하시는 답변을 찾지 못하셨나요?
          </h4>
          <p className="text-xs text-ink-black/70">
            대회 공식 규정집에서 상세 규정을 확인하시거나 1446 세종런 운영사무국으로 문의해 주세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/info/rules"
            className="px-4 py-2.5 rounded-xl bg-ink-black/5 hover:bg-ink-black/10 text-ink-black text-xs font-bold transition-colors"
          >
            대회 규정집 보기
          </Link>
          <button
            onClick={() => handleOpenRegister("register")}
            className="px-5 py-2.5 rounded-xl bg-burnt-orange hover:bg-burnt-orange/90 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1"
          >
            <span>참가 신청하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 모달 연동 */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        defaultTab={registerDefaultTab}
      />
      <MediaModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
      />
    </div>
  );
}
