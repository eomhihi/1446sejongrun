"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket, Store, Trash2, Check, Sparkles, MapPin } from "lucide-react";

export interface VoucherItem {
  id: number;
  name: string;
  districtName: string;
  location: string;
  benefit: string;
  yeominjeon: boolean;
}

interface VoucherPocketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: VoucherItem[];
  onRemoveVoucher: (id: number) => void;
  onClearAll: () => void;
}

export default function VoucherPocketDrawer({
  isOpen,
  onClose,
  vouchers,
  onRemoveVoucher,
  onClearAll,
}: VoucherPocketDrawerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* 백드롭 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink-black/60 backdrop-blur-sm"
        />

        {/* 우측 슬라이드 드로어 */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-hanji-bg border-l border-wheat/30 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* 상단 헤더 */}
            <div className="p-6 bg-ink-black text-white border-b border-wheat/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-burnt-orange text-white flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-wheat">
                      나의 골목 바우처 포켓
                    </h3>
                    <p className="text-[11px] font-sans text-white/60">
                      담은 혜택 총 {vouchers.length}건
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 대회 현장 사용 안내 */}
              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-wheat/90 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-burnt-orange flex-shrink-0" />
                <span>
                  대회 당일(2027. 04. 03.) 및 1446 애프터런 기간 동안 세종시 제휴 매장에 배번호와 함께 보여주세요.
                </span>
              </div>
            </div>

            {/* 바우처 리스트 본문 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {vouchers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-ink-black/50">
                  <Store className="w-12 h-12 stroke-[1.5] mb-3 text-ink-black/30" />
                  <p className="text-sm font-sans font-bold text-ink-black/70">
                    아직 담은 골목 혜택이 없습니다
                  </p>
                  <p className="text-xs font-sans mt-1 text-ink-black/50 max-w-xs">
                    ‘우리 동네 파트너 상권 300’ 섹션에서 마음에 드는 매장의 [혜택 담기]를 눌러보세요.
                  </p>
                </div>
              ) : (
                vouchers.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-ink-black/15 p-4 shadow-sm relative overflow-hidden group"
                  >
                    {/* 상단 태그 및 삭제 버튼 */}
                    <div className="flex items-center justify-between pb-2 border-b border-dashed border-ink-black/15 mb-2.5">
                      <span className="px-2 py-0.5 rounded bg-wheat/30 text-[10px] font-sans font-bold text-slate-grey">
                        {item.districtName}
                      </span>
                      <button
                        onClick={() => onRemoveVoucher(item.id)}
                        className="text-ink-black/40 hover:text-red-600 transition-colors p-1"
                        title="혜택 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-base font-serif font-bold text-ink-black">
                      {item.name}
                    </h4>

                    <p className="text-xs font-sans text-burnt-orange font-bold mt-1 bg-burnt-orange/5 p-2 rounded-lg border border-burnt-orange/15">
                      🎁 {item.benefit}
                    </p>

                    <p className="text-[10px] font-sans text-ink-black/50 flex items-center gap-1 mt-2">
                      <MapPin className="w-3 h-3 text-burnt-orange" />
                      <span>{item.location}</span>
                    </p>

                    {/* 모바일 현장 바코드 시뮬레이션 */}
                    <div className="mt-3 pt-3 border-t border-ink-black/10 flex items-center justify-between text-[10px] font-mono text-ink-black/60">
                      <span className="tracking-widest">BARCODE: 1446-SEJONG-{String(item.id).padStart(4, "0")}</span>
                      {item.yeominjeon && (
                        <span className="text-emerald-700 font-bold font-sans">
                          여민전 10%
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* 하단 푸터 버튼 바 */}
            {vouchers.length > 0 && (
              <div className="p-5 bg-white border-t border-ink-black/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-sans mb-1">
                  <span className="text-ink-black/70">담은 바우처 수량</span>
                  <span className="font-bold text-burnt-orange">{vouchers.length}개</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-xl text-xs sm:text-sm font-sans font-bold shadow-md shadow-burnt-orange/30 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>현장 사용 준비 완료</span>
                </button>

                <button
                  onClick={onClearAll}
                  className="w-full py-1.5 text-ink-black/50 hover:text-ink-black text-[11px] font-sans transition-colors text-center"
                >
                  바우처 전체 비우기
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

