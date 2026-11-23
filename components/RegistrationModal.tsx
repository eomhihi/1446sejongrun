"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Gift,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
  QrCode,
  KeyRound,
  AlertCircle,
  Loader2,
  Copy,
  CheckCheck,
  HelpCircle,
  Send,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useDDay } from "@/hooks/useDDay";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "register" | "lookup";
}

export default function RegistrationModal({
  isOpen,
  onClose,
  defaultTab = "register",
}: RegistrationModalProps) {
  const [modalTab, setModalTab] = useState<"register" | "lookup">(defaultTab);
  const { displayDday } = useDDay(1.6);

  React.useEffect(() => {
    if (isOpen) {
      setModalTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // 1. 등록 폼 상태
  const [course, setCourse] = useState<"14.46km" | "10km" | "5km">("14.46km");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shirtSize, setShirtSize] = useState("L(100)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedData, setConfirmedData] = useState<{
    bibNumber: string;
    receiptNumber: string;
    course: string;
    name: string;
    phone: string;
  } | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // 2. 조회 폼 상태
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupReceiptNumber, setLookupReceiptNumber] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 3. 접수번호 찾기(SMS 재발송) 모달 상태
  const [showFindModal, setShowFindModal] = useState(false);
  const [findName, setFindName] = useState("");
  const [findPhone, setFindPhone] = useState("");
  const [isFinding, setIsFinding] = useState(false);
  const [findToast, setFindToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. 참가 신청 API 연동 (POST /api/register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          course,
          shirtSize,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "참가 신청 처리에 실패했습니다.");
      }

      setConfirmedData({
        bibNumber: json.data.bibNumber,
        receiptNumber: json.data.receiptNumber,
        course: json.data.course,
        name: json.data.name,
        phone: phone.trim(),
      });

      setIsSuccess(true);
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.5 },
        colors: ["#C44900", "#EFD6AC", "#04151F"],
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. 비회원 조회 API 연동 (POST /api/lookup)
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);
    setHasSearched(true);
    setIsLookingUp(true);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: lookupPhone.trim(),
          receiptNumber: lookupReceiptNumber.trim().toUpperCase(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "일치하는 참가 정보가 없습니다.");
      }

      setLookupResult(json.data);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setLookupError(error.message);
    } finally {
      setIsLookingUp(false);
    }
  };

  // 3. 접수번호 찾기 API 연동 (POST /api/find-id - CWE-200 방어)
  const handleFindReceiptNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinding(true);
    setFindToast(null);

    try {
      const res = await fetch("/api/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: findName.trim(),
          phone: findPhone.trim(),
        }),
      });

      const json = await res.json();
      setFindToast(json.message || "입력하신 연락처로 접수번호를 발송했습니다.");
    } catch {
      setFindToast("입력하신 연락처로 접수번호를 발송했습니다.");
    } finally {
      setIsFinding(false);
    }
  };

  const handleCopyReceipt = () => {
    if (confirmedData?.receiptNumber) {
      navigator.clipboard.writeText(confirmedData.receiptNumber);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* 백드롭 블러 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink-black/70 backdrop-blur-sm"
        />

        {/* 모달 윈도우 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-xl bg-hanji-bg rounded-3xl border border-wheat/30 shadow-2xl p-6 sm:p-8 z-10 my-8 overflow-hidden text-ink-black font-pretendard"
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-ink-black/10 text-ink-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 모달 상단 탭: 신청하기 vs 신청 조회 */}
          <div className="flex space-x-2 bg-ink-black/5 p-1 rounded-xl mb-6 max-w-xs">
            <button
              onClick={() => {
                setModalTab("register");
                setIsSuccess(false);
                setSubmitError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                modalTab === "register"
                  ? "bg-burnt-orange text-white shadow-sm"
                  : "text-ink-black/60 hover:text-ink-black"
              }`}
            >
              참가신청 접수
            </button>
            <button
              onClick={() => {
                setModalTab("lookup");
                setIsSuccess(false);
                setLookupError(null);
                setShowFindModal(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                modalTab === "lookup"
                  ? "bg-ink-black text-wheat shadow-sm"
                  : "text-ink-black/60 hover:text-ink-black"
              }`}
            >
              신청내역 조회·확인
            </button>
          </div>

          {modalTab === "register" ? (
            !isSuccess ? (
              <div>
                {/* 모달 헤더 */}
                <div className="mb-6">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-burnt-orange/10 text-burnt-orange text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>2026 공식 참가 접수</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-hunmin font-bold text-ink-black">
                    1446 세종런 참가신청
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-black/70 mt-1">
                    골목의 불을 밝히는 한 걸음. 선착순 5,000명 조기 마감될 수 있습니다.
                  </p>
                </div>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* 신청 폼 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 1. 코스 선택 */}
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1.5">
                      참가 코스 선택
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "14.46km", fee: "45,000원", label: "상징 코스" },
                        { id: "10km", fee: "40,000원", label: "도심 도전" },
                        { id: "5km", fee: "35,000원", label: "가족 달리기" },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setCourse(item.id as any)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            course === item.id
                              ? "bg-burnt-orange text-white border-burnt-orange shadow-md shadow-burnt-orange/30 font-bold"
                              : "bg-white text-ink-black/80 border-ink-black/15 hover:border-burnt-orange/50"
                          }`}
                        >
                          <div className="text-sm sm:text-base font-black">{item.id}</div>
                          <div className={`text-[10px] mt-0.5 ${course === item.id ? "text-wheat" : "text-ink-black/50"}`}>
                            {item.label}
                          </div>
                          <div className={`text-xs mt-1 font-mono font-semibold ${course === item.id ? "text-white" : "text-burnt-orange"}`}>
                            {item.fee}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. 기념품 구성 */}
                  <div className="p-3 bg-slate-grey/5 border border-slate-grey/15 rounded-xl text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-grey">
                      <Gift className="w-3.5 h-3.5 text-burnt-orange" />
                      <span>참가자 전원 기본 제공 물품 내역</span>
                    </div>
                    <ul className="grid grid-cols-2 gap-1 text-[11px] text-ink-black/75 pl-1">
                      <li>✓ 1446 기능성 한글 티셔츠</li>
                      <li>✓ 훈민정음 자모 결합 메달</li>
                      <li>✓ 골목 상생 상품권 10,000원</li>
                      <li>✓ 모바일 완주증 &amp; 배번호</li>
                    </ul>
                  </div>

                  {/* 3. 참가자 성명 & 휴대전화 번호 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink-black mb-1">
                        참가자 성명
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="홍길동"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-ink-black/20 text-xs text-ink-black placeholder:text-ink-black/40 focus:outline-none focus:border-burnt-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink-black mb-1">
                        휴대전화 번호
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-ink-black/20 text-xs text-ink-black placeholder:text-ink-black/40 focus:outline-none focus:border-burnt-orange"
                      />
                    </div>
                  </div>

                  {/* 4. 기념 티셔츠 사이즈 */}
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">
                      기념 티셔츠 사이즈
                    </label>
                    <select
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-ink-black/20 text-xs text-ink-black focus:outline-none focus:border-burnt-orange"
                    >
                      <option value="S(90)">S (90) - 슬림</option>
                      <option value="M(95)">M (95) - 표준</option>
                      <option value="L(100)">L (100) - 권장</option>
                      <option value="XL(105)">XL (105) - 여유</option>
                      <option value="2XL(110)">2XL (110) - 빅사이즈</option>
                    </select>
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-burnt-orange hover:bg-burnt-orange-hover disabled:opacity-60 text-white rounded-full font-bold text-sm shadow-lg shadow-burnt-orange/30 flex items-center justify-center space-x-2 transition-all mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>보안 접수 및 접수번호 발급 중...</span>
                      </>
                    ) : (
                      <>
                        <span>참가 신청서 제출하기</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-1.5 text-[11px] text-ink-black/60 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>개인정보 암호화 보증 · 접수 즉시 고유번호 SMS 자동 발송</span>
                  </div>
                </form>
              </div>
            ) : (
              /* 접수 완료 화면 (고유 접수번호 발급) */
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-burnt-orange text-white flex items-center justify-center mx-auto shadow-xl shadow-burnt-orange/30">
                  <Check className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-hunmin font-bold text-ink-black">
                  참가신청이 정상 접수되었습니다!
                </h3>

                {/* 고유 접수번호 강조 카드 */}
                <div className="p-4 rounded-2xl bg-white border border-burnt-orange/30 shadow-md max-w-sm mx-auto space-y-2 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-ink-black/10">
                    <span className="text-[11px] font-bold text-burnt-orange flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>고유 접수번호 (보관 필수)</span>
                    </span>
                    <button
                      onClick={handleCopyReceipt}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-burnt-orange/10 hover:bg-burnt-orange/20 text-burnt-orange transition-colors flex items-center gap-1"
                    >
                      {copiedReceipt ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center py-1">
                    <span className="text-3xl font-mono font-black text-burnt-orange tracking-widest">
                      {confirmedData?.receiptNumber}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-ink-black/10 text-xs space-y-1 text-ink-black/80">
                    <p><strong>배정 배번호:</strong> <span className="font-mono text-ink-black font-bold">{confirmedData?.bibNumber}</span></p>
                    <p><strong>신청 코스:</strong> {confirmedData?.course} 마라톤</p>
                    <p><strong>참가자명:</strong> {confirmedData?.name}</p>
                    <p><strong>티셔츠:</strong> {shirtSize}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 max-w-sm mx-auto text-left space-y-1">
                  <p className="font-bold flex items-center gap-1 text-burnt-orange">
                    <Send className="w-3.5 h-3.5" />
                    안내 문자가 발송되었습니다
                  </p>
                  <p className="text-[11px] text-amber-800">
                    입력하신 번호({confirmedData?.phone})로 <strong>접수번호({confirmedData?.receiptNumber})</strong> 및 <strong>입금 계좌번호</strong>가 자동 발송되었습니다.
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="px-8 py-2.5 bg-ink-black text-wheat rounded-full text-xs font-bold hover:bg-ink-black/90 transition-all shadow-md"
                >
                  확인 및 닫기
                </button>
              </div>
            )
          ) : (
            /* 신청내역 조회 탭 (고유 접수번호 + 휴대폰 번호) */
            <div className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black">
                  참가신청 내역 조회
                </h3>
                <p className="text-xs text-ink-black/70 mt-1">
                  접수 시 발급받으신 휴대전화 번호와 <strong>고유 접수번호(6자리)</strong>로 참가 확정 정보를 확인하세요.
                </p>
              </div>

              {lookupError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              <form onSubmit={handleLookup} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">
                      휴대전화 번호
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010-1234-5678"
                      value={lookupPhone}
                      onChange={(e) => setLookupPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-ink-black/20 text-xs text-ink-black focus:outline-none focus:border-burnt-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1 flex items-center justify-between">
                      <span>고유 접수번호 (6자리)</span>
                      <KeyRound className="w-3.5 h-3.5 text-burnt-orange" />
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="예: A7X9Q2"
                      value={lookupReceiptNumber}
                      onChange={(e) => setLookupReceiptNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-ink-black/20 text-xs text-ink-black font-mono uppercase tracking-widest focus:outline-none focus:border-burnt-orange"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="w-full py-3 bg-ink-black hover:bg-burnt-orange disabled:opacity-60 text-wheat hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  {isLookingUp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>안전 조회 중...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>내 참가 정보 조회하기</span>
                    </>
                  )}
                </button>
              </form>

              {/* [접수번호를 잊으셨나요?] 토글 버튼 및 찾기 폼 */}
              <div className="pt-2 border-t border-ink-black/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-ink-black/60">
                    접수번호 문자를 분실하셨나요?
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFindModal(!showFindModal)}
                    className="text-xs font-bold text-burnt-orange hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>접수번호를 잊으셨나요?</span>
                  </button>
                </div>

                {/* 접수번호 찾기 서브 폼 (CWE-200 정보 노출 방어) */}
                <AnimatePresence>
                  {showFindModal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-white/80 rounded-2xl border border-burnt-orange/20 space-y-3 overflow-hidden"
                    >
                      <div className="text-xs">
                        <span className="font-bold text-ink-black">
                          등록 시 입력하신 성명과 번호로 접수번호를 문자로 재전송해 드립니다.
                        </span>
                        <p className="text-[10px] text-ink-black/60 mt-0.5">
                          * 보안을 위해 화면에는 표시되지 않으며 등록된 휴대폰으로만 발송됩니다.
                        </p>
                      </div>

                      {findToast && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{findToast}</span>
                        </div>
                      )}

                      <form onSubmit={handleFindReceiptNumber} className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="신청자 성명"
                            value={findName}
                            onChange={(e) => setFindName(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white border border-ink-black/20 text-xs focus:outline-none focus:border-burnt-orange"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="휴대전화 번호"
                            value={findPhone}
                            onChange={(e) => setFindPhone(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white border border-ink-black/20 text-xs focus:outline-none focus:border-burnt-orange"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isFinding}
                          className="w-full py-2 bg-slate-grey hover:bg-burnt-orange disabled:opacity-60 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1"
                        >
                          {isFinding ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>접수번호 문자 발송 중...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>접수번호 문자 재발송 요청</span>
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 조회 결과 카드 */}
              {hasSearched && lookupResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-white border border-burnt-orange/30 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-ink-black/10">
                    <div>
                      <span className="text-[10px] font-bold text-burnt-orange uppercase">
                        배정 배번호
                      </span>
                      <div className="text-xl font-mono font-black text-ink-black">
                        {lookupResult.bibNumber}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      {lookupResult.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-ink-black/80">
                    <p><strong>접수번호:</strong> <span className="font-mono text-burnt-orange font-bold">{lookupResult.receiptNumber}</span></p>
                    <p><strong>러너:</strong> {lookupResult.name}</p>
                    <p><strong>코스:</strong> {lookupResult.course}</p>
                    <p><strong>출발 그룹:</strong> {lookupResult.wave}</p>
                    <p className="col-span-2"><strong>수령처:</strong> {lookupResult.pickup}</p>
                  </div>

                  <div className="pt-2 border-t border-ink-black/10 flex items-center justify-between text-[11px] text-ink-black/60">
                    <span className="flex items-center gap-1 font-mono">
                      <QrCode className="w-3.5 h-3.5 text-burnt-orange" />
                      현장 본인 확인 바코드 유효
                    </span>
                    <span className="text-burnt-orange font-bold font-mono">
                      대회까지 남은 날: D-{String(displayDday).padStart(3, "0")}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}