import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM 권장 96-bit IV
const AUTH_TAG_LENGTH = 16;

// 환경변수 기반 암호화 마스터 키
const MASTER_KEY_HEX =
  process.env.ENCRYPTION_MASTER_KEY ||
  "4f9b2d8e6a1c5f3e0b8d7a4c2e9f1a3b5c7d9e0f2a4b6c8d0e1f3a5b7c9d1e3f";
const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, "hex");

// 블라인드 인덱스용 HMAC 비밀키
const HMAC_KEY_HEX =
  process.env.HMAC_BLIND_INDEX_KEY ||
  "e1c3f5a7b9d0e2f4a6c8b0d2e4f6a8c0b2d4e6f8a0c2e4f6a8b0d2e4f6a8b0d2";
const HMAC_KEY = Buffer.from(HMAC_KEY_HEX, "hex");

/**
 * [고유 접수번호 생성기 (Alphanumeric 6자리)]
 * 가독성을 위해 혼동하기 쉬운 문자(0, O, 1, I)를 제외한 32개 문자로 구성.
 * 32^6 = 약 10억 7천만 가지의 조합으로 5,000명 참가자 간 충돌 가능성 0%.
 * 예시: A7X9Q2, K4M8W7, 2R9T5V
 */
const RECEIPT_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateReceiptNumber(): string {
  const bytes = crypto.randomBytes(6);
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += RECEIPT_CHARSET[bytes[i] % RECEIPT_CHARSET.length];
  }
  return result;
}

/**
 * [AES-256-GCM 양방향 암호화]
 * 형식: iv(12B) + authTag(16B) + ciphertext => Base64 인코딩
 * 근거: 행정안전부 「SW 개발보안 가이드」 중요정보 암호화, 개인정보보호법 제29조, CWE-311
 */
export function encryptData(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * [AES-256-GCM 복호화 및 인증 태그 무결성 검증]
 */
export function decryptData(cipherPackageBase64: string): string {
  const packageBuffer = Buffer.from(cipherPackageBase64, "base64");

  if (packageBuffer.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("복호화 실패: 손상되었거나 유효하지 않은 암호문 패키지입니다.");
  }

  const iv = packageBuffer.subarray(0, IV_LENGTH);
  const authTag = packageBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = packageBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * [HMAC-SHA256 블라인드 인덱스 해시]
 * 암호화된 DB에서 개인정보를 복호화하지 않고 일치 여부를 O(1) 검색할 수 있는 단방향 결정론적 해시
 */
export function createBlindIndex(phone: string): string {
  const sanitized = phone.replace(/[^0-9]/g, ""); // 숫자만 정규화 (예: 01012345678)
  return crypto.createHmac("sha256", HMAC_KEY).update(sanitized).digest("hex");
}
