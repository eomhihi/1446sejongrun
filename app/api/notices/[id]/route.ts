import { NextRequest, NextResponse } from "next/server";
import { getNoticeById } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * ==============================================================================
 * [공지사항 단일 상세 조회 공개 API]
 * GET /api/notices/[id]
 * ==============================================================================
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 공지사항 ID입니다." },
        { status: 400 }
      );
    }

    const notice = await getNoticeById(id);
    if (!notice) {
      return NextResponse.json(
        { success: false, error: "해당 공지사항을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notice: {
        id: notice.id,
        title: notice.title,
        content: notice.content,
        isImportant: (notice as any).isImportant ?? (notice as any).is_important ?? false,
        createdAt: (notice as any).createdAt ?? (notice as any).created_at,
        updatedAt: (notice as any).updatedAt ?? (notice as any).updated_at,
      },
    });
  } catch (error: any) {
    console.error(`[GET /api/notices/${params.id} Error]:`, error);
    return NextResponse.json(
      {
        success: false,
        error: `공지사항을 불러오는 중 오류가 발생했습니다: ${error.message || String(error)}`,
      },
      { status: 500 }
    );
  }
}
