import { PrismaClient } from "@prisma/client";

/**
 * ==============================================================================
 * [1. Vercel Postgres (Neon 기반) + Prisma ORM 연동 싱글톤]
 * ==============================================================================
 * 
 * 1. Vercel Postgres Connection Pooling 연동:
 *    - Vercel Postgres는 Neon의 Connection Pooler(PgBouncer, 포트 6543)를 통해
 *      대규모 서버리스 동시 요청(5,000명 동시 접속) 시 커넥션 고갈을 원천 차단합니다.
 *    - POSTGRES_PRISMA_URL은 pgbouncer=true 플래그가 자동 포함된 풀링 URL입니다.
 * 
 * 2. Next.js HMR(Hot Module Replacement) 중복 인스턴스 방지:
 *    - globalThis에 인스턴스를 캐싱하여 개발 환경 리로드 시 DB 커넥션 누수를 방지합니다.
 * ==============================================================================
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const isVercelPostgresConfigured = (): boolean => {
  const url = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  return Boolean(url && !url.includes("placeholder"));
};

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

/**
 * [동시성 오버부킹 해결: 원자적 트랜잭션 (Atomic Transaction)]
 * 
 * 5,000명 선착순 동시 등록 시 발생할 수 있는 Phantom Read 및 정원 초과(Overbooking)를 방지하기 위해:
 * 1. 단일 SQL 수준의 원자적 UPDATE ... WHERE current_count < max_limit 실행
 * 2. 조건 미충족(정원 마감) 시 0행이 수정되어 즉각 트랜잭션 롤백 및 CAPACITY_EXCEEDED 예외 발생
 * 3. 성공 시에만 참가자 INSERT 및 감사 로그가 단일 원자적 단위로 커밋됩니다.
 */
export async function registerParticipantAtomic({
  courseType,
  name,
  phoneEncrypted,
  phoneHash,
  receiptNumber,
  shirtSize,
  ipAddress,
  userAgent,
}: {
  courseType: string;
  name: string;
  phoneEncrypted: string;
  phoneHash: string;
  receiptNumber: string;
  shirtSize: string;
  ipAddress: string;
  userAgent: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. 중복 접수 방지 (Blind Index 기반 O(1) 검증)
    const existing = await tx.participant.findFirst({
      where: {
        phoneHash,
        status: { not: "CANCELLED" },
      },
      select: { id: true },
    });

    if (existing) {
      throw new Error("DUPLICATE_REGISTRATION");
    }

    // 2. [원자적 정원 차감 - 동시성 락 해결]
    // 코스 마스터 레코드가 없을 경우를 대비해 초기화(UPSERT) 보장
    await tx.$executeRaw`
      INSERT INTO "course_capacities" ("course_type", "course_name", "max_limit", "current_count", "fee", "version", "created_at", "updated_at")
      VALUES 
        (${courseType}, ${courseType + ' 공식 코스'}, 2000, 0, 45000, 0, NOW(), NOW())
      ON CONFLICT ("course_type") DO NOTHING;
    `;

    // 조건부 원자적 업데이트: current_count < max_limit 일 때만 1 증가
    const affectedRows = await tx.$executeRaw`
      UPDATE "course_capacities"
      SET "current_count" = "current_count" + 1,
          "version" = "version" + 1,
          "updated_at" = NOW()
      WHERE "course_type" = ${courseType} 
        AND "current_count" < "max_limit";
    `;

    if (affectedRows === 0) {
      throw new Error("CAPACITY_EXCEEDED");
    }

    // 증가된 최신 카운터 조회하여 배번호 발급
    const capacity = await tx.courseCapacity.findUnique({
      where: { courseType },
      select: { currentCount: true },
    });

    const bibNumber = `1446-${String(capacity?.currentCount || 1).padStart(4, "0")}`;

    // 3. 참가자 레코드 삽입 (암호화 데이터)
    const participant = await tx.participant.create({
      data: {
        bibNumber,
        receiptNumber,
        name,
        phoneEncrypted,
        phoneHash,
        courseType,
        shirtSize,
        status: "PAYMENT_PENDING",
      },
    });

    // 4. 개인정보 접속 및 감사 로그 기록
    await tx.registrationAuditLog.create({
      data: {
        participantId: participant.id,
        actionType: "REGISTER",
        ipAddress,
        userAgent,
      },
    });

    return {
      id: participant.id,
      bibNumber: participant.bibNumber,
      receiptNumber: participant.receiptNumber,
      courseType: participant.courseType,
      name: participant.name,
      shirtSize: participant.shirtSize,
    };
  });
}

/**
 * ==============================================================================
 * [2. 참여 상점 엑셀(CSV) 원자적 덮어쓰기 (Atomic Transaction)]
 * ==============================================================================
 * 
 * [오철칙 5대 원칙 준수]:
 * - 제1철칙: 트랜잭션 도중 단 하나의 행이라도 오류가 나면 전체 롤백(All-or-Nothing).
 * - 제2철칙: ACID 원자성 보장으로 기존 데이터를 안전하게 삭제 후 새 데이터로 일괄 교체.
 * - 제3철칙: 예외를 감추지 않고 상위 호출자로 정확한 실패 원인 전달.
 * ==============================================================================
 */
export interface PartnerShopInput {
  id: number;
  shopName: string;
  category: string;
  address: string;
  discountInfo: string;
  capacity: number;
}

export async function replacePartnerShopsAtomic(shops: PartnerShopInput[]) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 기존 상점 데이터 전체 삭제
        await tx.partnerShop.deleteMany({});
        // 새 데이터 일괄 삽입
        const result = await tx.partnerShop.createMany({
          data: shops.map((s) => ({
            id: s.id,
            shopName: s.shopName,
            category: s.category,
            address: s.address,
            discountInfo: s.discountInfo,
            capacity: s.capacity,
          })),
        });
        return { count: result.count };
      });
    } catch (error) {
      console.error("[replacePartnerShopsAtomic] DB Transaction Error:", error);
      throw error;
    }
  }

  // DB 미설정 환경용 인메모리 저장소 대체
  const { replaceMockShops } = await import("./mockStore");
  replaceMockShops(
    shops.map((s) => ({
      ...s,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  );
  return { count: shops.length };
}

export async function getPartnerShops() {
  if (isVercelPostgresConfigured()) {
    try {
      const shops = await prisma.partnerShop.findMany({
        orderBy: { id: "asc" },
      });
      if (shops.length > 0) return shops;
    } catch (err) {
      console.warn("[getPartnerShops] Fallback to mock store:", err);
    }
  }
  const { getMockShops } = await import("./mockStore");
  return getMockShops();
}

/**
 * ==============================================================================
 * [3. 공지사항(Notice) DB 조회 및 관리 CRUD]
 * ==============================================================================
 */
export async function getNotices() {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.notice.findMany({
        orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
      });
    } catch (err) {
      console.warn("[getNotices] Fallback to mock store:", err);
    }
  }
  const { getMockNotices } = await import("./mockStore");
  return getMockNotices();
}

export async function getNoticeById(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.notice.findUnique({
        where: { id },
      });
    } catch (err) {
      console.warn("[getNoticeById] Fallback to mock store:", err);
    }
  }
  const { getMockNoticeById } = await import("./mockStore");
  return getMockNoticeById(id);
}

export async function createNotice(data: {
  title: string;
  content: string;
  isImportant: boolean;
}) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.notice.create({
        data: {
          title: data.title,
          content: data.content,
          isImportant: Boolean(data.isImportant),
        },
      });
    } catch (err) {
      console.error("[createNotice] DB Error:", err);
      throw err;
    }
  }
  const { createMockNotice } = await import("./mockStore");
  return createMockNotice(data);
}

export async function updateNotice(
  id: number,
  data: {
    title?: string;
    content?: string;
    isImportant?: boolean;
  }
) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.notice.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.error("[updateNotice] DB Error:", err);
      throw err;
    }
  }
  const { updateMockNotice } = await import("./mockStore");
  return updateMockNotice(id, data);
}

export async function deleteNotice(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      await prisma.notice.delete({
        where: { id },
      });
      return true;
    } catch (err) {
      console.error("[deleteNotice] DB Error:", err);
      throw err;
    }
  }
  const { deleteMockNotice } = await import("./mockStore");
  return deleteMockNotice(id);
}

/**
 * ==============================================================================
 * [4. FAQ(자주 묻는 질문) DB 조회 및 관리 CRUD]
 * ==============================================================================
 */
export async function getFaqs(category?: string) {
  if (isVercelPostgresConfigured()) {
    try {
      const where = category && category !== "all" ? { category } : {};
      const faqs = await prisma.faq.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      });
      if (faqs.length > 0) {
        return faqs;
      }
      // 테이블이 비어있을 경우 초기 7대 공식 FAQ 자동 시딩
      const { getMockFaqs } = await import("./mockStore");
      const defaultFaqs = getMockFaqs();
      for (const f of defaultFaqs) {
        await prisma.faq.create({
          data: {
            category: f.category,
            question: f.question,
            answer: f.answer,
            sortOrder: f.sortOrder,
          },
        });
      }
      return await prisma.faq.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      });
    } catch (err) {
      console.warn("[getFaqs] Fallback to mock store:", err);
    }
  }
  const { getMockFaqs } = await import("./mockStore");
  return getMockFaqs(category);
}

export async function getFaqById(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.faq.findUnique({ where: { id } });
    } catch (err) {
      console.warn("[getFaqById] Fallback to mock store:", err);
    }
  }
  const { getMockFaqById } = await import("./mockStore");
  return getMockFaqById(id);
}

export async function createFaq(data: {
  category: string;
  question: string;
  answer: string;
  sortOrder?: number;
}) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.faq.create({
        data: {
          category: data.category,
          question: data.question,
          answer: data.answer,
          sortOrder: data.sortOrder ?? 0,
        },
      });
    } catch (err) {
      console.error("[createFaq] DB Error:", err);
      throw err;
    }
  }
  const { createMockFaq } = await import("./mockStore");
  return createMockFaq(data);
}

export async function updateFaq(
  id: number,
  data: {
    category?: string;
    question?: string;
    answer?: string;
    sortOrder?: number;
  }
) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.faq.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.error("[updateFaq] DB Error:", err);
      throw err;
    }
  }
  const { updateMockFaq } = await import("./mockStore");
  return updateMockFaq(id, data);
}

export async function deleteFaq(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      await prisma.faq.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error("[deleteFaq] DB Error:", err);
      throw err;
    }
  }
  const { deleteMockFaq } = await import("./mockStore");
  return deleteMockFaq(id);
}

/**
 * ==============================================================================
 * [5. 긴급 팝업 및 상단 띠 배너(Announcement) DB 조회 및 관리 CRUD]
 * ==============================================================================
 */
export async function getAnnouncements(type?: "POPUP" | "BANNER", onlyActive: boolean = false) {
  if (isVercelPostgresConfigured()) {
    try {
      const where: any = {};
      if (type) where.type = type;
      if (onlyActive) where.isActive = true;

      return await prisma.announcement.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
      });
    } catch (err) {
      console.warn("[getAnnouncements] Fallback to mock store:", err);
    }
  }
  const { getMockAnnouncements } = await import("./mockStore");
  return getMockAnnouncements(type, onlyActive);
}

export async function getAnnouncementById(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.announcement.findUnique({ where: { id } });
    } catch (err) {
      console.warn("[getAnnouncementById] Fallback to mock store:", err);
    }
  }
  const { getMockAnnouncementById } = await import("./mockStore");
  return getMockAnnouncementById(id);
}

export async function createAnnouncement(data: {
  type: "POPUP" | "BANNER";
  content: string;
  linkUrl?: string | null;
  isActive?: boolean;
}) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.announcement.create({
        data: {
          type: data.type,
          content: data.content,
          linkUrl: data.linkUrl || null,
          isActive: data.isActive ?? true,
        },
      });
    } catch (err) {
      console.error("[createAnnouncement] DB Error:", err);
      throw err;
    }
  }
  const { createMockAnnouncement } = await import("./mockStore");
  return createMockAnnouncement(data);
}

export async function updateAnnouncement(
  id: number,
  data: {
    type?: "POPUP" | "BANNER";
    content?: string;
    linkUrl?: string | null;
    isActive?: boolean;
  }
) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.announcement.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.error("[updateAnnouncement] DB Error:", err);
      throw err;
    }
  }
  const { updateMockAnnouncement } = await import("./mockStore");
  return updateMockAnnouncement(id, data);
}

export async function deleteAnnouncement(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      await prisma.announcement.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error("[deleteAnnouncement] DB Error:", err);
      throw err;
    }
  }
  const { deleteMockAnnouncement } = await import("./mockStore");
  return deleteMockAnnouncement(id);
}

/**
 * ==============================================================================
 * [6. 후원사(Sponsor) DB 조회 및 관리 CRUD]
 * ==============================================================================
 */
export async function getSponsors(tier?: string) {
  if (isVercelPostgresConfigured()) {
    try {
      const where = tier && tier !== "all" ? { tier } : {};
      const sponsors = await prisma.sponsor.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      });
      if (sponsors.length > 0) return sponsors;
    } catch (err) {
      console.warn("[getSponsors] Fallback to mock store:", err);
    }
  }
  const { getMockSponsors } = await import("./mockStore");
  return getMockSponsors(tier);
}

export async function getSponsorById(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.sponsor.findUnique({ where: { id } });
    } catch (err) {
      console.warn("[getSponsorById] Fallback to mock store:", err);
    }
  }
  const { getMockSponsorById } = await import("./mockStore");
  return getMockSponsorById(id);
}

export async function createSponsor(data: {
  sponsorName: string;
  tier: "메인" | "골드" | "실버" | "브론즈" | "현물";
  logoImageUrl: string;
  websiteUrl?: string | null;
  sortOrder?: number;
}) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.sponsor.create({
        data: {
          sponsorName: data.sponsorName,
          tier: data.tier,
          logoImageUrl: data.logoImageUrl,
          websiteUrl: data.websiteUrl || null,
          sortOrder: data.sortOrder ?? 0,
        },
      });
    } catch (err) {
      console.error("[createSponsor] DB Error:", err);
      throw err;
    }
  }
  const { createMockSponsor } = await import("./mockStore");
  return createMockSponsor(data);
}

export async function updateSponsor(
  id: number,
  data: {
    sponsorName?: string;
    tier?: "메인" | "골드" | "실버" | "브론즈" | "현물";
    logoImageUrl?: string;
    websiteUrl?: string | null;
    sortOrder?: number;
  }
) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.sponsor.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.error("[updateSponsor] DB Error:", err);
      throw err;
    }
  }
  const { updateMockSponsor } = await import("./mockStore");
  return updateMockSponsor(id, data);
}

export async function deleteSponsor(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      await prisma.sponsor.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error("[deleteSponsor] DB Error:", err);
      throw err;
    }
  }
  const { deleteMockSponsor } = await import("./mockStore");
  return deleteMockSponsor(id);
}

/**
 * ==============================================================================
 * [7. 미디어(YouTube 영상) DB 조회 및 관리 CRUD]
 * ==============================================================================
 */
export async function getMediaVideos(type?: string) {
  if (isVercelPostgresConfigured()) {
    try {
      const where = type && type !== "all" ? { type } : {};
      const list = await prisma.mediaVideo.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("[getMediaVideos] Fallback to mock store:", err);
    }
  }
  const { getMockMediaVideos } = await import("./mockStore");
  return getMockMediaVideos(type);
}

export async function getMainMediaVideo() {
  if (isVercelPostgresConfigured()) {
    try {
      const video = await prisma.mediaVideo.findFirst({
        where: { isMainExposure: true },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });
      if (video) return video;
    } catch (err) {
      console.warn("[getMainMediaVideo] Fallback to mock store:", err);
    }
  }
  const { getMockMediaVideos } = await import("./mockStore");
  const list = getMockMediaVideos();
  return list.find((v) => v.isMainExposure) || list[0] || null;
}

export async function getMediaVideoById(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      return await prisma.mediaVideo.findUnique({ where: { id } });
    } catch (err) {
      console.warn("[getMediaVideoById] Fallback to mock store:", err);
    }
  }
  const { getMockMediaVideoById } = await import("./mockStore");
  return getMockMediaVideoById(id);
}

export async function createMediaVideo(data: {
  youtubeId: string;
  title: string;
  type: string;
  isMainExposure?: boolean;
}) {
  if (isVercelPostgresConfigured()) {
    try {
      if (data.isMainExposure) {
        // 기존의 메인 노출 영상 해제
        await prisma.mediaVideo.updateMany({
          where: { isMainExposure: true },
          data: { isMainExposure: false },
        });
      }
      return await prisma.mediaVideo.create({
        data: {
          youtubeId: data.youtubeId,
          title: data.title,
          type: data.type,
          isMainExposure: Boolean(data.isMainExposure),
        },
      });
    } catch (err) {
      console.error("[createMediaVideo] DB Error:", err);
      throw err;
    }
  }
  const { createMockMediaVideo } = await import("./mockStore");
  return createMockMediaVideo(data);
}

export async function updateMediaVideo(
  id: number,
  data: {
    youtubeId?: string;
    title?: string;
    type?: string;
    isMainExposure?: boolean;
  }
) {
  if (isVercelPostgresConfigured()) {
    try {
      if (data.isMainExposure) {
        await prisma.mediaVideo.updateMany({
          where: { isMainExposure: true, id: { not: id } },
          data: { isMainExposure: false },
        });
      }
      return await prisma.mediaVideo.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.error("[updateMediaVideo] DB Error:", err);
      throw err;
    }
  }
  const { updateMockMediaVideo } = await import("./mockStore");
  return updateMockMediaVideo(id, data);
}

export async function deleteMediaVideo(id: number) {
  if (isVercelPostgresConfigured()) {
    try {
      await prisma.mediaVideo.delete({ where: { id } });
      return true;
    } catch (err) {
      console.error("[deleteMediaVideo] DB Error:", err);
      throw err;
    }
  }
  const { deleteMockMediaVideo } = await import("./mockStore");
  return deleteMockMediaVideo(id);
}


