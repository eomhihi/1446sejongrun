"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Bell,
  Store,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Search,
  ExternalLink,
  ShieldCheck,
  Users,
  Check,
  X,
  Pin,
  HelpCircle,
  Megaphone,
  Award,
  ToggleLeft,
  ToggleRight,
  ImageIcon,
  Link2,
  Eye,
  EyeOff,
  Building2,
  ChevronDown,
  Film,
  Play,
  Youtube,
} from "lucide-react";

interface PartnerShopItem {
  id: number;
  shopName: string;
  category: string;
  address: string;
  discountInfo: string;
  capacity: number;
}

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementItem {
  id: number;
  type: "POPUP" | "BANNER";
  content: string;
  linkUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SponsorItem {
  id: number;
  sponsorName: string;
  tier: "메인" | "골드" | "실버" | "브론즈" | "현물";
  logoImageUrl: string;
  websiteUrl?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface MediaVideoItem {
  id: number;
  youtubeId: string;
  title: string;
  type: string;
  isMainExposure: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 탭 상태: "shops" | "notices" | "faqs" | "announcements" | "sponsors" | "media"
  const [activeTab, setActiveTab] = useState<
    "shops" | "notices" | "faqs" | "announcements" | "sponsors" | "media"
  >("shops");

  // 1. 상점 CSV 업로드 상태
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [shopsList, setShopsList] = useState<PartnerShopItem[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [shopSearchTerm, setShopSearchTerm] = useState("");
  const [shopCategoryFilter, setShopCategoryFilter] = useState("all");

  // 2. 공지사항 관리 상태
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [isLoadingNotices, setIsLoadingNotices] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeIsImportant, setNoticeIsImportant] = useState(false);
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);
  const [noticeError, setNoticeError] = useState("");
  const [noticeSuccess, setNoticeSuccess] = useState("");

  // 공지사항 수정 모달 상태
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editIsImportant, setEditIsImportant] = useState(false);
  const [isUpdatingNotice, setIsUpdatingNotice] = useState(false);

  // 3. FAQ 관리 상태
  const [faqsList, setFaqsList] = useState<FaqItem[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const [faqCategory, setFaqCategory] = useState("접수");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqSortOrder, setFaqSortOrder] = useState(0);
  const [isSubmittingFaq, setIsSubmittingFaq] = useState(false);
  const [faqError, setFaqError] = useState("");
  const [faqSuccess, setFaqSuccess] = useState("");

  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [editFaqCategory, setEditFaqCategory] = useState("");
  const [editFaqQuestion, setEditFaqQuestion] = useState("");
  const [editFaqAnswer, setEditFaqAnswer] = useState("");
  const [editFaqSortOrder, setEditFaqSortOrder] = useState(0);
  const [isUpdatingFaq, setIsUpdatingFaq] = useState(false);

  // 4. 긴급 공지(배너/팝업) 관리 상태
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [announcementType, setAnnouncementType] = useState<"BANNER" | "POPUP">("BANNER");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementLinkUrl, setAnnouncementLinkUrl] = useState("");
  const [announcementIsActive, setAnnouncementIsActive] = useState(true);
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState("");

  // 5. 후원사 관리 상태
  const [sponsorsList, setSponsorsList] = useState<SponsorItem[]>([]);
  const [isLoadingSponsors, setIsLoadingSponsors] = useState(false);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorTier, setSponsorTier] = useState<"메인" | "골드" | "실버" | "브론즈" | "현물">("골드");
  const [sponsorLogoUrl, setSponsorLogoUrl] = useState("");
  const [sponsorWebsiteUrl, setSponsorWebsiteUrl] = useState("");
  const [sponsorSortOrder, setSponsorSortOrder] = useState(0);
  const [isSubmittingSponsor, setIsSubmittingSponsor] = useState(false);
  const [sponsorError, setSponsorError] = useState("");
  const [sponsorSuccess, setSponsorSuccess] = useState("");

  const sponsorFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // 6. 미디어(YouTube 영상) 관리 상태
  const [mediaList, setMediaList] = useState<MediaVideoItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaUrlOrId, setMediaUrlOrId] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaType, setMediaType] = useState("홍보영상");
  const [mediaIsMainExposure, setMediaIsMainExposure] = useState(false);
  const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [mediaSuccess, setMediaSuccess] = useState("");

  // 인증 검증 및 리다이렉트
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // 데이터 로딩
  const loadShops = async () => {
    setIsLoadingShops(true);
    try {
      const res = await fetch("/api/shops");
      const data = await res.json();
      if (data.success && Array.isArray(data.shops)) {
        setShopsList(data.shops);
      }
    } catch (err) {
      console.error("상점 목록 로딩 실패:", err);
    } finally {
      setIsLoadingShops(false);
    }
  };

  const loadNotices = async () => {
    setIsLoadingNotices(true);
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      if (data.success && Array.isArray(data.notices)) {
        setNoticesList(data.notices);
      }
    } catch (err) {
      console.error("공지사항 목록 로딩 실패:", err);
    } finally {
      setIsLoadingNotices(false);
    }
  };

  const loadFaqs = async () => {
    setIsLoadingFaqs(true);
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (data.success && Array.isArray(data.faqs)) {
        setFaqsList(data.faqs);
      }
    } catch (err) {
      console.error("FAQ 목록 로딩 실패:", err);
    } finally {
      setIsLoadingFaqs(false);
    }
  };

  const loadAnnouncements = async () => {
    setIsLoadingAnnouncements(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.success && Array.isArray(data.announcements)) {
        setAnnouncementsList(data.announcements);
      }
    } catch (err) {
      console.error("공지/배너 목록 로딩 실패:", err);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const loadSponsors = async () => {
    setIsLoadingSponsors(true);
    try {
      const res = await fetch("/api/admin/sponsors");
      const data = await res.json();
      if (data.success && Array.isArray(data.sponsors)) {
        setSponsorsList(data.sponsors);
      }
    } catch (err) {
      console.error("후원사 목록 로딩 실패:", err);
    } finally {
      setIsLoadingSponsors(false);
    }
  };

  const loadMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setMediaList(data.videos);
      }
    } catch (err) {
      console.error("미디어 영상 목록 로딩 실패:", err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadShops();
      loadNotices();
      loadFaqs();
      loadAnnouncements();
      loadSponsors();
      loadMedia();
    }
  }, [status]);

  // CSV 양식 다운로드 함수
  const handleDownloadTemplate = () => {
    const csvContent =
      "id,shop_name,category,address,discount_info,capacity\n" +
      "1,세종 훈민 제빵소,카페,세종시 나성로 96 어반아트리움 P2 1층,배번호 제시 시 한글 단팥빵 1개 무료 + 전 음료 20% 할인 (14460원 러너 세트 판매),35\n" +
      "2,이응다리 로스터리,카페,세종시 호려울로 19 금강시티빌딩 2층,완주 메달 인증 시 상징 훈민 블렌드 콜드브루 1잔 증정 (14460원 러너 세트 판매),45\n" +
      "3,도담 세종 숯불갈비,식당,세종시 보듬9로 11 도담프라자 1층,마라톤 참가자 테이블당 한우 육회 1접시 서비스 + 10% 할인,80\n" +
      "4,조치원 전통 파닭 본가,식당,세종시 조치원읍 장터길 24 전통시장 내,완주 메달 제시 시 파닭 3000원 즉시 할인 + 음료 1캔 무료,50\n" +
      "5,어진동 한글 도자기 공방,기타,세종시 가름로 143 세종엠코타운 상가 2층,훈민정음 자모 각인 도자기 컵 일일 강좌 30% 할인,20\n";

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "1446sejongrun_partner_shops_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV 업로드 함수
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("업로드할 CSV 파일을 먼저 선택해 주세요.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/shops/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "CSV 업로드 처리 중 오류가 발생했습니다.");
      }

      setUploadSuccess(`성공적으로 갱신되었습니다! (총 ${data.count}개 상점 반영 완료)`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadShops();
    } catch (err: any) {
      setUploadError(err.message || "업로드 실패: 네트워크 또는 파일 형식 오류");
    } finally {
      setIsUploading(false);
    }
  };

  // 공지사항 등록
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim()) {
      setNoticeError("공지사항 제목을 입력해 주세요.");
      return;
    }
    if (!noticeContent.trim()) {
      setNoticeError("공지사항 본문 내용을 입력해 주세요.");
      return;
    }

    setIsSubmittingNotice(true);
    setNoticeError("");
    setNoticeSuccess("");

    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle.trim(),
          content: noticeContent.trim(),
          isImportant: noticeIsImportant,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "공지사항 등록 실패");
      }

      setNoticeSuccess("공지사항이 성공적으로 등록되었습니다.");
      setNoticeTitle("");
      setNoticeContent("");
      setNoticeIsImportant(false);
      await loadNotices();
    } catch (err: any) {
      setNoticeError(err.message);
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  // 공지사항 삭제
  const handleDeleteNotice = async (id: number, title: string) => {
    if (!confirm(`'${title}' 공지사항을 정말 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제 실패");
      await loadNotices();
    } catch (err: any) {
      alert(`공지사항 삭제 오류: ${err.message}`);
    }
  };

  // 공지사항 수정 저장
  const handleSaveEditNotice = async () => {
    if (!editingNotice) return;
    if (!editTitle.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }
    setIsUpdatingNotice(true);
    try {
      const res = await fetch(`/api/admin/notices/${editingNotice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          isImportant: editIsImportant,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "수정 실패");
      setEditingNotice(null);
      await loadNotices();
    } catch (err: any) {
      alert(`공지사항 수정 오류: ${err.message}`);
    } finally {
      setIsUpdatingNotice(false);
    }
  };

  // ----------------------------------------------------------------------------
  // [3. FAQ 핸들러]
  // ----------------------------------------------------------------------------
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim()) {
      setFaqError("질문 내용을 입력해 주세요.");
      return;
    }
    if (!faqAnswer.trim()) {
      setFaqError("답변 내용을 입력해 주세요.");
      return;
    }

    setIsSubmittingFaq(true);
    setFaqError("");
    setFaqSuccess("");

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: faqCategory,
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          sortOrder: Number(faqSortOrder) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "FAQ 등록 실패");

      setFaqSuccess("새 FAQ가 성공적으로 등록되었습니다.");
      setFaqQuestion("");
      setFaqAnswer("");
      setFaqSortOrder(0);
      await loadFaqs();
    } catch (err: any) {
      setFaqError(err.message);
    } finally {
      setIsSubmittingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm(`이 FAQ 항목을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제 실패");
      await loadFaqs();
    } catch (err: any) {
      alert(`FAQ 삭제 오류: ${err.message}`);
    }
  };

  const handleSaveEditFaq = async () => {
    if (!editingFaq) return;
    setIsUpdatingFaq(true);
    try {
      const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: editFaqCategory,
          question: editFaqQuestion.trim(),
          answer: editFaqAnswer.trim(),
          sortOrder: Number(editFaqSortOrder) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "수정 실패");
      setEditingFaq(null);
      await loadFaqs();
    } catch (err: any) {
      alert(`FAQ 수정 오류: ${err.message}`);
    } finally {
      setIsUpdatingFaq(false);
    }
  };

  // ----------------------------------------------------------------------------
  // [4. 긴급 공지(배너/팝업) 핸들러]
  // ----------------------------------------------------------------------------
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementContent.trim()) {
      setAnnouncementError("공지 문구 내용을 입력해 주세요.");
      return;
    }

    setIsSubmittingAnnouncement(true);
    setAnnouncementError("");
    setAnnouncementSuccess("");

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: announcementType,
          content: announcementContent.trim(),
          linkUrl: announcementLinkUrl.trim() || null,
          isActive: announcementIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "공지 등록 실패");

      setAnnouncementSuccess("긴급 공지가 성공적으로 등록되었습니다.");
      setAnnouncementContent("");
      setAnnouncementLinkUrl("");
      setAnnouncementIsActive(true);
      await loadAnnouncements();
    } catch (err: any) {
      setAnnouncementError(err.message);
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };

  const handleToggleAnnouncementActive = async (id: number, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "상태 변경 실패");
      await loadAnnouncements();
    } catch (err: any) {
      alert(`공지 상태 토글 오류: ${err.message}`);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm("이 긴급 공지를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제 실패");
      await loadAnnouncements();
    } catch (err: any) {
      alert(`공지 삭제 오류: ${err.message}`);
    }
  };

  // ----------------------------------------------------------------------------
  // [5. 후원사 핸들러 및 파일 업로드]
  // ----------------------------------------------------------------------------
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setSponsorError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/sponsors/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "로고 업로드 실패");
      }

      setSponsorLogoUrl(data.url);
      setSponsorSuccess("로고 이미지가 안전하게 업로드되었습니다.");
    } catch (err: any) {
      setSponsorError(err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim()) {
      setSponsorError("후원사/기업명을 입력해 주세요.");
      return;
    }
    if (!sponsorLogoUrl.trim()) {
      setSponsorError("로고 이미지 파일을 업로드하거나 URL을 입력해 주세요.");
      return;
    }

    setIsSubmittingSponsor(true);
    setSponsorError("");
    setSponsorSuccess("");

    try {
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorName: sponsorName.trim(),
          tier: sponsorTier,
          logoImageUrl: sponsorLogoUrl.trim(),
          websiteUrl: sponsorWebsiteUrl.trim() || null,
          sortOrder: Number(sponsorSortOrder) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "후원사 등록 실패");

      setSponsorSuccess(`'${sponsorName}' 후원사가 등록되었습니다.`);
      setSponsorName("");
      setSponsorLogoUrl("");
      setSponsorWebsiteUrl("");
      setSponsorSortOrder(0);
      if (sponsorFileInputRef.current) sponsorFileInputRef.current.value = "";
      await loadSponsors();
    } catch (err: any) {
      setSponsorError(err.message);
    } finally {
      setIsSubmittingSponsor(false);
    }
  };

  const handleDeleteSponsor = async (id: number, name: string) => {
    if (!confirm(`'${name}' 후원사를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제 실패");
      await loadSponsors();
    } catch (err: any) {
      alert(`후원사 삭제 오류: ${err.message}`);
    }
  };

  // ----------------------------------------------------------------------------
  // [6. 미디어(YouTube 영상) 핸들러]
  // ----------------------------------------------------------------------------
  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrlOrId.trim()) {
      setMediaError("유튜브 영상 링크 또는 고유 ID를 입력해 주세요.");
      return;
    }
    if (!mediaTitle.trim()) {
      setMediaError("영상 제목을 입력해 주세요.");
      return;
    }

    setIsSubmittingMedia(true);
    setMediaError("");
    setMediaSuccess("");

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrlOrId: mediaUrlOrId.trim(),
          title: mediaTitle.trim(),
          type: mediaType,
          isMainExposure: mediaIsMainExposure,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "영상 등록 실패");

      setMediaSuccess(`'${mediaTitle}' 영상이 성공적으로 등록되었습니다.`);
      setMediaUrlOrId("");
      setMediaTitle("");
      setMediaType("홍보영상");
      setMediaIsMainExposure(false);
      await loadMedia();
    } catch (err: any) {
      setMediaError(err.message);
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  const handleToggleMainExposure = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMainExposure: !current }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "상태 변경 실패");
      await loadMedia();
    } catch (err: any) {
      alert(`메인 노출 설정 오류: ${err.message}`);
    }
  };

  const handleDeleteMedia = async (id: number, title: string) => {
    if (!confirm(`'${title}' 영상을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "삭제 실패");
      await loadMedia();
    } catch (err: any) {
      alert(`영상 삭제 오류: ${err.message}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hanji-bg">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-burnt-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-pretendard text-ink-black/70">
            관리자 인증 세션을 확인 중입니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hanji-bg text-ink-black font-pretendard selection:bg-burnt-orange selection:text-white pb-20">
      {/* 관리자 전용 상단 네비게이션 바 */}
      <header className="sticky top-0 z-40 bg-[#04151F] text-white border-b border-wheat/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-24">
                <Image
                  src="/images/logo-1446-light.svg"
                  alt="1446 세종런 로고"
                  width={100}
                  height={40}
                  className="w-full h-auto"
                />
              </div>
            </Link>
            <span className="text-white/30 text-sm">|</span>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-burnt-orange" />
              <span className="text-xs sm:text-sm font-hunmin font-bold text-wheat">
                운영 관리자 시스템
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 text-xs">
            <span className="hidden md:inline-block text-white/70">
              접속자: <strong className="text-white font-mono">{session?.user?.email}</strong>
            </span>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-wheat transition-colors font-medium"
            >
              <span>메인 웹사이트</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* 대시보드 메인 본문 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 상단 타이틀 및 5대 탭 전환 바 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-ink-black/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-hunmin font-bold text-ink-black tracking-tight">
              1446 세종런 통합 운영 관리 센터
            </h1>
            <p className="text-xs sm:text-sm text-ink-black/60 mt-1">
              참여 상점, 공지사항, FAQ, 긴급 팝업·배너, 후원사를 개발자 개입 없이 실시간 제어합니다.
            </p>
          </div>

          {/* 5개 탭 버튼 */}
          <div className="flex items-center space-x-1.5 bg-white/90 p-1.5 rounded-2xl border border-ink-black/10 shadow-sm text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("shops")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                activeTab === "shops"
                  ? "bg-burnt-orange text-white shadow-md shadow-burnt-orange/30 font-bold"
                  : "text-ink-black/70 hover:text-ink-black hover:bg-white"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>상점 CSV</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {shopsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("notices")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                activeTab === "notices"
                  ? "bg-burnt-orange text-white shadow-md shadow-burnt-orange/30 font-bold"
                  : "text-ink-black/70 hover:text-ink-black hover:bg-white"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>공지사항</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {noticesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("faqs")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                activeTab === "faqs"
                  ? "bg-burnt-orange text-white shadow-md shadow-burnt-orange/30 font-bold"
                  : "text-ink-black/70 hover:text-ink-black hover:bg-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ 관리</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {faqsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                activeTab === "announcements"
                  ? "bg-burnt-orange text-white shadow-md shadow-burnt-orange/30 font-bold"
                  : "text-ink-black/70 hover:text-ink-black hover:bg-white"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>팝업·띠배너</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {announcementsList.filter((a) => a.isActive).length}/{announcementsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sponsors")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                activeTab === "sponsors"
                  ? "bg-burnt-orange text-white shadow-md shadow-burnt-orange/30 font-bold"
                  : "text-ink-black/70 hover:text-ink-black hover:bg-white"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>후원사 로고</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {sponsorsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("media")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                activeTab === "media"
                  ? "bg-burnt-orange text-white shadow-md shadow-burnt-orange/30 font-bold"
                  : "text-ink-black/70 hover:text-ink-black hover:bg-white"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>영상 미디어</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {mediaList.length}
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* [탭 1: 참여 상점 엑셀(CSV) 업로드 및 관리 시스템] */}
        {/* ============================================================================== */}
        {activeTab === "shops" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white/95 rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-black/10">
                <div>
                  <div className="flex items-center space-x-2 text-burnt-orange text-xs font-bold uppercase tracking-wider mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>상점 데이터 원자적 덮어쓰기 (Atomic Replace)</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black">
                    참여 상점 엑셀(CSV) 업로드
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-black/60 mt-1">
                    CSV 파일을 업로드하면 기존 DB의 상점 데이터가 안전하게 삭제되고 새 데이터로 통째로 갱신됩니다.
                  </p>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-ink-black text-wheat hover:bg-ink-black/85 transition-colors text-xs font-semibold shadow-sm flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>표준 CSV 양식 다운로드</span>
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="mt-6 space-y-4">
                <div className="border-2 border-dashed border-ink-black/20 hover:border-burnt-orange/60 transition-colors rounded-2xl p-6 sm:p-8 text-center bg-hanji-bg/50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-burnt-orange/10 flex items-center justify-center text-burnt-orange mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-bold text-ink-black">
                      {selectedFile ? selectedFile.name : "클릭하여 CSV 파일 선택"}
                    </span>
                    <span className="text-xs text-ink-black/50 mt-1">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                        : "CSV (쉼표로 구분된 파일) 지원"}
                    </span>
                  </label>
                </div>

                {uploadError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="px-6 py-3 rounded-xl bg-burnt-orange hover:bg-burnt-orange/90 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>DB 덮어쓰기 처리 중...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>데이터베이스 즉시 반영</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* 현재 저장된 상점 목록 테이블 */}
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-black/10">
                <h3 className="text-lg font-hunmin font-bold text-ink-black">
                  현재 DB 반영 상점 목록 ({shopsList.length}곳)
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-ink-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="상호명, 도로명 주소 검색..."
                    value={shopSearchTerm}
                    onChange={(e) => setShopSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-hanji-bg rounded-xl border border-ink-black/10 focus:outline-none focus:border-burnt-orange"
                  />
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ink-black/5 text-ink-black/70 font-semibold border-b border-ink-black/10">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">상호명</th>
                      <th className="py-2.5 px-3">분류</th>
                      <th className="py-2.5 px-3">도로명 주소</th>
                      <th className="py-2.5 px-3">애프터런 혜택</th>
                      <th className="py-2.5 px-3 text-right">수용인원</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-black/10 text-ink-black/85">
                    {shopsList
                      .filter(
                        (s) =>
                          !shopSearchTerm ||
                          s.shopName.includes(shopSearchTerm) ||
                          s.address.includes(shopSearchTerm)
                      )
                      .slice(0, 30)
                      .map((shop) => (
                        <tr key={shop.id} className="hover:bg-hanji-bg/60">
                          <td className="py-2.5 px-3 font-mono font-bold text-burnt-orange">{shop.id}</td>
                          <td className="py-2.5 px-3 font-bold">{shop.shopName}</td>
                          <td className="py-2.5 px-3">{shop.category}</td>
                          <td className="py-2.5 px-3 truncate max-w-xs">{shop.address}</td>
                          <td className="py-2.5 px-3 truncate max-w-xs">{shop.discountInfo}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{shop.capacity}명</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* [탭 2: 공지사항 관리 게시판] */}
        {/* ============================================================================== */}
        {activeTab === "notices" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-4">
                새 공지사항 작성
              </h2>
              <form onSubmit={handleCreateNotice} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">제목</label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="공지사항 제목을 입력하세요"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">본문 내용</label>
                  <textarea
                    rows={4}
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="공지할 상세 내용을 입력하세요"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={noticeIsImportant}
                    onChange={(e) => setNoticeIsImportant(e.target.checked)}
                    className="w-4 h-4 rounded text-burnt-orange"
                  />
                  <label htmlFor="isImportant" className="text-xs font-bold text-ink-black cursor-pointer">
                    상단 고정 (중요 공지)
                  </label>
                </div>

                {noticeError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {noticeError}
                  </p>
                )}
                {noticeSuccess && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {noticeSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNotice}
                    className="px-6 py-2.5 bg-burnt-orange hover:bg-burnt-orange/90 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {isSubmittingNotice ? "등록 중..." : "공지사항 등록"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-hunmin font-bold text-ink-black mb-4">
                등록된 공지사항 목록 ({noticesList.length}건)
              </h3>
              <div className="divide-y divide-ink-black/10">
                {noticesList.map((notice) => (
                  <div key={notice.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {notice.isImportant && (
                          <span className="px-2 py-0.5 rounded bg-burnt-orange text-white text-[10px] font-bold">
                            중요
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-ink-black">{notice.title}</h4>
                      </div>
                      <p className="text-xs text-ink-black/70 whitespace-pre-wrap">{notice.content}</p>
                      <span className="text-[10px] text-ink-black/40 block">
                        {new Date(notice.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingNotice(notice);
                          setEditTitle(notice.title);
                          setEditContent(notice.content);
                          setEditIsImportant(notice.isImportant);
                        }}
                        className="p-1.5 rounded-lg bg-ink-black/5 hover:bg-ink-black/10 text-ink-black text-xs font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id, notice.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* [탭 6: 미디어(YouTube 영상) 관리 기능] */}
        {/* ============================================================================== */}
        {activeTab === "media" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-burnt-orange text-xs font-bold uppercase tracking-wider mb-1">
                <Film className="w-4 h-4" />
                <span>유튜브 공식 영상 아카이브 및 메인 노출 제어</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-4">
                새 유튜브 영상 등록
              </h2>
              <form onSubmit={handleCreateMedia} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-ink-black mb-1">
                      유튜브 영상 링크(URL) 또는 고유 식별자(ID)
                    </label>
                    <div className="relative">
                      <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={mediaUrlOrId}
                        onChange={(e) => setMediaUrlOrId(e.target.value)}
                        placeholder="예: https://www.youtube.com/watch?v=o5P6K_26VfM 또는 o5P6K_26VfM"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">영상 분류 (Type)</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-semibold"
                    >
                      <option value="홍보영상">홍보영상 (브랜드 필름)</option>
                      <option value="경기영상">경기영상 (대회 하이라이트)</option>
                      <option value="코스 프리뷰">코스 프리뷰 (러닝 뷰)</option>
                      <option value="현장 스케치">현장 스케치 (애프터런)</option>
                      <option value="기타">기타 안내영상</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">영상 제목</label>
                  <input
                    type="text"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="영상 제목을 입력하세요."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mediaIsMain"
                    checked={mediaIsMainExposure}
                    onChange={(e) => setMediaIsMainExposure(e.target.checked)}
                    className="w-4 h-4 rounded text-burnt-orange"
                  />
                  <label htmlFor="mediaIsMain" className="text-xs font-bold text-ink-black cursor-pointer">
                    메인 페이지 최하단(푸터 바로 위 액자)에 대표 영상으로 노출 (체크 시 기존 메인 영상은 자동 교체됨)
                  </label>
                </div>

                {mediaError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {mediaError}
                  </p>
                )}
                {mediaSuccess && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {mediaSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingMedia}
                    className="px-6 py-2.5 bg-burnt-orange hover:bg-burnt-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isSubmittingMedia ? "등록 중..." : "영상 등록하기"}
                  </button>
                </div>
              </form>
            </div>

            {/* 영상 목록 */}
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-hunmin font-bold text-ink-black mb-4">
                등록된 영상 목록 ({mediaList.length}건)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mediaList.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-2xl border border-ink-black/10 bg-hanji-bg/30 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* 썸네일 */}
                      <div className="relative aspect-video bg-ink-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ink-black/80 text-white text-[10px] font-bold">
                          {video.type}
                        </span>
                        {video.isMainExposure && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-burnt-orange text-white text-[10px] font-bold shadow">
                            메인 노출 중
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="text-xs sm:text-sm font-bold text-ink-black line-clamp-2">
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-ink-black/40 font-mono mt-1 block">
                          ID: {video.youtubeId}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-ink-black/5 mt-2 flex items-center justify-between">
                      {/* 메인 노출 토글 */}
                      <button
                        type="button"
                        onClick={() => handleToggleMainExposure(video.id, video.isMainExposure)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          video.isMainExposure
                            ? "bg-burnt-orange text-white shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {video.isMainExposure ? "메인 노출 해제" : "메인 노출로 설정"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(video.id, video.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* [탭 3: FAQ(자주 묻는 질문) 관리 기능] */}
        {/* ============================================================================== */}
        {activeTab === "faqs" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-burnt-orange text-xs font-bold uppercase tracking-wider mb-1">
                <HelpCircle className="w-4 h-4" />
                <span>CS 고객 문의 방어 시스템</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-4">
                새 FAQ(자주 묻는 질문) 등록
              </h2>
              <form onSubmit={handleCreateFaq} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">카테고리</label>
                    <select
                      value={faqCategory}
                      onChange={(e) => setFaqCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                    >
                      <option value="접수">접수 (참가 신청/변경/양도)</option>
                      <option value="코스">코스 (코스 안내/제한시간/급수대)</option>
                      <option value="결제">결제 (참가비 결제/환불/영수증)</option>
                      <option value="기타">기타 (상생 바우처/기념품/당일 행사)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">노출 순서 (낮을수록 상단)</label>
                    <input
                      type="number"
                      value={faqSortOrder}
                      onChange={(e) => setFaqSortOrder(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">질문 (Question)</label>
                  <input
                    type="text"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    placeholder="예: 참가 신청 후 코스 변경이 가능한가요?"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">답변 (Answer)</label>
                  <textarea
                    rows={4}
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    placeholder="참가자에게 안내할 상세 답변을 입력하세요."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                  />
                </div>

                {faqError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {faqError}
                  </p>
                )}
                {faqSuccess && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {faqSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingFaq}
                    className="px-6 py-2.5 bg-burnt-orange hover:bg-burnt-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isSubmittingFaq ? "등록 중..." : "FAQ 등록하기"}
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ 목록 */}
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-hunmin font-bold text-ink-black mb-4">
                등록된 FAQ 목록 ({faqsList.length}건)
              </h3>
              <div className="divide-y divide-ink-black/10">
                {faqsList.map((faq) => (
                  <div key={faq.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-burnt-orange/10 text-burnt-orange text-[10px] font-bold">
                          {faq.category}
                        </span>
                        <span className="text-[10px] text-ink-black/40 font-mono">
                          순서: {faq.sortOrder}
                        </span>
                        <h4 className="text-sm font-bold text-ink-black">{faq.question}</h4>
                      </div>
                      <p className="text-xs text-ink-black/75 whitespace-pre-wrap pl-1">{faq.answer}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingFaq(faq);
                          setEditFaqCategory(faq.category);
                          setEditFaqQuestion(faq.question);
                          setEditFaqAnswer(faq.answer);
                          setEditFaqSortOrder(faq.sortOrder);
                        }}
                        className="p-1.5 rounded-lg bg-ink-black/5 hover:bg-ink-black/10 text-ink-black text-xs font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* [탭 6: 미디어(YouTube 영상) 관리 기능] */}
        {/* ============================================================================== */}
        {activeTab === "media" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-burnt-orange text-xs font-bold uppercase tracking-wider mb-1">
                <Film className="w-4 h-4" />
                <span>유튜브 공식 영상 아카이브 및 메인 노출 제어</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-4">
                새 유튜브 영상 등록
              </h2>
              <form onSubmit={handleCreateMedia} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-ink-black mb-1">
                      유튜브 영상 링크(URL) 또는 고유 식별자(ID)
                    </label>
                    <div className="relative">
                      <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={mediaUrlOrId}
                        onChange={(e) => setMediaUrlOrId(e.target.value)}
                        placeholder="예: https://www.youtube.com/watch?v=o5P6K_26VfM 또는 o5P6K_26VfM"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">영상 분류 (Type)</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-semibold"
                    >
                      <option value="홍보영상">홍보영상 (브랜드 필름)</option>
                      <option value="경기영상">경기영상 (대회 하이라이트)</option>
                      <option value="코스 프리뷰">코스 프리뷰 (러닝 뷰)</option>
                      <option value="현장 스케치">현장 스케치 (애프터런)</option>
                      <option value="기타">기타 안내영상</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">영상 제목</label>
                  <input
                    type="text"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="영상 제목을 입력하세요."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mediaIsMain"
                    checked={mediaIsMainExposure}
                    onChange={(e) => setMediaIsMainExposure(e.target.checked)}
                    className="w-4 h-4 rounded text-burnt-orange"
                  />
                  <label htmlFor="mediaIsMain" className="text-xs font-bold text-ink-black cursor-pointer">
                    메인 페이지 최하단(푸터 바로 위 액자)에 대표 영상으로 노출 (체크 시 기존 메인 영상은 자동 교체됨)
                  </label>
                </div>

                {mediaError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {mediaError}
                  </p>
                )}
                {mediaSuccess && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {mediaSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingMedia}
                    className="px-6 py-2.5 bg-burnt-orange hover:bg-burnt-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isSubmittingMedia ? "등록 중..." : "영상 등록하기"}
                  </button>
                </div>
              </form>
            </div>

            {/* 영상 목록 */}
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-hunmin font-bold text-ink-black mb-4">
                등록된 영상 목록 ({mediaList.length}건)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mediaList.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-2xl border border-ink-black/10 bg-hanji-bg/30 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* 썸네일 */}
                      <div className="relative aspect-video bg-ink-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ink-black/80 text-white text-[10px] font-bold">
                          {video.type}
                        </span>
                        {video.isMainExposure && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-burnt-orange text-white text-[10px] font-bold shadow">
                            메인 노출 중
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="text-xs sm:text-sm font-bold text-ink-black line-clamp-2">
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-ink-black/40 font-mono mt-1 block">
                          ID: {video.youtubeId}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-ink-black/5 mt-2 flex items-center justify-between">
                      {/* 메인 노출 토글 */}
                      <button
                        type="button"
                        onClick={() => handleToggleMainExposure(video.id, video.isMainExposure)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          video.isMainExposure
                            ? "bg-burnt-orange text-white shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {video.isMainExposure ? "메인 노출 해제" : "메인 노출로 설정"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(video.id, video.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* [탭 4: 긴급 팝업 및 상단 띠 배너(Top Banner) 제어 스위치판] */}
        {/* ============================================================================== */}
        {activeTab === "announcements" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-burnt-orange text-xs font-bold uppercase tracking-wider mb-1">
                <Megaphone className="w-4 h-4" />
                <span>실시간 전역 안내 및 트래픽 공지</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-4">
                새 긴급 공지(팝업 / 띠배너) 등록
              </h2>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">표시 형태</label>
                    <select
                      value={announcementType}
                      onChange={(e) => setAnnouncementType(e.target.value as "BANNER" | "POPUP")}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-semibold"
                    >
                      <option value="BANNER">상단 띠 배너 (Top Banner - 웹사이트 최상단)</option>
                      <option value="POPUP">긴급 팝업 모달 (Popup Dialog - 중앙 팝업)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">클릭 이동 링크 URL (선택)</label>
                    <input
                      type="text"
                      value={announcementLinkUrl}
                      onChange={(e) => setAnnouncementLinkUrl(e.target.value)}
                      placeholder="예: #register 또는 https://..."
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">공지 문구 / 상세 내용</label>
                  <textarea
                    rows={3}
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="참가 접수 마감 임박, 교통 통제, 현장 안내 등 긴급 공지 문구를 입력하세요."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={announcementIsActive}
                    onChange={(e) => setAnnouncementIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-burnt-orange"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-ink-black cursor-pointer">
                    즉시 웹사이트 노출 활성화 (Active)
                  </label>
                </div>

                {announcementError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {announcementError}
                  </p>
                )}
                {announcementSuccess && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {announcementSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingAnnouncement}
                    className="px-6 py-2.5 bg-burnt-orange hover:bg-burnt-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isSubmittingAnnouncement ? "등록 중..." : "공지 등록 및 활성화"}
                  </button>
                </div>
              </form>
            </div>

            {/* 공지 목록 및 토글 스위치 */}
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-hunmin font-bold text-ink-black mb-4">
                배너 및 팝업 제어 목록 ({announcementsList.length}건)
              </h3>
              <div className="divide-y divide-ink-black/10">
                {announcementsList.map((ann) => (
                  <div key={ann.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ann.type === "BANNER"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {ann.type === "BANNER" ? "상단 띠배너" : "중앙 팝업"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ann.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {ann.isActive ? "노출 중 (ON)" : "비활성 (OFF)"}
                        </span>
                        {ann.linkUrl && (
                          <span className="text-[10px] text-ink-black/40 truncate max-w-xs">
                            링크: {ann.linkUrl}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-black font-medium whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {/* 실시간 스위치 토글 버튼 */}
                      <button
                        onClick={() => handleToggleAnnouncementActive(ann.id, ann.isActive)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          ann.isActive
                            ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {ann.isActive ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>ON (노출 중)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>OFF (숨김)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* [탭 6: 미디어(YouTube 영상) 관리 기능] */}
        {/* ============================================================================== */}
        {activeTab === "media" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-burnt-orange text-xs font-bold uppercase tracking-wider mb-1">
                <Film className="w-4 h-4" />
                <span>유튜브 공식 영상 아카이브 및 메인 노출 제어</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-4">
                새 유튜브 영상 등록
              </h2>
              <form onSubmit={handleCreateMedia} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-ink-black mb-1">
                      유튜브 영상 링크(URL) 또는 고유 식별자(ID)
                    </label>
                    <div className="relative">
                      <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={mediaUrlOrId}
                        onChange={(e) => setMediaUrlOrId(e.target.value)}
                        placeholder="예: https://www.youtube.com/watch?v=o5P6K_26VfM 또는 o5P6K_26VfM"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">영상 분류 (Type)</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-semibold"
                    >
                      <option value="홍보영상">홍보영상 (브랜드 필름)</option>
                      <option value="경기영상">경기영상 (대회 하이라이트)</option>
                      <option value="코스 프리뷰">코스 프리뷰 (러닝 뷰)</option>
                      <option value="현장 스케치">현장 스케치 (애프터런)</option>
                      <option value="기타">기타 안내영상</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">영상 제목</label>
                  <input
                    type="text"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="영상 제목을 입력하세요."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mediaIsMain"
                    checked={mediaIsMainExposure}
                    onChange={(e) => setMediaIsMainExposure(e.target.checked)}
                    className="w-4 h-4 rounded text-burnt-orange"
                  />
                  <label htmlFor="mediaIsMain" className="text-xs font-bold text-ink-black cursor-pointer">
                    메인 페이지 최하단(푸터 바로 위 액자)에 대표 영상으로 노출 (체크 시 기존 메인 영상은 자동 교체됨)
                  </label>
                </div>

                {mediaError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {mediaError}
                  </p>
                )}
                {mediaSuccess && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {mediaSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingMedia}
                    className="px-6 py-2.5 bg-burnt-orange hover:bg-burnt-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isSubmittingMedia ? "등록 중..." : "영상 등록하기"}
                  </button>
                </div>
              </form>
            </div>

            {/* 영상 목록 */}
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-hunmin font-bold text-ink-black mb-4">
                등록된 영상 목록 ({mediaList.length}건)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mediaList.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-2xl border border-ink-black/10 bg-hanji-bg/30 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* 썸네일 */}
                      <div className="relative aspect-video bg-ink-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ink-black/80 text-white text-[10px] font-bold">
                          {video.type}
                        </span>
                        {video.isMainExposure && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-burnt-orange text-white text-[10px] font-bold shadow">
                            메인 노출 중
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="text-xs sm:text-sm font-bold text-ink-black line-clamp-2">
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-ink-black/40 font-mono mt-1 block">
                          ID: {video.youtubeId}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-ink-black/5 mt-2 flex items-center justify-between">
                      {/* 메인 노출 토글 */}
                      <button
                        type="button"
                        onClick={() => handleToggleMainExposure(video.id, video.isMainExposure)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          video.isMainExposure
                            ? "bg-burnt-orange text-white shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {video.isMainExposure ? "메인 노출 해제" : "메인 노출로 설정"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(video.id, video.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* [탭 5: 후원사(Sponsor) 로고 및 명단 관리 기능] */}
        {/* ============================================================================== */}
        {activeTab === "sponsors" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-burnt-orange text-xs font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>공식 파트너십 & 로고 관리</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-4">
                새 후원사 등록 및 로고 이미지 업로드
              </h2>
              <form onSubmit={handleCreateSponsor} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">기업/기관명</label>
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="예: NH농협은행 세종영업본부"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">후원 등급 (Tier)</label>
                    <select
                      value={sponsorTier}
                      onChange={(e) => setSponsorTier(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-semibold"
                    >
                      <option value="메인">메인 파트너 (주최/주관)</option>
                      <option value="골드">골드 파트너 (주요 후원)</option>
                      <option value="실버">실버 파트너</option>
                      <option value="브론즈">브론즈 파트너</option>
                      <option value="현물">공식 보급 협찬 및 물품 후원</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">노출 순서 (정렬 번호)</label>
                    <input
                      type="number"
                      value={sponsorSortOrder}
                      onChange={(e) => setSponsorSortOrder(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 보안 로고 이미지 파일 업로드 */}
                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">
                      로고 이미지 파일 첨부 (PNG, JPG, SVG, WebP / 최대 2MB)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        ref={sponsorFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="sponsor-logo-file"
                      />
                      <label
                        htmlFor="sponsor-logo-file"
                        className="cursor-pointer px-4 py-2.5 rounded-xl bg-ink-black text-wheat hover:bg-ink-black/85 text-xs font-semibold flex items-center space-x-1.5 transition-colors flex-shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingLogo ? "업로드 중..." : "파일 선택"}</span>
                      </label>
                      <input
                        type="text"
                        value={sponsorLogoUrl}
                        onChange={(e) => setSponsorLogoUrl(e.target.value)}
                        placeholder="또는 로고 이미지 URL 직접 입력"
                        className="w-full px-3 py-2 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">공식 웹사이트 링크 (선택)</label>
                    <input
                      type="text"
                      value={sponsorWebsiteUrl}
                      onChange={(e) => setSponsorWebsiteUrl(e.target.value)}
                      placeholder="예: https://www.sejong.go.kr"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange"
                    />
                  </div>
                </div>

                {sponsorLogoUrl && (
                  <div className="p-3 rounded-xl bg-hanji-bg border border-ink-black/10 flex items-center space-x-3">
                    <span className="text-xs text-ink-black/60 font-bold">미리보기:</span>
                    <div className="w-24 h-10 bg-white rounded border border-ink-black/10 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sponsorLogoUrl}
                        alt="미리보기"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {sponsorError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {sponsorError}
                  </p>
                )}
                {sponsorSuccess && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {sponsorSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingSponsor}
                    className="px-6 py-2.5 bg-burnt-orange hover:bg-burnt-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isSubmittingSponsor ? "등록 중..." : "후원사 등록"}
                  </button>
                </div>
              </form>
            </div>

            {/* 후원사 목록 */}
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-hunmin font-bold text-ink-black mb-4">
                등록된 후원사 목록 ({sponsorsList.length}개사)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sponsorsList.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="p-4 rounded-2xl border border-ink-black/10 bg-hanji-bg/40 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-10 bg-white rounded-lg border border-ink-black/10 flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sponsor.logoImageUrl}
                          alt={sponsor.sponsorName}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-burnt-orange text-white text-[9px] font-bold">
                            {sponsor.tier}
                          </span>
                          <h4 className="text-xs font-bold text-ink-black truncate max-w-[120px]">
                            {sponsor.sponsorName}
                          </h4>
                        </div>
                        <span className="text-[10px] text-ink-black/40 block mt-0.5">
                          순서: {sponsor.sortOrder}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSponsor(sponsor.id, sponsor.sponsorName)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* [탭 6: 미디어(YouTube 영상) 관리 기능] */}
        {/* ============================================================================== */}
        {activeTab === "media" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <div className="flex items-center space-x-2 text-burnt-orange text-xs font-bold uppercase tracking-wider mb-1">
                <Film className="w-4 h-4" />
                <span>유튜브 공식 영상 아카이브 및 메인 노출 제어</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-hunmin font-bold text-ink-black mb-4">
                새 유튜브 영상 등록
              </h2>
              <form onSubmit={handleCreateMedia} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-ink-black mb-1">
                      유튜브 영상 링크(URL) 또는 고유 식별자(ID)
                    </label>
                    <div className="relative">
                      <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={mediaUrlOrId}
                        onChange={(e) => setMediaUrlOrId(e.target.value)}
                        placeholder="예: https://www.youtube.com/watch?v=o5P6K_26VfM 또는 o5P6K_26VfM"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black mb-1">영상 분류 (Type)</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-semibold"
                    >
                      <option value="홍보영상">홍보영상 (브랜드 필름)</option>
                      <option value="경기영상">경기영상 (대회 하이라이트)</option>
                      <option value="코스 프리뷰">코스 프리뷰 (러닝 뷰)</option>
                      <option value="현장 스케치">현장 스케치 (애프터런)</option>
                      <option value="기타">기타 안내영상</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black mb-1">영상 제목</label>
                  <input
                    type="text"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="영상 제목을 입력하세요."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-ink-black/15 rounded-xl focus:outline-none focus:border-burnt-orange font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mediaIsMain"
                    checked={mediaIsMainExposure}
                    onChange={(e) => setMediaIsMainExposure(e.target.checked)}
                    className="w-4 h-4 rounded text-burnt-orange"
                  />
                  <label htmlFor="mediaIsMain" className="text-xs font-bold text-ink-black cursor-pointer">
                    메인 페이지 최하단(푸터 바로 위 액자)에 대표 영상으로 노출 (체크 시 기존 메인 영상은 자동 교체됨)
                  </label>
                </div>

                {mediaError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {mediaError}
                  </p>
                )}
                {mediaSuccess && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {mediaSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingMedia}
                    className="px-6 py-2.5 bg-burnt-orange hover:bg-burnt-orange/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isSubmittingMedia ? "등록 중..." : "영상 등록하기"}
                  </button>
                </div>
              </form>
            </div>

            {/* 영상 목록 */}
            <div className="bg-white rounded-3xl border border-ink-black/15 shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-hunmin font-bold text-ink-black mb-4">
                등록된 영상 목록 ({mediaList.length}건)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mediaList.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-2xl border border-ink-black/10 bg-hanji-bg/30 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* 썸네일 */}
                      <div className="relative aspect-video bg-ink-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ink-black/80 text-white text-[10px] font-bold">
                          {video.type}
                        </span>
                        {video.isMainExposure && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-burnt-orange text-white text-[10px] font-bold shadow">
                            메인 노출 중
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="text-xs sm:text-sm font-bold text-ink-black line-clamp-2">
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-ink-black/40 font-mono mt-1 block">
                          ID: {video.youtubeId}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-ink-black/5 mt-2 flex items-center justify-between">
                      {/* 메인 노출 토글 */}
                      <button
                        type="button"
                        onClick={() => handleToggleMainExposure(video.id, video.isMainExposure)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          video.isMainExposure
                            ? "bg-burnt-orange text-white shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {video.isMainExposure ? "메인 노출 해제" : "메인 노출로 설정"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(video.id, video.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 공지사항 수정 모달 */}
      {editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-ink-black/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-hunmin font-bold text-lg">공지사항 수정</h3>
              <button onClick={() => setEditingNotice(null)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">제목</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">내용</label>
              <textarea
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editImportant"
                checked={editIsImportant}
                onChange={(e) => setEditIsImportant(e.target.checked)}
                className="w-4 h-4 rounded text-burnt-orange"
              />
              <label htmlFor="editImportant" className="text-xs font-bold">
                상단 고정 (중요 공지)
              </label>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setEditingNotice(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleSaveEditNotice}
                disabled={isUpdatingNotice}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-burnt-orange text-white"
              >
                {isUpdatingNotice ? "저장 중..." : "수정 완료"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 수정 모달 */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-ink-black/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-hunmin font-bold text-lg">FAQ 항목 수정</h3>
              <button onClick={() => setEditingFaq(null)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">카테고리</label>
                <select
                  value={editFaqCategory}
                  onChange={(e) => setEditFaqCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                >
                  <option value="접수">접수</option>
                  <option value="코스">코스</option>
                  <option value="결제">결제</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">정렬 순서</label>
                <input
                  type="number"
                  value={editFaqSortOrder}
                  onChange={(e) => setEditFaqSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">질문</label>
              <input
                type="text"
                value={editFaqQuestion}
                onChange={(e) => setEditFaqQuestion(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">답변</label>
              <textarea
                rows={4}
                value={editFaqAnswer}
                onChange={(e) => setEditFaqAnswer(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setEditingFaq(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleSaveEditFaq}
                disabled={isUpdatingFaq}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-burnt-orange text-white"
              >
                {isUpdatingFaq ? "저장 중..." : "수정 완료"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
