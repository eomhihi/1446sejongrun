import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

/**
 * ==============================================================================
 * [관리자 전용 후원사 로고 이미지 보안 업로드 API]
 * POST /api/admin/sponsors/upload
 * ==============================================================================
 * 
 * [오철칙 5대 원칙 보안 검증 - CWE-434 위험 파일 무제한 업로드 방지]:
 * 1. 제1철칙: 비인가자 차단 (CWE-306), 세션 검증 필수.
 * 2. 제2철칙 & 제3철칙:
 *    - 허용 MIME 타입 검증: image/png, image/jpeg, image/svg+xml, image/webp
 *    - 허용 확장자 검증: .png, .jpg, .jpeg, .svg, .webp
 *    - 용량 제한: 최대 2MB (2 * 1024 * 1024 bytes)
 *    - 에러 발생 시 구체적인 사유 반환.
 * 3. 제5철칙:
 *    - 원본 파일명을 직접 사용하지 않고, crypto.randomUUID() 기반 무작위 고유 해시명 사용
 *      (경로 조작 CWE-22 Directory Traversal 및 악성 확장자 변조 방지).
 * 4. Vercel Blob 연동:
 *    - BLOB_READ_WRITE_TOKEN이 세팅된 경우 @vercel/blob의 put()으로 클라우드 업로드.
 *    - 로컬 개발 환경인 경우 public/uploads/sponsors/에 안전하게 기록.
 * ==============================================================================
 */

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".svg", ".webp"]);
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  // 1. 관리자 세션 검증
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (CWE-306)" },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "업로드할 로고 이미지 파일('file' 필드)이 첨부되지 않았습니다." },
        { status: 400 }
      );
    }

    // 2. 파일 용량 검증
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `파일 용량이 2MB를 초과했습니다. (현재: ${(file.size / (1024 * 1024)).toFixed(2)}MB, 최대: 2MB)`,
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "첨부된 파일의 크기가 0바이트입니다." },
        { status: 400 }
      );
    }

    // 3. 파일 MIME 타입 검증
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `허용되지 않는 파일 형식입니다 (${mimeType}). PNG, JPG, SVG, WebP 이미지 파일만 업로드할 수 있습니다.`,
        },
        { status: 400 }
      );
    }

    // 4. 확장자 검증 및 안전한 파일명 생성
    const originalExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(originalExt)) {
      return NextResponse.json(
        {
          success: false,
          error: `허용되지 않는 파일 확장자입니다 (${originalExt}). .png, .jpg, .svg, .webp 확장자만 허용됩니다.`,
        },
        { status: 400 }
      );
    }

    const safeFilename = `${crypto.randomUUID()}${originalExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 5. Vercel Blob 또는 로컬 디렉토리 저장
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`sponsors/${safeFilename}`, fileBuffer, {
          access: "public",
          contentType: mimeType,
        });
        return NextResponse.json({
          success: true,
          url: blob.url,
          filename: safeFilename,
          storage: "vercel-blob",
        });
      } catch (blobErr: any) {
        console.warn("[Upload] Vercel Blob 업로드 실패, 로컬 스토리지로 대체:", blobErr);
      }
    }

    // 로컬 스토리지 저장 (public/uploads/sponsors/)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "sponsors");
    await fs.mkdir(uploadDir, { recursive: true });

    const targetPath = path.join(uploadDir, safeFilename);
    await fs.writeFile(targetPath, fileBuffer);

    const publicUrl = `/uploads/sponsors/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      storage: "local",
    });
  } catch (err: any) {
    console.error("[POST /api/admin/sponsors/upload] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "로고 이미지 업로드 처리 중 서버 오류가 발생했습니다.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
