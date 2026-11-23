// 1446 세종런 전역 대회 상수 및 유틸리티 설정
export const EVENT_DATE = new Date('2027-04-03T14:00:00+09:00');
export const EVENT_LOCATION = '세종시청 앞 광장';

// 대회 주최 / 주관 및 슬로건 공식 메타데이터
export const EVENT_HOST = '세종특별자치시 소상공인연합회';
export const EVENT_ORGANIZER = '세종시 육상연맹 · 1446 세종런 조직위원회';
export const MAIN_SLOGAN = '국가균형성장의 중심, 행정수도 세종';
export const EVENT_FULL_PERIOD = '2027. 04. 03. (토) 14:00 ~ 21:00';

/**
 * 대회 일시 포맷팅 함수
 * 요구 형식: 2027. 04. 03. (토) 14:00 ~ 21:00
 */
export function formatEventDate(date: Date = EVENT_DATE): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}. ${month}. ${day}. (${dayOfWeek}) ${hours}:${minutes} ~ 21:00`;
}

/**
 * D-Day 일수 계산 로직
 * 계산 로직: Math.ceil((EVENT_DATE - new Date()) / (1000 * 60 * 60 * 24))
 */
export function calculateDDay(targetDate: Date = EVENT_DATE): number {
  const diff = targetDate.getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

