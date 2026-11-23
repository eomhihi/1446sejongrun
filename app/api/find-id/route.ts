import { NextRequest, NextResponse } from "next/server";
import { FindIdSchema } from "@/lib/validations/registration";
import { createBlindIndex } from "@/lib/crypto";
import { isVercelPostgresConfigured, prisma } from "@/lib/db";
import { findMockParticipantByPhoneHashAndName } from "@/lib/mockStore";
import { sendReceiptNumberRecoverySms } from "@/lib/sms";

/**
 * [POST /api/find-id - 고유 접수번호 찾기 및 SMS 재발송 API]
 * 
 * Vercel Postgres 기반 서버 사이드 보안 검증 (CWE-200 Information Exposure 방어):
 * - 일치하는 참가자가 존재하더라도 접수번호를 HTTP 응답 화면에 절대 노출하지 않습니다.
 * - 본인 인증이 완료된 원본 휴대폰 번호로만 SMS를 발송합니다.
 * - 등록되지 않은 정보가 입력되더라도 계정 열거(Account Enumeration) 공격을 막기 위해
 *   동일한 성공 메시지("입력하신 연락처로 접수번호를 발송했습니다.")를 반환합니다.
 */
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

    // 1. Zod 입력값 검증 (성명 + 휴대전화 번호)
    const parseResult = FindIdSchema.safeParse(body);
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

    const { name, phone } = parseResult.data;
    const phoneHash = createBlindIndex(phone);

    let foundReceiptNumber: string | null = null;
    let foundName: string | null = null;

    // 2. [Vercel Postgres + Prisma] 서버 사이드 권한 검증 및 조회
    if (isVercelPostgresConfigured()) {
      const record = await prisma.participant.findFirst({
        where: {
          phoneHash,
          name: name.trim(),
          status: { not: "CANCELLED" },
        },
        select: {
          receiptNumber: true,
          name: true,
        },
      });

      if (record) {
        foundReceiptNumber = record.receiptNumber;
        foundName = record.name;
      }
    } else {
      const mockRecord = findMockParticipantByPhoneHashAndName(phoneHash, name);
      if (mockRecord) {
        foundReceiptNumber = mockRecord.receiptNumber;
        foundName = mockRecord.name;
      }
    }

    // 3. 일치하는 레코드가 존재할 경우에만 백그라운드로 SMS 발송 (CWE-200 방어)
    if (foundReceiptNumber && foundName) {
      sendReceiptNumberRecoverySms({
        to: phone,
        name: foundName,
        receiptNumber: foundReceiptNumber,
      }).catch((smsErr) => {
        console.error("[RECOVERY_SMS_ERROR]", smsErr);
      });

      console.info("[FIND_ID_DISPATCHED]", {
        phoneHash,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.info("[FIND_ID_NO_MATCH_SILENT]", {
        phoneHash,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }

    // 4. [CWE-200 방어 원칙] 일치 여부와 관계없이 동일한 통일 응답 반환
    return NextResponse.json({
      success: true,
      message: "입력하신 연락처로 접수번호를 발송했습니다.",
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[FIND_ID_ERROR]", {
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
