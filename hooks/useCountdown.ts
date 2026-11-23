"use client";

import { useState, useEffect } from "react";
import { animate } from "framer-motion";
import { EVENT_DATE } from "@/constants/event";

export interface CountdownState {
  dDay: number | null;
  displayDday: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedDday: string;
  formattedHours: string;
  formattedMinutes: string;
  formattedSeconds: string;
  isLoaded: boolean;
}

/**
 * 1446 세종런 전역 카운트다운 타이머 훅
 * - EVENT_DATE(2027-04-03T14:00:00+09:00) 기준 실시간 1초 단위 동기화
 * - Next.js Hydration 오류 방지 (초기 렌더링 SSR 일치)
 * - Framer Motion 0 -> 목표 D-Day 카운트업 모션
 */
export function useCountdown(targetDate: Date = EVENT_DATE, duration: number = 1.6): CountdownState {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dDay, setDday] = useState<number | null>(null);
  const [displayDday, setDisplayDday] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // 1초 단위 시간차 계산 함수
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const diff = targetDate.getTime() - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const calculatedDday = Math.ceil(diff / (1000 * 60 * 60 * 24));

        setTimeLeft({ days, hours, minutes, seconds });
        return calculatedDday;
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return 0;
      }
    };

    // 마운트 시 최초 즉시 실행
    const initialDday = calculateTimeRemaining();
    setDday(initialDday);
    setIsLoaded(true);

    // D-Day 숫자 스르륵 카운트업 애니메이션 (Framer Motion)
    const controls = animate(0, Math.max(0, initialDday), {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => {
        setDisplayDday(Math.floor(latest));
      },
    });

    // 1초마다 정확하게 타이머 상태 동기화
    const intervalTimer = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => {
      controls.stop();
      clearInterval(intervalTimer);
    };
  }, [targetDate, duration]);

  const formattedDday = `D-${displayDday}`;

  return {
    dDay,
    displayDday,
    days: timeLeft.days,
    hours: timeLeft.hours,
    minutes: timeLeft.minutes,
    seconds: timeLeft.seconds,
    formattedDday,
    formattedHours: String(timeLeft.hours).padStart(2, "0"),
    formattedMinutes: String(timeLeft.minutes).padStart(2, "0"),
    formattedSeconds: String(timeLeft.seconds).padStart(2, "0"),
    isLoaded,
  };
}

