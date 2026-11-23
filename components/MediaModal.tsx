"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  X,
  Play,
  Youtube,
  Search,
  ChevronRight,
  Filter,
} from "lucide-react";

interface MediaVideoItem {
  id: number;
  youtubeId: string;
  title: string;
  type: string;
  isMainExposure: boolean;
  createdAt: string;
}

const VIDEO_TYPES = ["전체", "홍보영상", "경기영상", "코스 프리뷰", "현장 스케치"];

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaModal({ isOpen, onClose }: MediaModalProps) {
  const [videos, setVideos] = useState<MediaVideoItem[]>([]);
  const [selectedType, setSelectedType] = useState("전체");
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setActivePlayId(null);
      return;
    }

    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/media");
        const data = await res.json();
        if (data.success && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      } catch (err) {
        console.warn("[MediaModal] 로딩 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredVideos = videos.filter((v) => {
    const matchesType = selectedType === "전체" || v.type === selectedType;
    const matchesSearch =
      !searchTerm.trim() ||
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/70 backdrop-blur-md font-pretendard">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl bg-hanji-bg rounded-3xl shadow-2xl border border-burnt-orange/30 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* 상단 헤더 */}
          <div className="bg-[#04151F] text-white p-5 sm:p-6 flex items-center justify-between border-b border-wheat/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-burnt-orange/20 border border-burnt-orange/40 flex items-center justify-center text-burnt-orange">
                <Film className="w-5 h-5 text-burnt-orange" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-wheat font-mono">
                  1446 SEJONG RUN MEDIA
                </span>
                <h3 className="text-xl sm:text-2xl font-hunmin font-bold text-white">
                  공식 미디어 및 영상 갤러리
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 메인 비디오 플레이어 (클릭 시 상단에 노출) */}
          {activePlayId && (
            <div className="bg-ink-black p-4 sm:p-6 border-b border-ink-black/20 flex flex-col items-center">
              <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-burnt-orange/40">
                <iframe
                  src={`https://www.youtube.com/embed/${activePlayId}?autoplay=1&rel=0`}
                  title="유튜브 영상 플레이어"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* 컨트롤 바: 카테고리 탭 & 검색 */}
          <div className="p-4 sm:p-6 bg-white/60 border-b border-ink-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              {VIDEO_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                    selectedType === type
                      ? "bg-burnt-orange text-white shadow-xs font-bold"
                      : "bg-white text-ink-black/70 hover:bg-ink-black/5 border border-ink-black/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="w-4 h-4 text-ink-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="영상 제목 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
              />
            </div>
          </div>

          {/* 비디오 그리드 목록 */}
          <div className="p-5 sm:p-7 overflow-y-auto flex-1">
            {filteredVideos.length === 0 ? (
              <div className="text-center py-16">
                <Film className="w-10 h-10 text-ink-black/20 mx-auto mb-2" />
                <p className="text-sm font-bold text-ink-black/60">등록된 영상이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setActivePlayId(video.youtubeId)}
                    className="bg-white rounded-2xl border border-ink-black/10 overflow-hidden shadow-xs hover:shadow-md hover:border-burnt-orange/50 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* 썸네일 */}
                      <div className="relative aspect-video bg-ink-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-ink-black/30 group-hover:bg-ink-black/10 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-burnt-orange text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          </div>
                        </div>
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ink-black/80 text-white text-[10px] font-bold">
                          {video.type}
                        </span>
                      </div>

                      {/* 정보 */}
                      <div className="p-4">
                        <h4 className="text-xs sm:text-sm font-bold text-ink-black leading-snug line-clamp-2 group-hover:text-burnt-orange transition-colors">
                          {video.title}
                        </h4>
                      </div>
                    </div>

                    <div className="px-4 pb-3 flex items-center justify-between text-[10px] text-ink-black/40 border-t border-ink-black/5 pt-2">
                      <span className="flex items-center gap-1 font-mono">
                        <Youtube className="w-3 h-3 text-red-500 fill-current" />
                        <span>YouTube</span>
                      </span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
