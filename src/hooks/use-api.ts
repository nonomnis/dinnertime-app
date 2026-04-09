"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getISOWeek } from "@/lib/utils";

/**
 * Generic API fetch hook with loading/error/data states and caching
 */
export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Get current family ID from session
 */
export function useFamilyId(): string | undefined {
  const { data: session } = useSession();
  return (session?.user as any)?.familyId;
}

/**
 * Get current ISO week and navigation helpers
 */
export function useCurrentWeek() {
  const [week, setWeek] = useState<string>("");

  useEffect(() => {
    setWeek(getISOWeek(new Date()));
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setWeek((currentWeek) => {
      if (!currentWeek) return getISOWeek(new Date());

      const [year, w] = currentWeek.split("-W").map(Number);
      let newWeek = w - 1;
      let newYear = year;

      if (newWeek < 1) {
        newYear--;
        newWeek = 53;
      }

      return `${newYear}-W${String(newWeek).padStart(2, "0")}`;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeek((currentWeek) => {
      if (!currentWeek) return getISOWeek(new Date());

      const [year, w] = currentWeek.split("-W").map(Number);
      let newWeek = w + 1;
      let newYear = year;

      if (newWeek > 53) {
        newYear++;
        newWeek = 1;
      }

      return `${newYear}-W${String(newWeek).padStart(2, "0")}`;
    });
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setWeek(getISOWeek(new Date()));
  }, []);

  const isCurrentWeek = week === getISOWeek(new Date());

  return {
    week,
    setWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isCurrentWeek,
  };
}
