import { NextRequest, NextResponse } from "next/server";
import { LookupSchema } from "@/lib/validations/registration";
import { createBlindIndex } from "@/lib/crypto";
import { isVercelPostgresConfigured, prisma } from "@/lib/db";
import { findMockParticipantByPhoneHashAndReceiptNumber } from "@/lib/mockStore";
import { EVENT_LOCATION } from "@/constants/event";

// 성명 마스킹 헬퍼 (예: 홍길동 -> 홍*동, 이산 -> 이*)
function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, code: "ERR_BAD_REQUEST", message: "유효한 JSON 요청 본문이 아닙니다." },
        { status: 400 }
      );
    }

    // 1. Zod 입력값 검증 (전화번호 정규식 + 6자리 Alphanumeric 접수번호 검증)
    const parseResult = LookupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: "ERR_VALIDATION_FAILED",
          message: parseResult.error.issues[0]?.message || "입력 형식이 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    const { phone, receiptNumber } = parseResult.data;
    const phoneHash = createBlindIndex(phone);
    const normalizedReceiptNumber = receiptNumber.trim().toUpperCase();

    let participant: {
      bibNumber: string;
      receiptNumber: string;
      name: string;
      course: string;
      shirtSize: string;
      status?: string;
    } | null = null;

    // 2. [Vercel Postgres + Prisma] 서버 사이드 권한 검증 및 조회 (RLS 대체)
    if (isVercelPostgresConfigured()) {
      const record = await prisma.participant.findFirst({
        where: {
          phoneHash,
          receiptNumber: normalizedReceiptNumber,
          status: { not: "CANCELLED" },
        },
        select: {
          bibNumber: true,
          receiptNumber: true,
          name: true,
          courseType: true,
          shirtSize: true,
          status: true,
        },
      });

      if (!record) {
        return NextResponse.json(
          {
            success: false,
            code: "ERR_AUTHENTICATION_FAILED",
            message: "등록된 참가 정보가 없거나 고유 접수번호가 일치하지 않습니다.",
          },
          { status: 401 }
        );
      }

      participant = {
        bibNumber: record.bibNumber,
        receiptNumber: record.receiptNumber,
        name: record.name,
        course: record.courseType,
        shirtSize: record.shirtSize,
        status: record.status,
      };
    } else {
      // 로컬 개발/데모 모드 메모리 저장소 조회
      const mockRecord = findMockParticipantByPhoneHashAndReceiptNumber(
        phoneHash,
        normalizedReceiptNumber
      );

      if (!mockRecord) {
        return NextResponse.json(
          {
            success: false,
            code: "ERR_AUTHENTICATION_FAILED",
            message: "등록된 참가 정보가 없거나 고유 접수번호가 일치하지 않습니다.",
          },
          { status: 401 }
        );
      }

      participant = {
        bibNumber: mockRecord.bibNumber,
        receiptNumber: mockRecord.receiptNumber,
        name: mockRecord.name,
        course: mockRecord.course,
        shirtSize: mockRecord.shirtSize,
        status: "입금 및 참가 확정",
      };
    }

    const duration = Date.now() - startTime;
    console.info("[LOOKUP_SUCCESS]", {
      bibNumber: participant.bibNumber,
      receiptNumber: participant.receiptNumber,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "참가 확정 정보를 성공적으로 조회하였습니다.",
      data: {
        bibNumber: participant.bibNumber,
        receiptNumber: participant.receiptNumber,
        name: maskName(participant.name),
        course: `${participant.course} 마라톤`,
        shirtSize: participant.shirtSize,
        wave: "A그룹 (14:00 세종시청 광장 출발)",
        pickup: `${EVENT_LOCATION} 본부석 사전수령`,
        status: participant.status || "입금 및 참가 확정",
        package: "1446 기능성 한글 티셔츠 + 훈민정음 자모 결합 메달 + 골목 상품권 1만원",
      },
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[LOOKUP_ERROR]", {
      message: error.message,
      stack: error.stack,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        code: "ERR_INTERNAL_SERVER",
        message: "서버 처리 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
