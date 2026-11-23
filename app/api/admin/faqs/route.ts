import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getFaqs, createFaq } from "@/lib/db";

/**
 * ==============================================================================
 * [관리자 전용 FAQ 목록 조회 및 생성 API]
 * GET  /api/admin/faqs
 * POST /api/admin/faqs
 * ==============================================================================
 * 
 * [오철칙 5대 원칙 보안 검증]:
 * 1. 제2철칙 (CWE-306 인증 검증):
 *    관리자 세션이 없으면 즉각 HTTP 401 Unauthorized 반환.
 * 2. 제3철칙 (오류 은폐 금지):
 *    필수 입력 누락 시 구체적인 사유를 명시하여 400 Bad Request 반환.
 */

export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 유효하지 않습니다. (CWE-306)" },
      { status: 401 }
    );
  }

  try {
    const faqs = await getFaqs();
    return NextResponse.json({ success: true, faqs });
  } catch (err: any) {
    console.error("[GET /api/admin/faqs] Error:", err);
    return NextResponse.json(
      { success: false, error: "FAQ 목록을 불러오지 못했습니다.", details: err?.message || String(err) },
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
    const { category, question, answer, sortOrder } = body;

    if (!category || typeof category !== "string" || category.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "FAQ 카테고리(접수/코스/결제/기타 등)를 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "FAQ 질문 내용을 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "FAQ 답변 내용을 입력해 주세요." },
        { status: 400 }
      );
    }

    const newFaq = await createFaq({
      category: category.trim(),
      question: question.trim(),
      answer: answer.trim(),
      sortOrder: typeof sortOrder === "number" ? sortOrder : Number(sortOrder) || 0,
    });

    return NextResponse.json({
      success: true,
      message: "FAQ가 성공적으로 등록되었습니다.",
      faq: newFaq,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/faqs] Error:", err);
    return NextResponse.json(
      { success: false, error: "FAQ 등록 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
