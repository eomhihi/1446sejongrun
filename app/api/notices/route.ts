import { NextResponse } from "next/server";
import { getNotices } from "@/lib/db";

/**
 * ==============================================================================
 * [사용자 프론트엔드 공지사항 조회 공개 API]
 * GET /api/notices
 * ==============================================================================
 * 최신순 및 상단 고정(is_important=true) 우선 정렬 반환
 */
export async function GET() {
  try {
    const notices = await getNotices();
    return NextResponse.json({
      success: true,
      notices,
    });
  } catch (error: any) {
    console.error("[GET /api/notices Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: `공지사항 목록을 불러올 수 없습니다: ${error.message || String(error)}`,
      },
      { status: 500 }
    );
  }
}
