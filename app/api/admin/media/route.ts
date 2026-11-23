import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getMediaVideos, createMediaVideo } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * 유튜브 URL 또는 ID로부터 11자리 고유 식별자 파싱 함수
 */
function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * ==============================================================================
 * [관리자 전용 미디어(영상) 목록 조회 및 등록 API]
 * GET  /api/admin/media
 * POST /api/admin/media
 * ==============================================================================
 */

export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (CWE-306)" },
      { status: 401 }
    );
  }

  try {
    const list = await getMediaVideos();
    return NextResponse.json({ success: true, videos: list });
  } catch (err: any) {
    console.error("[GET /api/admin/media] Error:", err);
    return NextResponse.json(
      { success: false, error: "영상 목록 조회 실패", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (CWE-306)" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { youtubeUrlOrId, title, type, isMainExposure } = body;

    if (!youtubeUrlOrId || typeof youtubeUrlOrId !== "string" || youtubeUrlOrId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "유튜브 영상 링크 또는 고유 식별자(ID)를 입력해 주세요." },
        { status: 400 }
      );
    }

    const parsedId = extractYouTubeId(youtubeUrlOrId);
    if (!parsedId || parsedId.length < 5) {
      return NextResponse.json(
        { success: false, error: "유효한 유튜브 영상 링크 또는 11자리 식별자(ID)가 아닙니다." },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "영상 제목을 입력해 주세요." },
        { status: 400 }
      );
    }

    const validTypes = new Set(["홍보영상", "경기영상", "코스 프리뷰", "현장 스케치", "기타"]);
    const cleanType = type && validTypes.has(type) ? type : "홍보영상";

    const created = await createMediaVideo({
      youtubeId: parsedId,
      title: title.trim(),
      type: cleanType,
      isMainExposure: Boolean(isMainExposure),
    });

    return NextResponse.json({
      success: true,
      message: `'${title}' 영상이 성공적으로 등록되었습니다.`,
      video: created,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/media] Error:", err);
    return NextResponse.json(
      { success: false, error: "영상 등록 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
