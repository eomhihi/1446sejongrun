"use client";

import { useCountdown } from "./useCountdown";
import { EVENT_DATE } from "@/constants/event";

export function useDDay(duration: number = 1.6) {
  const countdown = useCountdown(EVENT_DATE, duration);

  return {
    dDay: countdown.dDay,
    displayDday: countdown.displayDday,
    formattedDday: `D-${String(countdown.displayDday).padStart(3, "0")}`,
    isLoaded: countdown.isLoaded,
  };
}

export { useCountdown };
