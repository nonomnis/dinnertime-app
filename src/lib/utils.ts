import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfISOWeek, endOfISOWeek, eachDayOfInterval, isDate } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

/**
 * Merge classNames safely with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date using date-fns format
 */
export function formatDate(date: Date | number, formatStr: string = "PPP") {
  try {
    return format(isDate(date) ? date : new Date(date), formatStr);
  } catch (error) {
    return "";
  }
}

/**
 * Get ISO week string (e.g., "2026-W16")
 */
export function getISOWeek(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

/**
 * Parse ISO week string and return array of 7 dates for that week (Mon-Sun)
 */
export function getWeekDates(isoWeek: string): Date[] {
  // Parse "2026-W16" format
  const [year, week] = isoWeek.split("-W").map(Number);

  // Create a date for Jan 4 of that year (always in week 1)
  const jan4 = new Date(year, 0, 4);

  // Get Monday of week 1
  const weekOne = new Date(jan4);
  weekOne.setDate(weekOne.getDate() - weekOne.getDay() + 1);

  // Calculate the Monday of the target week
  const targetWeek = new Date(weekOne);
  targetWeek.setDate(targetWeek.getDate() + (week - 1) * 7);

  // Return array of 7 days (Mon-Sun)
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(targetWeek);
    day.setDate(day.getDate() + i);
    dates.push(day);
  }

  return dates;
}

/**
 * Calculate decayed modifier value based on initial penalty, decay interval, and application date
 * Returns value between 0 and 1, where 1 is full penalty and approaching 0 is decayed away
 */
export function calculateDecayedModifier(
  initialPenalty: number,
  decayIntervalWeeks: number,
  appliedAt: Date
): number {
  const now = new Date();
  const weeksPassed = (now.getTime() - appliedAt.getTime()) / (7 * 24 * 60 * 60 * 1000);

  // Exponential decay: value = initialPenalty * (0.5 ^ (weeksPassed / decayIntervalWeeks))
  const decayedValue = initialPenalty * Math.pow(0.5, weeksPassed / decayIntervalWeeks);

  // Clamp between 0 and initialPenalty
  return Math.max(0, Math.min(initialPenalty, decayedValue));
}

/**
 * Convert text to URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
