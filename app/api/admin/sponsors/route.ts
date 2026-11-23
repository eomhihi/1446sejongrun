import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getSponsors, createSponsor } from "@/lib/db";

/**
 * ==============================================================================
 * [관리자 전용 후원사 목록 조회 및 등록 API]
 * GET  /api/admin/sponsors
 * POST /api/admin/sponsors
 * ==============================================================================
 */

const VALID_TIERS = new Set(["메인", "골드", "실버", "브론즈", "현물"]);

export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (CWE-306)" },
      { status: 401 }
    );
  }

  try {
    const list = await getSponsors();
    return NextResponse.json({ success: true, sponsors: list });
  } catch (err: any) {
    console.error("[GET /api/admin/sponsors] Error:", err);
    return NextResponse.json(
      { success: false, error: "후원사 목록 조회 실패", details: err?.message || String(err) },
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
    const { sponsorName, tier, logoImageUrl, websiteUrl, sortOrder } = body;

    if (!sponsorName || typeof sponsorName !== "string" || sponsorName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "후원사/기업명을 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!tier || !VALID_TIERS.has(tier)) {
      return NextResponse.json(
        { success: false, error: "후원 등급(tier)은 '메인', '골드', '실버', '브론즈', '현물' 중 하나여야 합니다." },
        { status: 400 }
      );
    }

    if (!logoImageUrl || typeof logoImageUrl !== "string" || logoImageUrl.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "후원사 로고 이미지 경로(URL)를 입력하거나 이미지를 업로드해 주세요." },
        { status: 400 }
      );
    }

    const created = await createSponsor({
      sponsorName: sponsorName.trim(),
      tier,
      logoImageUrl: logoImageUrl.trim(),
      websiteUrl: websiteUrl ? String(websiteUrl).trim() : null,
      sortOrder: typeof sortOrder === "number" ? sortOrder : Number(sortOrder) || 0,
    });

    return NextResponse.json({
      success: true,
      message: `'${sponsorName}' 후원사가 성공적으로 등록되었습니다.`,
      sponsor: created,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/sponsors] Error:", err);
    return NextResponse.json(
      { success: false, error: "후원사 등록 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
