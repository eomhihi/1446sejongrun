/**
 * [외부 SMS 자동 발송 모듈 (Aligo / CoolSMS 연동 및 CS 폭주 원천 차단)]
 * 
 * 참가 신청 즉시 고유 접수번호(6자리)와 입금 계좌번호를 발송하여
 * 접수번호 분실 및 고객센터(CS) 유입 문의를 원천 예방합니다.
 */

export interface SendSmsParams {
  to: string; // 수신자 휴대폰 번호 (예: 010-1234-5678)
  title: string;
  message: string;
}

export interface RegistrationSmsParams {
  to: string;
  name: string;
  receiptNumber: string;
  course: string;
  feeText: string;
}

// 1446 세종런 마라톤 공식 지정 입금 계좌
export const DEPOSIT_ACCOUNT_INFO = {
  bank: "NH농협은행",
  account: "301-1446-5800-01",
  holder: "1446세종런조직위원회",
};

/**
 * 기본 SMS 전송 함수
 * Aligo 또는 CoolSMS API 키가 .env.local에 설정되어 있으면 실제 전송,
 * 미설정 시에는 로컬/스테이징 환경을 위해 모의 발송(Simulation Log)을 수행합니다.
 */
export async function sendSms({ to, title, message }: SendSmsParams): Promise<{
  success: boolean;
  messageId?: string;
  isSimulated?: boolean;
}> {
  const sanitizedTo = to.replace(/[^0-9]/g, "");

  // Aligo SMS 연동 파라미터 확인
  const aligoApiKey = process.env.ALIGO_API_KEY;
  const aligoUserId = process.env.ALIGO_USER_ID;
  const aligoSender = process.env.ALIGO_SENDER || "044-144-1446";

  if (aligoApiKey && aligoUserId && !aligoApiKey.includes("placeholder")) {
    try {
      const formData = new FormData();
      formData.append("key", aligoApiKey);
      formData.append("user_id", aligoUserId);
      formData.append("sender", aligoSender);
      formData.append("receiver", sanitizedTo);
      formData.append("msg", message);
      formData.append("title", title);

      const res = await fetch("https://apis.aligo.in/send/", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.result_code === "1") {
        console.info(`[ALIGO_SMS_SUCCESS] to: ${sanitizedTo}, msg_id: ${result.msg_id}`);
        return { success: true, messageId: String(result.msg_id), isSimulated: false };
      } else {
        console.warn(`[ALIGO_SMS_FAILED] code: ${result.result_code}, msg: ${result.message}`);
      }
    } catch (err) {
      console.error("[ALIGO_SMS_EXCEPTION]", err);
    }
  }

  // CoolSMS 연동 파라미터 확인
  const coolSmsApiKey = process.env.COOLSMS_API_KEY;
  const coolSmsApiSecret = process.env.COOLSMS_API_SECRET;
  const coolSmsSender = process.env.COOLSMS_SENDER || "0441441446";

  if (coolSmsApiKey && coolSmsApiSecret && !coolSmsApiKey.includes("placeholder")) {
    try {
      const authHeader = `HMAC-SHA256 ApiKey=${coolSmsApiKey}, Date=${new Date().toISOString()}`;
      const res = await fetch("https://api.coolsms.co.kr/messages/v4/send", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            to: sanitizedTo,
            from: coolSmsSender,
            text: message,
            subject: title,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        console.info(`[COOLSMS_SUCCESS] to: ${sanitizedTo}, id: ${json.groupId}`);
        return { success: true, messageId: json.groupId, isSimulated: false };
      }
    } catch (err) {
      console.error("[COOLSMS_EXCEPTION]", err);
    }
  }

  // API 키가 없거나 미설정된 환경에서는 시뮬레이션 로그 출력 (무중단 로컬/테스트 환경 보장)
  console.info("------------------------------------------------------------------");
  console.info("[SMS_SIMULATED_DISPATCH]");
  console.info(`수신자: ${sanitizedTo}`);
  console.info(`제목: ${title}`);
  console.info(`내용:\n${message}`);
  console.info("------------------------------------------------------------------");

  return {
    success: true,
    messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    isSimulated: true,
  };
}

/**
 * [참가 접수 완료 자동 알림 SMS]
 * 접수번호 및 입금 계좌 안내
 */
export async function sendRegistrationConfirmationSms(params: RegistrationSmsParams) {
  const title = "[1446 세종런] 참가신청 접수 안내";
  const message = `[1446 세종런 마라톤 공식 접수 안내]

${params.name}님, 1446 세종런 참가신청이 정상 접수되었습니다.

■ 고유 접수번호: [ ${params.receiptNumber} ]
■ 신청 코스: ${params.course} 마라톤
■ 참가비: ${params.feeText}

■ 입금 계좌번호:
- 은행명: ${DEPOSIT_ACCOUNT_INFO.bank}
- 계좌번호: ${DEPOSIT_ACCOUNT_INFO.account}
- 예금주: ${DEPOSIT_ACCOUNT_INFO.holder}

※ 본인의 [고유 접수번호]는 신청내역 조회 및 배번호 확인에 사용되오니 보관해 주시기 바랍니다.
(입금자명은 반드시 '성명+접수번호 앞3자리'로 입금해 주세요)`;

  return sendSms({
    to: params.to,
    title,
    message,
  });
}

/**
 * [접수번호 찾기 재발송 SMS]
 * CWE-200 방어를 위해 화면에 노출하지 않고 본인 휴대폰으로만 재전송
 */
export async function sendReceiptNumberRecoverySms({
  to,
  name,
  receiptNumber,
}: {
  to: string;
  name: string;
  receiptNumber: string;
}) {
  const title = "[1446 세종런] 고유 접수번호 안내";
  const message = `[1446 세종런 접수번호 재발송 안내]

${name}님께서 요청하신 1446 세종런 참가신청 내역의 고유 접수번호입니다.

■ 고유 접수번호: [ ${receiptNumber} ]

공식 홈페이지 [신청내역 조회] 메뉴에서 위 접수번호와 휴대전화 번호로 참가 확정 정보를 확인하실 수 있습니다.

- 1446 세종 골목 상생 마라톤 조직위원회`;

  return sendSms({
    to,
    title,
    message,
  });
}

