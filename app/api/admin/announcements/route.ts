import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getAnnouncements, createAnnouncement } from "@/lib/db";

/**
 * ==============================================================================
 * [관리자 전용 긴급 공지(상단 배너 / 팝업) 목록 조회 및 생성 API]
 * GET  /api/admin/announcements
 * POST /api/admin/announcements
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
    const list = await getAnnouncements();
    return NextResponse.json({ success: true, announcements: list });
  } catch (err: any) {
    console.error("[GET /api/admin/announcements] Error:", err);
    return NextResponse.json(
      { success: false, error: "공지 목록 조회 실패", details: err?.message || String(err) },
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
    const { type, content, linkUrl, isActive } = body;

    if (type !== "POPUP" && type !== "BANNER") {
      return NextResponse.json(
        { success: false, error: "공지 유형은 'POPUP' 또는 'BANNER' 중 하나여야 합니다." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "공지 문구 내용을 입력해 주세요." },
        { status: 400 }
      );
    }

    const created = await createAnnouncement({
      type,
      content: content.trim(),
      linkUrl: linkUrl ? String(linkUrl).trim() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({
      success: true,
      message: `${type === "BANNER" ? "상단 띠 배너" : "긴급 팝업"}이 성공적으로 등록되었습니다.`,
      announcement: created,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/announcements] Error:", err);
    return NextResponse.json(
      { success: false, error: "공지 등록 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
