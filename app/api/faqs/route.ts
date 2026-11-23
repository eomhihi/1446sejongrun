import { NextRequest, NextResponse } from "next/server";
import { getFaqs } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * ==============================================================================
 * [공개 FAQ 목록 조회 API]
 * GET /api/faqs?category=...
 * ==============================================================================
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const faqs = await getFaqs(category);

    return NextResponse.json(
      {
        success: true,
        faqs,
        total: faqs.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("[GET /api/faqs] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "FAQ 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
