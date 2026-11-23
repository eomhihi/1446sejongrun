"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  MessageCircleQuestion,
  Search,
} from "lucide-react";

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
}

const CATEGORY_TABS = [
  { key: "all", label: "전체 질문" },
  { key: "접수", label: "참가 접수" },
  { key: "코스", label: "코스 안내" },
  { key: "결제", label: "결제/환불" },
  { key: "기타", label: "상생바우처·기타" },
];

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      try {
        const url =
          selectedCategory === "all"
            ? "/api/faqs"
            : `/api/faqs?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
          // 첫 번째 FAQ 기본 열림
          if (data.faqs.length > 0 && openFaqId === null) {
            setOpenFaqId(data.faqs[0].id);
          }
        }
      } catch (err) {
        console.warn("[FAQSection] 로딩 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, [selectedCategory]);

  const toggleFaq = (id: number) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = faqs.filter((faq) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      faq.category.toLowerCase().includes(term)
    );
  });

  return (
    <section
      id="faq"
      className="relative py-24 sm:py-32 bg-transparent border-t border-ink-black/10 overflow-hidden font-pretendard"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 라벨 및 헤드라인 */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/20 text-burnt-orange text-xs font-hunmin font-bold tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>자주 묻는 질문</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-hunmin font-bold text-ink-black tracking-tight leading-tight">
            궁금한 점을 먼저 확인하세요
          </h2>
          <p className="text-sm sm:text-base text-ink-black/75 mt-3 font-pretendard break-keep">
            1446 세종런 참가 접수부터 코스 통제, 1446 애프터런 골목 상생 바우처 사용법까지 가장 많이 문의하시는 내용을 모았습니다.
          </p>
        </div>

        {/* 카테고리 탭 & 검색바 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* 카테고리 탭 */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 ${
                    isSelected
                      ? "bg-burnt-orange text-white shadow-sm shadow-burnt-orange/30"
                      : "bg-white/80 hover:bg-white text-ink-black/70 border border-ink-black/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 질문 검색 인풋 */}
          <div className="relative w-full sm:w-72 flex-shrink-0">
            <Search className="w-4 h-4 text-ink-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="질문 또는 키워드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-ink-black/15 rounded-xl text-xs sm:text-sm text-ink-black placeholder:text-ink-black/40 focus:outline-none focus:border-burnt-orange shadow-sm font-pretendard"
            />
          </div>
        </div>

        {/* FAQ 아코디언 목록 */}
        <div className="space-y-3 font-pretendard">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white/60 rounded-2xl border border-ink-black/10 p-6">
              <MessageCircleQuestion className="w-10 h-10 text-ink-black/30 mx-auto mb-2" />
              <p className="text-sm font-bold text-ink-black/70">
                검색된 질문이 없습니다.
              </p>
              <p className="text-xs text-ink-black/50 mt-1">
                다른 검색어를 입력하시거나 카테고리를 전체로 변경해 보세요.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-white border-burnt-orange/40 shadow-md ring-1 ring-burnt-orange/20"
                      : "bg-white/80 hover:bg-white border-ink-black/10 shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 transition-colors group"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="flex-shrink-0 px-2 py-0.5 rounded bg-burnt-orange/10 text-burnt-orange text-[11px] font-bold font-hunmin mt-0.5">
                        {faq.category}
                      </span>
                      <span
                        className={`text-base sm:text-lg font-bold leading-snug break-keep transition-colors ${
                          isOpen ? "text-burnt-orange" : "text-ink-black group-hover:text-burnt-orange"
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? "bg-burnt-orange text-white rotate-180"
                          : "bg-ink-black/5 text-ink-black/50 group-hover:bg-ink-black/10"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-ink-black/5">
                          <div className="pt-4 p-4 rounded-xl bg-hanji-bg/80 border border-ink-black/5 text-ink-black/85 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* FAQ 하단 공식 안내 문구 */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            ※ 운영사무국 연락처(044-866-1448) 및 이메일(khj@sjr.co.kr)은 대회 준비 상황에 따라 추후 변경될 수 있습니다.
          </p>
          <div className="pt-2">
            <a
              href="/community/faq"
              className="inline-flex items-center space-x-1 text-xs font-bold text-burnt-orange hover:underline"
            >
              <span>자주 묻는 질문(FAQ) 전용 페이지 바로가기</span>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
