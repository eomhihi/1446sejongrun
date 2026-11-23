import { NextResponse } from "next/server";
import { getPartnerShops } from "@/lib/db";

/**
 * ==============================================================================
 * [1446 애프터런 참여 상점 목록 조회 공개 API]
 * GET /api/shops
 * ==============================================================================
 * 관리자가 업로드한 최신 DB 참여 상점 데이터를 반환합니다.
 */
export async function GET() {
  try {
    const shops = await getPartnerShops();
    return NextResponse.json({
      success: true,
      shops,
    });
  } catch (error: any) {
    console.error("[GET /api/shops Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: `참여 상점 목록을 불러올 수 없습니다: ${error.message || String(error)}`,
      },
      { status: 500 }
    );
  }
}
