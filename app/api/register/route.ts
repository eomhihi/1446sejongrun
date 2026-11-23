import { NextRequest, NextResponse } from "next/server";
import { RegistrationSchema } from "@/lib/validations/registration";
import { encryptData, createBlindIndex, generateReceiptNumber } from "@/lib/crypto";
import { isVercelPostgresConfigured, registerParticipantAtomic } from "@/lib/db";
import { saveMockParticipant, hasMockParticipantPhoneHash } from "@/lib/mockStore";
import { sendRegistrationConfirmationSms } from "@/lib/sms";

const COURSE_FEES: Record<string, string> = {
  "14.46km": "45,000원",
  "10km": "40,000원",
  "5km": "35,000원",
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";

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

    // 1. Zod 전수 데이터 검증 (CWE-20 차단)
    const parseResult = RegistrationSchema.safeParse(body);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parseResult.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      return NextResponse.json(
        {
          success: false,
          code: "ERR_VALIDATION_FAILED",
          message: "입력값 형식이 올바르지 않습니다.",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // 2. [제1철칙] 고유 접수번호(Alphanumeric 6자리) 발급 및 서버 사이드 암호화
    const receiptNumber = generateReceiptNumber(); // 예: A7X9Q2
    const phoneEncrypted = encryptData(data.phone);
    const phoneHash = createBlindIndex(data.phone);

    let bibNumber: string;
    let registrationId: string;

    // 3. [Vercel Postgres + Prisma] 원자적 트랜잭션 동시성 제어
    if (isVercelPostgresConfigured()) {
      try {
        const result = await registerParticipantAtomic({
          courseType: data.course,
          name: data.name,
          phoneEncrypted,
          phoneHash,
          receiptNumber,
          shirtSize: data.shirtSize,
          ipAddress: clientIp,
          userAgent,
        });

        bibNumber = result.bibNumber;
        registrationId = result.id;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        if (message.includes("CAPACITY_EXCEEDED")) {
          return NextResponse.json(
            {
              success: false,
              code: "ERR_CAPACITY_EXCEEDED",
              message: `해당 코스(${data.course})의 참가 정원이 조기 마감되었습니다.`,
            },
            { status: 409 }
          );
        }

        if (message.includes("DUPLICATE_REGISTRATION")) {
          return NextResponse.json(
            {
              success: false,
              code: "ERR_DUPLICATE_REGISTRATION",
              message: "이미 동일한 휴대전화 번호로 접수된 참가 내역이 존재합니다.",
            },
            { status: 409 }
          );
        }

        console.error("[VERCEL_POSTGRES_TRANSACTION_ERROR]", err);
        throw new Error("데이터베이스 트랜잭션 처리 중 오류가 발생했습니다.");
      }
    } else {
      // 로컬 개발/데모 모드: 인메모리 저장소 연동
      if (hasMockParticipantPhoneHash(phoneHash)) {
        return NextResponse.json(
          {
            success: false,
            code: "ERR_DUPLICATE_REGISTRATION",
            message: "이미 동일한 휴대전화 번호로 접수된 참가 내역이 존재합니다.",
          },
          { status: 409 }
        );
      }

      const mockSaved = saveMockParticipant({
        receiptNumber,
        name: data.name,
        phone: data.phone,
        phoneHash,
        course: data.course,
        shirtSize: data.shirtSize,
      });

      bibNumber = mockSaved.bibNumber;
      registrationId = mockSaved.id;
    }

    // 4. [제3지침] 트랜잭션 성공 후단 자동 SMS 발송 연동
    sendRegistrationConfirmationSms({
      to: data.phone,
      name: data.name,
      receiptNumber,
      course: data.course,
      feeText: COURSE_FEES[data.course] || "40,000원",
    }).catch((smsErr) => {
      console.error("[SMS_DISPATCH_BACKGROUND_ERROR]", smsErr);
    });

    const duration = Date.now() - startTime;
    console.info("[REGISTRATION_SUCCESS]", {
      bibNumber,
      receiptNumber,
      course: data.course,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "1446 세종런 참가신청이 정상 접수되었습니다.",
        data: {
          registrationId,
          bibNumber,
          receiptNumber,
          course: data.course,
          name: data.name,
          shirtSize: data.shirtSize,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[REGISTRATION_ERROR]", {
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
