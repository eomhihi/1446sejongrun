import { createClient } from "@supabase/supabase-js";

/**
 * ==============================================================================
 * [2. Supabase Connection Pooler 연동 가이드 및 데이터베이스 아키텍처]
 * ==============================================================================
 * 
 * 1. 서버리스 환경의 DB 커넥션 고갈(Connection Exhaustion, CWE-770) 문제:
 *    - Next.js Vercel 서버리스/에지 환경에서는 대규모 트래픽(예: 5,000명 동시 접수) 발생 시
 *      수천 개의 독립적인 인스턴스가 생성됩니다.
 *    - PostgreSQL의 기본 직접 연결 포트(5432)는 각 인스턴스마다 1개의 TCP 연결을 맺어
 *      데이터베이스의 max_connections (보통 60~100개)를 수 초 만에 초과하며
 *      "FATAL: remaining connection slots are reserved for non-replication superuser connections"
 *      또는 "Connection Refused" 장애를 일으킵니다.
 * 
 * 2. Supabase Connection Pooler (PgBouncer, 포트 6543, Transaction Mode) 솔루션:
 *    - 기본 포트 5432 대신 포트 6543 (PgBouncer)을 사용하면 수천 개의 서버리스 클라이언트가
 *      20~30개의 물리 DB 커넥션을 트랜잭션 단위로 신속히 재사용(Multiplexing)합니다.
 *    - 트랜잭션 모드(Transaction Mode)에서는 쿼리/트랜잭션이 완료되는 즉시 풀로 커넥션이 반환되므로
 *      5,000명 동시 접속 시에도 커넥션 고갈 없이 100% 안정적으로 트래픽을 처리합니다.
 * 
 * 3. 환경변수(.env.local) 설정 가이드:
 *    --------------------------------------------------------------------------
 *    # [Direct Connection - DB 마이그레이션 전용 (포트 5432)]
 *    DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres?sslmode=require"
 * 
 *    # [Connection Pooler - 서버리스 프로덕션 런타임 전용 (포트 6543, Transaction Mode)]
 *    DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1"
 * 
 *    # [Supabase REST / GraphQL API Keys]
 *    NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # 클라이언트 공개용 (RLS 적용)
 *    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."     # 서버 전용 (RLS 우회 감사 권한)
 *    --------------------------------------------------------------------------
 * 
 * 4. Prisma 사용 시 schema.prisma 권장 설정:
 *    --------------------------------------------------------------------------
 *    datasource db {
 *      provider  = "postgresql"
 *      url       = env("DATABASE_URL") // Connection Pooler (포트 6543)
 *      directUrl = env("DIRECT_URL")   // Direct Connection (포트 5432, migration 전용)
 *    }
 *    --------------------------------------------------------------------------
 * ==============================================================================
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

/**
 * [클라이언트 및 미인증 사용자용 Supabase 인스턴스]
 * Row Level Security (RLS) 정책이 엄격하게 적용됩니다.
 */
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

/**
 * [서버 사이드 백엔드 전용 관리자 Supabase 인스턴스]
 * 개인정보 암호화 저장, 동시성 카운터 업데이트(RPC), 감사 로그 기록에 사용됩니다.
 * 절대 브라우저(클라이언트) 컴포넌트로 전달되어서는 안 됩니다.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

