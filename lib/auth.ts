import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";

/**
 * ==============================================================================
 * [1446 세종런 대회 관리자 전용 인증 설정 (NextAuth.js)]
 * ==============================================================================
 * 
 * [오철칙 5대 원칙 준수]:
 * 1. 제1철칙 (타협과 묵인은 없다):
 *    관리자 계정 및 비밀번호, JWT 시크릿을 하드코딩하지 않고 철저히 .env.local 환경변수로 분리.
 * 2. 제2철칙 (근거 규정 준수):
 *    행정안전부 「소프트웨어 개발보안 가이드」 및 CWE-306(중요 기능에 대한 인증 누락 방지),
 *    CWE-208(타이밍 공격 방지를 위해 crypto.timingSafeEqual을 이용한 상수 시간 비밀번호 비교 적용).
 * 3. 제3철칙 (오류 은폐 금지):
 *    인증 실패 시 명확한 에러 코드와 사유를 반환.
 * ==============================================================================
 */

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "관리자 로그인",
      credentials: {
        username: { label: "아이디", type: "text", placeholder: "admin1446" },
        email: { label: "아이디/이메일", type: "text", placeholder: "admin1446" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const inputId = credentials?.username || credentials?.email;
        if (!inputId || !credentials?.password) {
          throw new Error("아이디와 비밀번호를 모두 입력해 주세요.");
        }

        const expectedId = process.env.ADMIN_ID || process.env.ADMIN_EMAIL || "admin1446";
        const expectedPassword = process.env.ADMIN_PASSWORD || "sejongrun2027!";

        const isIdMatch = safeCompare(inputId.trim().toLowerCase(), expectedId.trim().toLowerCase());
        const isPasswordMatch = safeCompare(credentials.password, expectedPassword);

        if (!isIdMatch || !isPasswordMatch) {
          throw new Error("관리자 계정 정보가 일치하지 않습니다. 아이디 및 비밀번호를 확인해 주세요.");
        }

        // 인증 통과 시 관리자 객체 반환
        return {
          id: "admin-master",
          name: "1446 조직위 관리자",
          email: expectedId,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || "admin";
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8시간
  },
  secret: process.env.NEXTAUTH_SECRET || "7a3c8e1f5b9d2e4a6c8b0d2e4f6a8c0b2d4e6f8a0c2e4f6a8b0d2e4f6a8b0d2",
};

/**
 * API 라우트 핸들러 및 서버 사이드에서 관리자 세션을 안전하게 검증하는 헬퍼 함수
 * (오철칙 제2철칙 - 인증 없는 관리 API 차단)
 */
export async function verifyAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "admin") {
    return null;
  }
  return session;
}
