import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getMediaVideoById, updateMediaVideo, deleteMediaVideo } from "@/lib/db";

export const dynamic = "force-dynamic";

function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * ==============================================================================
 * [관리자 전용 개별 영상 수정 (메인 노출 토글 포함) 및 삭제 API]
 * PUT    /api/admin/media/[id]
 * DELETE /api/admin/media/[id]
 * ==============================================================================
 */

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (CWE-306)" },
      { status: 401 }
    );
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "유효하지 않은 영상 ID 번호입니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getMediaVideoById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `ID ${id}번에 해당하는 영상을 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.youtubeUrlOrId !== undefined) {
      const parsedId = extractYouTubeId(body.youtubeUrlOrId);
      if (parsedId) updateData.youtubeId = parsedId;
    }
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.type !== undefined) updateData.type = String(body.type).trim();
    if (body.isMainExposure !== undefined) updateData.isMainExposure = Boolean(body.isMainExposure);

    const updated = await updateMediaVideo(id, updateData);

    return NextResponse.json({
      success: true,
      message: "영상 정보가 성공적으로 갱신되었습니다.",
      video: updated,
    });
  } catch (err: any) {
    console.error(`[PUT /api/admin/media/${id}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "영상 수정 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "관리자 인증 세션이 필요합니다. (CWE-306)" },
      { status: 401 }
    );
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "유효하지 않은 영상 ID 번호입니다." },
      { status: 400 }
    );
  }

  try {
    const existing = await getMediaVideoById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `ID ${id}번에 해당하는 영상을 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    await deleteMediaVideo(id);

    return NextResponse.json({
      success: true,
      message: `ID ${id}번 영상이 안전하게 삭제되었습니다.`,
    });
  } catch (err: any) {
    console.error(`[DELETE /api/admin/media/${id}] Error:`, err);
    return NextResponse.json(
      { success: false, error: "영상 삭제 중 오류가 발생했습니다.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
