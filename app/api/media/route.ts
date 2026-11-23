import { NextRequest, NextResponse } from "next/server";
import { getMediaVideos, getMainMediaVideo } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * ==============================================================================
 * [공개 미디어(유튜브 영상) 목록 조회 API]
 * GET /api/media?type=...&main=true
 * ==============================================================================
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isMain = searchParams.get("main") === "true";
    const type = searchParams.get("type") || undefined;

    if (isMain) {
      const mainVideo = await getMainMediaVideo();
      return NextResponse.json(
        { success: true, video: mainVideo },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
      );
    }

    const videos = await getMediaVideos(type);
    return NextResponse.json(
      {
        success: true,
        videos,
        total: videos.length,
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (err: any) {
    console.error("[GET /api/media] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "미디어 영상 목록을 불러오는 중 오류가 발생했습니다.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
