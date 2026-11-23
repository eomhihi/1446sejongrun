/**
 * [로컬 개발 및 데모용 안전한 인메모리 참가자 저장소]
 * Supabase 자격증명이 .env.local에 설정되지 않은 환경에서도
 * 등록 -> 고유 접수번호 발급(Alphanumeric 6자리) -> 비회원 조회 및 접수번호 찾기가 온전하게 동작하도록 지원합니다.
 */

export interface MockParticipantRecord {
  id: string;
  bibNumber: string;
  receiptNumber: string; // 6자리 고유 접수번호 (예: A7X9Q2)
  name: string;
  phone: string; // 원문 (SMS 발송용)
  phoneHash: string; // 블라인드 인덱스
  course: string;
  shirtSize: string;
  createdAt: string;
}

const mockParticipantsMap = new Map<string, MockParticipantRecord>();
let mockBibCounter = 1001;

export function saveMockParticipant(record: Omit<MockParticipantRecord, "id" | "bibNumber" | "createdAt">): {
  id: string;
  bibNumber: string;
  receiptNumber: string;
  name: string;
  course: string;
  shirtSize: string;
} {
  const id = "reg_" + Math.random().toString(36).substring(2, 11);
  const bibNumber = `1446-${mockBibCounter++}`;
  const fullRecord: MockParticipantRecord = {
    ...record,
    id,
    bibNumber,
    createdAt: new Date().toISOString(),
  };

  mockParticipantsMap.set(record.phoneHash, fullRecord);

  return {
    id,
    bibNumber,
    receiptNumber: record.receiptNumber,
    name: record.name,
    course: record.course,
    shirtSize: record.shirtSize,
  };
}

export function findMockParticipantByPhoneHashAndReceiptNumber(
  phoneHash: string,
  receiptNumber: string
): MockParticipantRecord | undefined {
  const record = mockParticipantsMap.get(phoneHash);
  if (!record) return undefined;
  if (record.receiptNumber.toUpperCase() !== receiptNumber.toUpperCase()) return undefined;
  return record;
}

export function findMockParticipantByPhoneHashAndName(
  phoneHash: string,
  name: string
): MockParticipantRecord | undefined {
  const record = mockParticipantsMap.get(phoneHash);
  if (!record) return undefined;
  if (record.name.trim() !== name.trim()) return undefined;
  return record;
}

export function hasMockParticipantPhoneHash(phoneHash: string): boolean {
  return mockParticipantsMap.has(phoneHash);
}

// ==============================================================================
// [2. 참여 상점(PartnerShop) 인메모리 저장소 - 엑셀(CSV) 덮어쓰기 지원]
// ==============================================================================

export interface MockPartnerShop {
  id: number;
  shopName: string;
  category: string;
  address: string;
  discountInfo: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

// 기본 샘플 데이터 (초기 로딩용)
let mockShops: MockPartnerShop[] = [
  {
    id: 1,
    shopName: "세종 훈민 제빵소",
    category: "카페",
    address: "세종시 나성로 96 어반아트리움 P2 1층",
    discountInfo: "배번호 제시 시 한글 단팥빵 1개 무료 + 전 음료 20% 할인 (14,460원 러너 세트 판매)",
    capacity: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    shopName: "이응다리 로스터리",
    category: "카페",
    address: "세종시 호려울로 19 금강시티빌딩 2층",
    discountInfo: "완주 메달 인증 시 상징 훈민 블렌드 콜드브루 1잔 증정 (14,460원 러너 세트 판매)",
    capacity: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    shopName: "도담 세종 숯불갈비",
    category: "식당",
    address: "세종시 보듬9로 11 도담프라자 1층",
    discountInfo: "마라톤 참가자 테이블당 한우 육회 1접시 서비스 + 10% 할인 (14,460원 영양 솥밥 세트)",
    capacity: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    shopName: "조치원 전통 파닭 본가",
    category: "식당",
    address: "세종시 조치원읍 장터길 24 전통시장 내",
    discountInfo: "완주 메달 제시 시 파닭 3,000원 즉시 할인 + 탄산음료 1캔 무료",
    capacity: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    shopName: "어진동 한글 도자기 공방",
    category: "기타",
    address: "세종시 가름로 143 세종엠코타운 상가 2층",
    discountInfo: "훈민정음 자모 각인 도자기 컵 일일 강좌 30% 할인",
    capacity: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getMockShops(): MockPartnerShop[] {
  return [...mockShops];
}

export function replaceMockShops(newShops: MockPartnerShop[]): void {
  mockShops = [...newShops];
}

// ==============================================================================
// [3. 공지사항(Notice) 인메모리 저장소 - CRUD 지원]
// ==============================================================================

export interface MockNotice {
  id: number;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
}

let mockNotices: MockNotice[] = [
  {
    id: 1,
    title: "[중요] 제1회 1446 세종 골목 상생 마라톤 공식 일정 및 참가자 유의사항",
    content: "2027년 4월 3일(토) 14:00~21:00 세종시청 앞 광장에서 개최되는 1446 세종런 마라톤의 공식 안내입니다.\n\n1. 참가자 등록 및 물품 수령은 당일 12:30부터 진행됩니다.\n2. 전 코스 완주자에게는 훈민정음 28자 한정판 조립식 결합 메달과 1인당 10,000원 골목 상생 바우처가 지급됩니다.\n3. 안전한 야간 러닝을 위해 금강 수변길 야간 조명 및 비상 응급 부스가 3km 간격으로 배치됩니다.",
    isImportant: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    title: "[안내] 1446 애프터런 골목 상생 바우처 10,000원권 사용 가이드",
    content: "완주 직후 세종시 전역 300여 지정 함께하는 상점에서 현금처럼 즉시 차감 결제 가능한 10,000원 상생 바우처가 모바일 및 지류로 제공됩니다.\n\n- 사용 기간: 대회 당일 및 주말 포함 7일간\n- 전용 혜택: 14,460원 러너 세트 주문 시 4,460원만 추가 결제하시면 든든한 에너지 보충 식사가 가능합니다.",
    isImportant: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 3,
    title: "[공지] 단체 크루 사전 접수 및 수용 인원 안내",
    content: "러닝 크루 및 기업 단체 참가 신청 시 참여 상점의 수용 인원(capacity)에 맞추어 애프터런 단체 좌석 사전 배정이 지원됩니다.",
    isImportant: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let nextNoticeId = 4;

export function getMockNotices(): MockNotice[] {
  return [...mockNotices].sort((a, b) => {
    if (a.isImportant !== b.isImportant) {
      return a.isImportant ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getMockNoticeById(id: number): MockNotice | undefined {
  return mockNotices.find((n) => n.id === id);
}

export function createMockNotice(data: { title: string; content: string; isImportant: boolean }): MockNotice {
  const notice: MockNotice = {
    id: nextNoticeId++,
    title: data.title,
    content: data.content,
    isImportant: Boolean(data.isImportant),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockNotices.unshift(notice);
  return notice;
}

export function updateMockNotice(
  id: number,
  data: { title?: string; content?: string; isImportant?: boolean }
): MockNotice | null {
  const index = mockNotices.findIndex((n) => n.id === id);
  if (index === -1) return null;
  mockNotices[index] = {
    ...mockNotices[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return mockNotices[index];
}

export function deleteMockNotice(id: number): boolean {
  const initialLength = mockNotices.length;
  mockNotices = mockNotices.filter((n) => n.id !== id);
  return mockNotices.length < initialLength;
}

// ==============================================================================
// [4. FAQ (자주 묻는 질문) 인메모리 저장소]
// ==============================================================================

export interface MockFaq {
  id: number;
  category: string; // 접수 / 코스 / 결제 / 기타 등
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

let mockFaqs: MockFaq[] = [
  {
    id: 1,
    category: "접수",
    question: "참가자 기념품 및 수령 방법은 어떻게 되나요?",
    answer: "기념품(배번호, 기록 측정용 칩 등)은 참가 신청 시 입력하신 주소지로 대회 전 택배 발송됩니다.",
    sortOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 2,
    category: "기타",
    question: "참가자 보험 가입 및 보상 범위는 어떻게 되나요?",
    answer: "주최 측은 부상, 사고 등을 대비하여 참가자를 위해 주최자 배상책임보험에 가입합니다. 단, 행사 중 발생한 사고에 대해 보험 한도 내에서 보상하며, 주최 측의 고의나 과실이 아닌 참가자의 부주의로 인한 사고는 응급조치 외의 책임을 지지 않습니다.",
    sortOrder: 2,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 3,
    category: "코스",
    question: "우천 시 행사를 진행하나요?",
    answer: "우천 시에도 대회는 정상적으로 진행됩니다. 쌀쌀한 날씨에 대비해 개인용 우비를 준비해 주시기 바랍니다. (단, 태풍이나 폭우 등 천재지변 발생 시 행사가 중지될 수 있으며, 이 경우 참가비는 환불되지 않습니다.)",
    sortOrder: 3,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 4,
    category: "접수",
    question: "임의 참가/변동 및 대리 참가자에 대한 처리는 어떻게 되나요?",
    answer: "양도 및 대리 참가, 타인 명의 신청은 엄격히 금지되며 적발 시 신청이 취소됩니다. 참가 규정 불이행으로 발생하는 피해에 대해서는 책임지지 않습니다.",
    sortOrder: 4,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 5,
    category: "접수",
    question: "참가 신청 확인 및 수정은 어떻게 하나요?",
    answer: "[참가신청/확인] - [참가 확인 및 수정] 메뉴에서 휴대폰 번호와 고유 접수번호(6자리)를 입력하여 확인할 수 있습니다. 정보 수정이 필요한 경우 1446 세종런 운영사무국(044-866-1448 / khj@sjr.co.kr)으로 문의 바랍니다. (단, 2027년 3월 22일 17시까지만 수정 가능합니다.)",
    sortOrder: 5,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 6,
    category: "결제",
    question: "대회 참가 취소 및 환불은 어떻게 하나요?",
    answer: "참가 취소 및 환불은 접수 마감일인 2027년 3월 22일(월) 17시까지만 가능하며, 이후로는 일절 불가합니다. 환불 처리는 운영사무국(044-866-1448 / khj@sjr.co.kr)으로 문의 바랍니다.",
    sortOrder: 6,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 7,
    category: "코스",
    question: "씽씽카, 유아차(유모차), 웨건, 자전거 이용이 가능한가요?",
    answer: "참가자 안전 확보를 위해 바퀴가 달린 이동 수단은 이용이 절대 불가합니다. 특히 이응다리 등 혼잡 구간에서의 안전사고를 예방하기 위함이니 양해 부탁드립니다.",
    sortOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextFaqId = 8;

export function getMockFaqs(category?: string): MockFaq[] {
  let list = [...mockFaqs];
  if (category && category !== "all") {
    list = list.filter((f) => f.category === category);
  }
  return list.sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id);
}

export function getMockFaqById(id: number): MockFaq | undefined {
  return mockFaqs.find((f) => f.id === id);
}

export function createMockFaq(data: {
  category: string;
  question: string;
  answer: string;
  sortOrder?: number;
}): MockFaq {
  const faq: MockFaq = {
    id: nextFaqId++,
    category: data.category,
    question: data.question,
    answer: data.answer,
    sortOrder: data.sortOrder ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockFaqs.push(faq);
  return faq;
}

export function updateMockFaq(
  id: number,
  data: Partial<Omit<MockFaq, "id" | "createdAt" | "updatedAt">>
): MockFaq | null {
  const index = mockFaqs.findIndex((f) => f.id === id);
  if (index === -1) return null;
  mockFaqs[index] = {
    ...mockFaqs[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return mockFaqs[index];
}

export function deleteMockFaq(id: number): boolean {
  const initialLen = mockFaqs.length;
  mockFaqs = mockFaqs.filter((f) => f.id !== id);
  return mockFaqs.length < initialLen;
}

// ==============================================================================
// [5. 긴급 팝업 및 상단 띠 배너(Announcement) 인메모리 저장소]
// ==============================================================================

export interface MockAnnouncement {
  id: number;
  type: "POPUP" | "BANNER";
  content: string;
  linkUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

let mockAnnouncements: MockAnnouncement[] = [
  {
    id: 1,
    type: "BANNER",
    content: "🚨 2027 1446 세종런 선착순 5,000명 조기 마감 임박! 지금 신청하고 훈민정음 한정판 메달과 골목 상생 바우처 10,000원권을 확보하세요.",
    linkUrl: "#register",
    isActive: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    type: "POPUP",
    content: "📢 1446 세종런 사전 접수 오픈 안내\n\n국가균형성장의 중심 행정수도 세종에서 펼쳐지는 제1회 1446 세종런 골목 상생 마라톤에 참여해 보세요!\n\n- 일시: 2027. 04. 03. (토) 14:00 ~ 21:00\n- 장소: 세종시청 앞 광장\n- 참가 혜택: 훈민정음 28자 한정판 메달, 골목 상생 바우처 10,000원, 리커버리 키트 증정",
    linkUrl: "#register",
    isActive: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let nextAnnouncementId = 3;

export function getMockAnnouncements(type?: "POPUP" | "BANNER", onlyActive: boolean = false): MockAnnouncement[] {
  let list = [...mockAnnouncements];
  if (type) {
    list = list.filter((a) => a.type === type);
  }
  if (onlyActive) {
    list = list.filter((a) => a.isActive);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMockAnnouncementById(id: number): MockAnnouncement | undefined {
  return mockAnnouncements.find((a) => a.id === id);
}

export function createMockAnnouncement(data: {
  type: "POPUP" | "BANNER";
  content: string;
  linkUrl?: string | null;
  isActive?: boolean;
}): MockAnnouncement {
  const announcement: MockAnnouncement = {
    id: nextAnnouncementId++,
    type: data.type,
    content: data.content,
    linkUrl: data.linkUrl || null,
    isActive: data.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAnnouncements.unshift(announcement);
  return announcement;
}

export function updateMockAnnouncement(
  id: number,
  data: Partial<Omit<MockAnnouncement, "id" | "createdAt" | "updatedAt">>
): MockAnnouncement | null {
  const index = mockAnnouncements.findIndex((a) => a.id === id);
  if (index === -1) return null;
  mockAnnouncements[index] = {
    ...mockAnnouncements[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return mockAnnouncements[index];
}

export function deleteMockAnnouncement(id: number): boolean {
  const initialLen = mockAnnouncements.length;
  mockAnnouncements = mockAnnouncements.filter((a) => a.id !== id);
  return mockAnnouncements.length < initialLen;
}

// ==============================================================================
// [6. 후원사(Sponsor) 인메모리 저장소]
// ==============================================================================

export interface MockSponsor {
  id: number;
  sponsorName: string;
  tier: "메인" | "골드" | "실버" | "브론즈" | "현물";
  logoImageUrl: string;
  websiteUrl?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

let mockSponsors: MockSponsor[] = [
  {
    id: 1,
    sponsorName: "세종특별자치시 소상공인연합회",
    tier: "메인",
    logoImageUrl: "/images/sponsors/sponsor-main-1.svg",
    websiteUrl: "https://www.sejong.go.kr",
    sortOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 2,
    sponsorName: "세종시 육상연맹",
    tier: "메인",
    logoImageUrl: "/images/sponsors/sponsor-main-2.svg",
    websiteUrl: "https://www.sejong.go.kr",
    sortOrder: 2,
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 3,
    sponsorName: "NH농협은행 세종영업본부",
    tier: "골드",
    logoImageUrl: "/images/sponsors/sponsor-gold-1.svg",
    websiteUrl: "https://banking.nonghyup.com",
    sortOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 4,
    sponsorName: "세종상공회의소",
    tier: "골드",
    logoImageUrl: "/images/sponsors/sponsor-gold-2.svg",
    websiteUrl: "http://sejongcci.korcham.net",
    sortOrder: 2,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 5,
    sponsorName: "세종도시교통공사",
    tier: "실버",
    logoImageUrl: "/images/sponsors/sponsor-silver-1.svg",
    websiteUrl: "https://www.sctc.kr",
    sortOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 6,
    sponsorName: "고려대학교 세종캠퍼스",
    tier: "실버",
    logoImageUrl: "/images/sponsors/sponsor-silver-2.svg",
    websiteUrl: "https://sejong.korea.ac.kr",
    sortOrder: 2,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 7,
    sponsorName: "홍익대학교 세종캠퍼스",
    tier: "브론즈",
    logoImageUrl: "/images/sponsors/sponsor-bronze-1.svg",
    websiteUrl: "https://sejong.hongik.ac.kr",
    sortOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 8,
    sponsorName: "동아오츠카 포카리스웨트",
    tier: "현물",
    logoImageUrl: "/images/sponsors/sponsor-supply-1.svg",
    websiteUrl: "https://www.donga-otsuka.co.kr",
    sortOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

let nextSponsorId = 9;

export function getMockSponsors(tier?: string): MockSponsor[] {
  let list = [...mockSponsors];
  if (tier && tier !== "all") {
    list = list.filter((s) => s.tier === tier);
  }
  const tierWeight: Record<string, number> = {
    메인: 1,
    골드: 2,
    실버: 3,
    브론즈: 4,
    현물: 5,
  };
  return list.sort((a, b) => {
    const wA = tierWeight[a.tier] || 99;
    const wB = tierWeight[b.tier] || 99;
    if (wA !== wB) return wA - wB;
    return a.sortOrder - b.sortOrder || a.id - b.id;
  });
}

export function getMockSponsorById(id: number): MockSponsor | undefined {
  return mockSponsors.find((s) => s.id === id);
}

export function createMockSponsor(data: {
  sponsorName: string;
  tier: "메인" | "골드" | "실버" | "브론즈" | "현물";
  logoImageUrl: string;
  websiteUrl?: string | null;
  sortOrder?: number;
}): MockSponsor {
  const sponsor: MockSponsor = {
    id: nextSponsorId++,
    sponsorName: data.sponsorName,
    tier: data.tier,
    logoImageUrl: data.logoImageUrl,
    websiteUrl: data.websiteUrl || null,
    sortOrder: data.sortOrder ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockSponsors.push(sponsor);
  return sponsor;
}

export function updateMockSponsor(
  id: number,
  data: Partial<Omit<MockSponsor, "id" | "createdAt" | "updatedAt">>
): MockSponsor | null {
  const index = mockSponsors.findIndex((s) => s.id === id);
  if (index === -1) return null;
  mockSponsors[index] = {
    ...mockSponsors[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return mockSponsors[index];
}

export function deleteMockSponsor(id: number): boolean {
  const initialLen = mockSponsors.length;
  mockSponsors = mockSponsors.filter((s) => s.id !== id);
  return mockSponsors.length < initialLen;
}

// ==============================================================================
// [7. 미디어(YouTube 영상) 인메모리 저장소]
// ==============================================================================

export interface MockMediaVideo {
  id: number;
  youtubeId: string;
  title: string;
  type: string; // 홍보영상 / 경기영상 / 코스 프리뷰 / 현장 스케치
  isMainExposure: boolean;
  createdAt: string;
  updatedAt: string;
}

let mockMediaVideos: MockMediaVideo[] = [
  {
    id: 1,
    youtubeId: "o5P6K_26VfM", // 세종시 및 마라톤 공식 브랜드 필름 샘플 영상
    title: "2027 1446 세종런 공식 브랜드 필름 : 달린 만큼 골목이 켜집니다",
    type: "홍보영상",
    isMainExposure: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextMediaVideoId = 2;

export function getMockMediaVideos(type?: string): MockMediaVideo[] {
  let list = [...mockMediaVideos];
  if (type && type !== "all") {
    list = list.filter((v) => v.type === type);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMockMediaVideoById(id: number): MockMediaVideo | undefined {
  return mockMediaVideos.find((v) => v.id === id);
}

export function createMockMediaVideo(data: {
  youtubeId: string;
  title: string;
  type: string;
  isMainExposure?: boolean;
}): MockMediaVideo {
  const video: MockMediaVideo = {
    id: nextMediaVideoId++,
    youtubeId: data.youtubeId,
    title: data.title,
    type: data.type,
    isMainExposure: data.isMainExposure ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 만약 새로 등록하는 영상이 isMainExposure true라면, 기존 영상들의 mainExposure를 false로 처리
  if (video.isMainExposure) {
    mockMediaVideos.forEach((v) => {
      v.isMainExposure = false;
    });
  }

  mockMediaVideos.unshift(video);
  return video;
}

export function updateMockMediaVideo(
  id: number,
  data: Partial<Omit<MockMediaVideo, "id" | "createdAt" | "updatedAt">>
): MockMediaVideo | null {
  const index = mockMediaVideos.findIndex((v) => v.id === id);
  if (index === -1) return null;

  if (data.isMainExposure) {
    mockMediaVideos.forEach((v) => {
      v.isMainExposure = false;
    });
  }

  mockMediaVideos[index] = {
    ...mockMediaVideos[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return mockMediaVideos[index];
}

export function deleteMockMediaVideo(id: number): boolean {
  const initialLen = mockMediaVideos.length;
  mockMediaVideos = mockMediaVideos.filter((v) => v.id !== id);
  return mockMediaVideos.length < initialLen;
}


