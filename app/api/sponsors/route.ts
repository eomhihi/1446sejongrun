import { NextRequest, NextResponse } from "next/server";
import { getSponsors } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * ==============================================================================
 * [공개 후원사 목록 조회 API]
 * GET /api/sponsors?tier=...
 * ==============================================================================
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier") || undefined;

    const sponsors = await getSponsors(tier);

    // 등급별 그룹화 데이터도 함께 제공
    const grouped = {
      main: sponsors.filter((s) => s.tier === "메인"),
      gold: sponsors.filter((s) => s.tier === "골드"),
      silver: sponsors.filter((s) => s.tier === "실버"),
      bronze: sponsors.filter((s) => s.tier === "브론즈"),
      inKind: sponsors.filter((s) => s.tier === "현물"),
    };

    return NextResponse.json(
      {
        success: true,
        sponsors,
        grouped,
        total: sponsors.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180",
        },
      }
    );
  } catch (err: any) {
    console.error("[GET /api/sponsors] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "후원사 목록을 불러오는 중 오류가 발생했습니다.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
