"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("admin-credentials", {
        redirect: false,
        username: username.trim(),
        email: username.trim(),
        password: password.trim(),
      });

      if (res?.error) {
        setErrorMsg(res.error || "관리자 인증에 실패했습니다. 아이디 및 비밀번호를 확인해 주세요.");
        setIsLoading(false);
      } else if (res?.ok) {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "로그인 요청 중 통신 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative z-10 font-pretendard">
      {/* 상단 메인으로 돌아가기 */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-ink-black/70 hover:text-burnt-orange font-semibold transition-colors bg-white/70 px-3.5 py-2 rounded-full border border-ink-black/10 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>메인 웹사이트로</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* 헤더 및 브랜드 로고 */}
        <div className="text-center mb-8">
          <div className="inline-block w-32 sm:w-36 mb-4">
            <Image
              src="/images/logo-1446.svg"
              alt="1446 세종런 로고"
              width={140}
              height={60}
              priority
              className="w-full h-auto drop-shadow-sm"
            />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-burnt-orange/10 border border-burnt-orange/25 text-burnt-orange text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>대회 운영 관리자 시스템</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-hunmin font-bold text-ink-black tracking-tight">
            1446 세종런 관리자 로그인
          </h1>
          <p className="text-xs sm:text-sm text-ink-black/60 mt-1.5 font-pretendard">
            참여 상점 데이터 일괄 갱신 및 대회 공지사항 관리를 위한 전용 포털입니다.
          </p>
        </div>

        {/* 로그인 폼 카드 */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-ink-black/15 shadow-2xl p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-black/80 mb-1.5">
                관리자 아이디
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin1446"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink-black/15 rounded-xl text-sm text-ink-black placeholder:text-ink-black/35 focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange shadow-sm font-pretendard"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-black/80 mb-1.5">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="관리자 전용 비밀번호"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink-black/15 rounded-xl text-sm text-ink-black placeholder:text-ink-black/35 focus:outline-none focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange shadow-sm font-pretendard"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-burnt-orange/30 transition-all duration-200 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>인증 확인 중...</span>
                </>
              ) : (
                <>
                  <span>관리자 대시보드 입장</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 보안 방침 안내 (오철칙 규정) */}
          <div className="mt-6 pt-5 border-t border-ink-black/10 text-[11px] text-ink-black/55 leading-relaxed">
            <span className="font-bold text-ink-black/75">보안 통제 원칙:</span> 비인가자의 비정상 접근 시도는 실시간 모니터링 및 IP 차단 조치되며, 안전한 세션 검증이 적용됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
