import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { verifyAdminSession } from "@/lib/auth";
import { replacePartnerShopsAtomic, PartnerShopInput } from "@/lib/db";

/**
 * ==============================================================================
 * [참여 상점 엑셀(CSV) 일괄 업로드 API]
 * POST /api/admin/shops/upload
 * ==============================================================================
 * 
 * [오철칙 5대 원칙 보안 검증]:
 * 1. 제1철칙 (타협과 묵인은 없다):
 *    관리자 권한 없는 업로드는 즉각 거부하며, DB 작업은 원자적 트랜잭션으로 All-or-Nothing 보장.
 * 2. 제2철칙 (근거 규정 준수):
 *    행정안전부 「소프트웨어 개발보안 가이드」 및 CWE-306(인증 없는 중요 기능 실행 방지)에 따라
 *    NextAuth 관리자 세션이 유효하지 않을 경우 즉각 HTTP 401 Unauthorized 반환.
 * 3. 제3철칙 (병신같이 덮지 않는다 / 예외 삼키기 금지):
 *    CSV 파싱 또는 데이터 검증 실패 시 에러를 조용히 넘기지 않고, 정확한 행 번호와 원인을
 *    관리자에게 상세히 반환 (예: "3번째 행: capacity 열에 숫자가 아닌 값('열명')이 있습니다").
 * ==============================================================================
 */

export async function POST(req: NextRequest) {
  // 1. [오철칙 제2철칙] 관리자 세션 검증
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "관리자 인증 세션이 필요합니다. 로그인 후 다시 시도해 주세요. (CWE-306 인증 우회 차단)",
      },
      { status: 401 }
    );
  }

  try {
    let csvContent = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: "업로드할 CSV 파일이 첨부되지 않았습니다. 'file' 필드로 CSV 파일을 전송해 주세요.",
          },
          { status: 400 }
        );
      }
      csvContent = await file.text();
    } else {
      // 텍스트/CSV 본문 직접 전달 지원
      csvContent = await req.text();
    }

    if (!csvContent || csvContent.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV 파일의 내용이 비어 있습니다. 유효한 데이터를 포함한 파일을 업로드해 주세요.",
        },
        { status: 400 }
      );
    }

    // 2. CSV 파싱 (papaparse)
    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header: string) => header.trim().toLowerCase(),
    });

    if (parsed.errors && parsed.errors.length > 0) {
      const firstError = parsed.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: `CSV 파싱 구문 오류 [${firstError.row ?? "?"}번째 행]: ${firstError.message}`,
        },
        { status: 400 }
      );
    }

    const rows = parsed.data;
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "파싱된 상점 데이터가 0건입니다. CSV 헤더 및 데이터 행을 확인해 주세요.",
        },
        { status: 400 }
      );
    }

    // 필수 헤더 검증
    const requiredHeaders = ["id", "shop_name", "category", "address", "discount_info", "capacity"];
    const actualHeaders = parsed.meta.fields || [];
    const missingHeaders = requiredHeaders.filter(
      (rh) => !actualHeaders.some((ah) => ah === rh || ah.replace(/\s+/g, "_") === rh)
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `[헤더 누락 오류] 필수 CSV 헤더가 누락되었습니다: [${missingHeaders.join(", ")}]. (필수 헤더: id, shop_name, category, address, discount_info, capacity)`,
        },
        { status: 400 }
      );
    }

    // 3. [오철칙 제3철칙] 각 행별 엄격한 데이터 유효성 검사 및 상세 오류 메시지 생성
    const validatedShops: PartnerShopInput[] = [];
    const seenIds = new Map<number, number>(); // id -> rowNumber

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // 1-based index (1은 헤더 행)
      const r = rows[i];

      // id 검증
      const rawId = r["id"]?.trim();
      if (!rawId || !/^-?\d+$/.test(rawId)) {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 'id' 열에 올바른 정수 고유번호가 없습니다. (입력값: '${rawId || "공백"}')`,
          },
          { status: 400 }
        );
      }
      const id = parseInt(rawId, 10);
      if (id <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 'id'는 1 이상의 양수여야 합니다. (입력값: ${id})`,
          },
          { status: 400 }
        );
      }

      if (seenIds.has(id)) {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 중복된 고유번호 'id=${id}'가 ${seenIds.get(id)}번째 행과 중복됩니다. 모든 상점의 id는 유일해야 합니다.`,
          },
          { status: 400 }
        );
      }
      seenIds.set(id, rowNum);

      // shop_name 검증
      const shopName = r["shop_name"]?.trim() || r["shopname"]?.trim() || "";
      if (!shopName) {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 'shop_name'(상호명)이 비어 있습니다.`,
          },
          { status: 400 }
        );
      }

      // category 검증
      const category = r["category"]?.trim() || "";
      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 'category'(분류 - 식당/카페/기타 등)가 비어 있습니다.`,
          },
          { status: 400 }
        );
      }

      // address 검증
      const address = r["address"]?.trim() || "";
      if (!address) {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 'address'(도로명 주소)가 비어 있습니다.`,
          },
          { status: 400 }
        );
      }

      // discount_info 검증
      const discountInfo = r["discount_info"]?.trim() || r["discountinfo"]?.trim() || "";
      if (!discountInfo) {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 'discount_info'(1446 애프터런 혜택/할인 내용)가 비어 있습니다.`,
          },
          { status: 400 }
        );
      }

      // capacity 검증 (수용 가능 인원 - 반드시 숫자여야 함)
      const rawCap = r["capacity"]?.trim();
      if (rawCap === undefined || rawCap === null || rawCap === "") {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 'capacity'(수용 가능 인원) 값이 누락되었습니다. 숫자를 입력해야 합니다.`,
          },
          { status: 400 }
        );
      }

      const capacity = Number(rawCap);
      if (isNaN(capacity) || !Number.isInteger(capacity) || capacity < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `[${rowNum}번째 행 검증 실패] 'capacity' 열에 숫자가 아닌 유효하지 않은 값('${rawCap}')이 있습니다. 0 이상의 정수를 입력해야 합니다.`,
          },
          { status: 400 }
        );
      }

      validatedShops.push({
        id,
        shopName,
        category,
        address,
        discountInfo,
        capacity,
      });
    }

    // 4. [원자적 트랜잭션 덮어쓰기] DB 전체 갱신 (Atomic Replace)
    const result = await replacePartnerShopsAtomic(validatedShops);

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `총 ${result.count}개의 참여 상점 데이터가 성공적으로 교체 및 갱신되었습니다.`,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/shops/upload Error]:", error);
    // [오철칙 제3철칙] 예외를 은폐하지 않고 구체적인 원인 노출
    return NextResponse.json(
      {
        success: false,
        error: `상점 데이터 DB 갱신 중 트랜잭션 오류가 발생했습니다: ${error.message || String(error)}`,
      },
      { status: 500 }
    );
  }
}
