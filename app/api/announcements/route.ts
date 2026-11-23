import { NextRequest, NextResponse } from "next/server";
import { getAnnouncements } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * ==============================================================================
 * [공개 긴급 공지(상단 배너 및 팝업) 조회 API]
 * GET /api/announcements
 * ==============================================================================
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") as "POPUP" | "BANNER") || undefined;

    // 사용자 화면에는 is_active === true 인 항목만 반환
    const list = await getAnnouncements(type, true);

    const banners = list.filter((a) => a.type === "BANNER");
    const popups = list.filter((a) => a.type === "POPUP");

    return NextResponse.json(
      {
        success: true,
        banners,
        popups,
        activeCount: list.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: any) {
    console.error("[GET /api/announcements] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "긴급 공지 목록을 불러오는 중 오류가 발생했습니다.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
