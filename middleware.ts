import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * [제1원칙 & 제4원칙] Upstash Redis 기반 Edge Rate Limiting (대기열 방어선)
 * Vercel Edge Runtime 및 Next.js Middleware 최전방에서 DB를 보호.
 * 
 * 정책:
 * - 대상 엔드포인트: POST /api/register (참가 등록 API)
 * - 알고리즘: Sliding Window (초당 50개의 요청만 허용)
 * - 차단 응답: HTTP 429 Too Many Requests + 한글 안내 메시지
 * - 근거 규정: CWE-770 (Allocation of Resources Without Limits or Throttling)
 */

let ratelimiter: Ratelimit | null = null;

// Upstash Redis 환경변수가 설정되어 있는 경우에만 Edge Rate Limiter 활성화
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes("your-upstash-redis")
) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 s"),
      analytics: true,
      prefix: "1446_sejongrun_ratelimit",
    });
  } catch (error) {
    console.warn("[RATE_LIMIT_INIT_WARN] Upstash Redis 초기화 실패:", error);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // POST /api/register (참가 등록 API) 엔드포인트에 초당 50개 제한 적용
  if (
    req.method === "POST" &&
    (pathname === "/api/register" || pathname === "/api/registrations")
  ) {
    if (ratelimiter) {
      // 클라이언트 식별: X-Forwarded-For IP 또는 실제 접속 IP
      const ip =
        req.ip ??
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        "127.0.0.1";

      const { success, limit, remaining, reset } = await ratelimiter.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            success: false,
            code: "ERR_RATE_LIMIT_EXCEEDED",
            message: "접속량이 많습니다. 잠시 후 시도해주세요.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/register",
    "/api/registrations",
  ],
};

