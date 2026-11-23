import { EVENT_LOCATION } from "./event";

export interface CourseData {
  id: "14.46km" | "10km" | "5km";
  distance: string;
  name: string;
  shortName: string;
  badge?: string;
  color: string;
  glowColor: string;
  desc: string;
  checkpoint: string;
  turnpointName: string;
  limitTime: string;
  glowPath: string;
  runnerPosition: { x: number; y: number };
}

// 1446 세종런 공식 코스 메타데이터 (단일 소스 관리)
export const COURSES_DATA: CourseData[] = [
  {
    id: "14.46km",
    distance: "14.46km",
    name: "14.46km 상징 훈민정음 달리기",
    shortName: "상징 코스",
    badge: "대표",
    color: "#C44900",
    glowColor: "rgba(196, 73, 0, 0.85)",
    desc: `${EVENT_LOCATION} 출발 → 금강 남측 자전거도로 서진 → 학나래교 방면 1차 반환점 → 이응다리 횡단(남단→북단) → 국립어린이박물관·호수공원 남측 순환 → 금강 수변길 동진 → 햇무리교 남단 반환 → ${EVENT_LOCATION} 완주`,
    checkpoint: "세종호수공원 & 햇무리교 수변길",
    turnpointName: "학나래교 방면 / 햇무리교 남단",
    limitTime: "2시간 20분",
    // 남측 자전거도로 서진 -> 이응다리 북단 -> 호수공원 남측 -> 햇무리교 남단 순환 루프
    glowPath:
      "M 150 78 C 110 78, 60 76, 25 74 C 25 70, 70 66, 120 66 L 150 48 L 150 28 C 170 20, 210 20, 245 28 C 265 38, 275 55, 270 68 C 245 74, 195 78, 150 78 Z",
    runnerPosition: { x: 245, y: 28 },
  },
  {
    id: "10km",
    distance: "10km",
    name: "10km 골목 활력 도전",
    shortName: "도심 도전",
    badge: "도전",
    color: "#EFD6AC",
    glowColor: "rgba(239, 214, 172, 0.85)",
    desc: `${EVENT_LOCATION} 출발 → 금강 남측 자전거도로 서진(학나래교 방면) → 서측 반환점 → 금강 남측 직진 → 이응다리 통과(남단→북단) → 북단 반환 후 이응다리 재횡단 → ${EVENT_LOCATION} 완주`,
    checkpoint: "금강 남측 자전거길 & 이응다리",
    turnpointName: "학나래교 방면 서측 / 이응다리 북단",
    limitTime: "1시간 40분",
    // 서측으로 뻗어나갔다가 돌아와 이응다리를 북단까지 찍고 오는 T자형 순환
    glowPath:
      "M 150 78 C 110 78, 65 76, 30 76 C 30 72, 75 70, 150 70 L 150 25 C 150 22, 155 22, 155 25 L 155 70 L 150 78 Z",
    runnerPosition: { x: 30, y: 76 },
  },
  {
    id: "5km",
    distance: "5km",
    name: "5km 해례본 가족 걷기·달리기",
    shortName: "가족 걷기",
    badge: "가족",
    color: "#5E8C85",
    glowColor: "rgba(94, 140, 133, 0.85)",
    desc: `${EVENT_LOCATION} 출발 → 이응다리 남단 진입 → 이응다리 중앙 원형 구간 진입 → 보행교 원형 코스 반시계 방향 순환 → 남단 출구 → ${EVENT_LOCATION} 완주`,
    checkpoint: "이응다리 원형 보행 데크",
    turnpointName: "이응다리 원형 전망대",
    limitTime: "1시간 10분",
    // 시청에서 이응다리 원형교 일주 경로 (반시계 방향)
    glowPath:
      "M 150 78 C 145 62, 132 52, 132 38 C 132 20, 168 20, 168 38 C 168 52, 155 62, 150 78 Z",
    runnerPosition: { x: 150, y: 22 },
  },
];

// ID 기반 맵핑 유틸리티
export const COURSES_MAP = COURSES_DATA.reduce(
  (acc, course) => {
    acc[course.id] = course;
    return acc;
  },
  {} as Record<"14.46km" | "10km" | "5km", CourseData>
);

