import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getAnnouncementById, updateAnnouncement, deleteAnnouncement } from "@/lib/db";

/**
 * ==============================================================================
 * [관리자 전용 개별 공지 수정 (토글 포함) 및 삭제 API]
 * PUT    /api/admin/announcements/[id]
 * DELETE /api/admin/announcements/[id]
 * ==============================================================================
 */

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
      { success: false, error: "유효하지 않은 공지 ID 번호입니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getAnnouncementById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `ID ${id}번에 해당하는 공지를 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.type !== undefined) {
      if (body.type !== "POPUP" && body.type !== "BANNER") {
        return NextResponse.json(
          { success: false, error: "공지 유형은 'POPUP' 또는 'BANNER'만 가능합니다." },
          { status: 400 }
        );
      }
      updateData.type = body.type;
    }
    if (body.content !== undefined) updateData.content = String(body.content).trim();
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl ? String(body.linkUrl).trim() : null;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await updateAnnouncement(id, updateData);

    return NextResponse.json({
      success: true,
      message: "공지 설정이 성공적으로 갱신되었습니다.",
      announcement: updated,
    });
  } catch (err: any) {
    console.error(`[PUT /api/admin/announcements/${id}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "공지 수정 중 오류가 발생했습니다.", details: err?.message || String(err) },
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
      { success: false, error: "유효하지 않은 공지 ID 번호입니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getAnnouncementById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `ID ${id}번에 해당하는 공지를 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    await deleteAnnouncement(id);

    return NextResponse.json({
      success: true,
      message: `ID ${id}번 공지가 안전하게 삭제되었습니다.`,
    });
  } catch (err: any) {
    console.error(`[DELETE /api/admin/announcements/${id}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "공지 삭제 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
