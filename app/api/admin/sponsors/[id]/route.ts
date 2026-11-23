import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getSponsorById, updateSponsor, deleteSponsor } from "@/lib/db";

/**
 * ==============================================================================
 * [관리자 전용 개별 후원사 정보 수정 및 삭제 API]
 * PUT    /api/admin/sponsors/[id]
 * DELETE /api/admin/sponsors/[id]
 * ==============================================================================
 */

const VALID_TIERS = new Set(["메인", "골드", "실버", "브론즈", "현물"]);

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (CWE-306)" },
      { status: 401 }
    );
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "유효하지 않은 후원사 ID 번호입니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getSponsorById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `ID ${id}번에 해당하는 후원사를 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.sponsorName !== undefined) updateData.sponsorName = String(body.sponsorName).trim();
    if (body.tier !== undefined) {
      if (!VALID_TIERS.has(body.tier)) {
        return NextResponse.json(
          { success: false, error: "후원 등급은 '메인', '골드', '실버', '브론즈', '현물' 중 하나여야 합니다." },
          { status: 400 }
        );
      }
      updateData.tier = body.tier;
    }
    if (body.logoImageUrl !== undefined) updateData.logoImageUrl = String(body.logoImageUrl).trim();
    if (body.websiteUrl !== undefined) updateData.websiteUrl = body.websiteUrl ? String(body.websiteUrl).trim() : null;
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder) || 0;

    const updated = await updateSponsor(id, updateData);

    return NextResponse.json({
      success: true,
      message: "후원사 정보가 성공적으로 갱신되었습니다.",
      sponsor: updated,
    });
  } catch (err: any) {
    console.error(`[PUT /api/admin/sponsors/${id}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "후원사 정보 수정 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (CWE-306)" },
      { status: 401 }
    );
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "유효하지 않은 후원사 ID 번호입니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getSponsorById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `ID ${id}번에 해당하는 후원사를 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    await deleteSponsor(id);

    return NextResponse.json({
      success: true,
      message: `ID ${id}번 후원사가 안전하게 삭제되었습니다.`,
    });
  } catch (err: any) {
    console.error(`[DELETE /api/admin/sponsors/${id}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "후원사 삭제 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
