import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getNotices, createNotice } from "@/lib/db";

/**
 * ==============================================================================
 * [관리자 공지사항 목록 조회 및 신규 등록 API]
 * GET, POST /api/admin/notices
 * ==============================================================================
 */

export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (오철칙 제2철칙 - CWE-306)" },
      { status: 401 }
    );
  }

  try {
    const notices = await getNotices();
    return NextResponse.json({ success: true, notices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `공지사항 조회 실패: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (오철칙 제2철칙 - CWE-306)" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, content, isImportant } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "공지사항 제목(title)을 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "공지사항 본문 내용(content)을 입력해 주세요." },
        { status: 400 }
      );
    }

    const created = await createNotice({
      title: title.trim(),
      content: content.trim(),
      isImportant: Boolean(isImportant),
    });

    return NextResponse.json({
      success: true,
      notice: created,
      message: "공지사항이 성공적으로 등록되었습니다.",
    });
  } catch (error: any) {
    console.error("[POST /api/admin/notices Error]:", error);
    return NextResponse.json(
      { success: false, error: `공지사항 등록 중 오류가 발생했습니다: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
