import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { updateNotice, deleteNotice, getNoticeById } from "@/lib/db";

/**
 * ==============================================================================
 * [관리자 공지사항 개별 수정 및 삭제 API]
 * PUT, DELETE /api/admin/notices/[id]
 * ==============================================================================
 */

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (오철칙 제2철칙 - CWE-306)" },
      { status: 401 }
    );
  }

  const noticeId = parseInt(params.id, 10);
  if (isNaN(noticeId)) {
    return NextResponse.json(
      { success: false, error: "올바른 공지사항 고유 ID가 아닙니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getNoticeById(noticeId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "수정하려는 공지사항을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, content, isImportant } = body;

    const updated = await updateNotice(noticeId, {
      ...(title !== undefined && { title: String(title).trim() }),
      ...(content !== undefined && { content: String(content).trim() }),
      ...(isImportant !== undefined && { isImportant: Boolean(isImportant) }),
    });

    return NextResponse.json({
      success: true,
      notice: updated,
      message: "공지사항이 성공적으로 수정되었습니다.",
    });
  } catch (error: any) {
    console.error(`[PUT /api/admin/notices/${params.id} Error]:`, error);
    return NextResponse.json(
      { success: false, error: `공지사항 수정 오류: ${error.message || String(error)}` },
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
      { success: false, error: "관리자 인증 세션이 필요합니다. (오철칙 제2철칙 - CWE-306)" },
      { status: 401 }
    );
  }

  const noticeId = parseInt(params.id, 10);
  if (isNaN(noticeId)) {
    return NextResponse.json(
      { success: false, error: "올바른 공지사항 고유 ID가 아닙니다." },
      { status: 400 }
    );
  }

  try {
    const success = await deleteNotice(noticeId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "삭제하려는 공지사항이 존재하지 않습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "공지사항이 성공적으로 삭제되었습니다.",
    });
  } catch (error: any) {
    console.error(`[DELETE /api/admin/notices/${params.id} Error]:`, error);
    return NextResponse.json(
      { success: false, error: `공지사항 삭제 오류: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
