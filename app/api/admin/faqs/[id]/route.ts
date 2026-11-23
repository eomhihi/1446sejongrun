import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getFaqById, updateFaq, deleteFaq } from "@/lib/db";

/**
 * ==============================================================================
 * [관리자 전용 개별 FAQ 수정 및 삭제 API]
 * PUT    /api/admin/faqs/[id]
 * DELETE /api/admin/faqs/[id]
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
      { success: false, error: "유효하지 않은 FAQ ID 번호입니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getFaqById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `ID ${id}번에 해당하는 FAQ를 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.category !== undefined) updateData.category = String(body.category).trim();
    if (body.question !== undefined) updateData.question = String(body.question).trim();
    if (body.answer !== undefined) updateData.answer = String(body.answer).trim();
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder) || 0;

    const updated = await updateFaq(id, updateData);

    return NextResponse.json({
      success: true,
      message: "FAQ가 성공적으로 수정되었습니다.",
      faq: updated,
    });
  } catch (err: any) {
    console.error(`[PUT /api/admin/faqs/${id}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "FAQ 수정 중 오류가 발생했습니다.", details: err?.message || String(err) },
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
      { success: false, error: "유효하지 않은 FAQ ID 번호입니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getFaqById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `ID ${id}번에 해당하는 FAQ를 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    await deleteFaq(id);

    return NextResponse.json({
      success: true,
      message: `ID ${id}번 FAQ가 안전하게 삭제되었습니다.`,
    });
  } catch (err: any) {
    console.error(`[DELETE /api/admin/faqs/${id}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "FAQ 삭제 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
