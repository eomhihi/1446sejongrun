import { z } from "zod";

export const MARATHON_COURSES = ["14.46km", "10km", "5km"] as const;
export const SHIRT_SIZES = ["S(90)", "M(95)", "L(100)", "XL(105)", "2XL(110)"] as const;

/**
 * [참가 등록 요청 Zod 스키마]
 * 전수 입력값 검증 (CWE-20, CWE-89 차단)
 */
export const RegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "참가자 성명은 2자 이상 입력해야 합니다.")
    .max(50, "참가자 성명은 50자 이내여야 합니다.")
    .regex(/^[가-힣a-zA-Z\s]+$/, "성명에는 특수문자나 숫자가 포함될 수 없습니다."),
  phone: z
    .string()
    .trim()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, "올바른 휴대전화 번호 형식이 아닙니다 (예: 010-1234-5678)."),
  course: z.enum(MARATHON_COURSES, {
    message: "올바른 마라톤 코스를 선택하세요.",
  }),
  shirtSize: z.enum(SHIRT_SIZES, {
    message: "올바른 티셔츠 사이즈를 선택하세요.",
  }),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;

/**
 * [비회원 참가내역 조회 요청 Zod 스키마]
 * 휴대전화 번호 + 고유 접수번호(Alphanumeric 6자리)
 */
export const LookupSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, "올바른 휴대전화 번호 형식이 아닙니다."),
  receiptNumber: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{6}$/, "고유 접수번호는 영문·숫자 6자리입니다."),
});

export type LookupInput = z.infer<typeof LookupSchema>;

/**
 * [접수번호 찾기 요청 Zod 스키마]
 * 성명 + 휴대전화 번호 (CWE-200 방어를 위한 SMS 재전송 전용)
 */
export const FindIdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "참가자 성명은 2자 이상이어야 합니다.")
    .max(50, "참가자 성명은 50자 이내여야 합니다.")
    .regex(/^[가-힣a-zA-Z\s]+$/, "성명에는 특수문자나 숫자가 포함될 수 없습니다."),
  phone: z
    .string()
    .trim()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, "올바른 휴대전화 번호 형식이 아닙니다."),
});

export type FindIdInput = z.infer<typeof FindIdSchema>;
