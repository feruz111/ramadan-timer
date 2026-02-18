import { useState, useEffect } from "react";
import type { Location, PrayerTimesData, CalcMethod } from "../types";
import { fetchTimings } from "../services/aladhanApi";
import { parseTimeToDate } from "../utils/time";

export function usePrayerTimes(location: Location | null, method: CalcMethod) {
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    setData(null);
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [todayRes, tomorrowRes] = await Promise.all([
          fetchTimings(today, location!, method),
          fetchTimings(tomorrow, location!, method),
        ]);

        if (cancelled) return;

        const tz = todayRes.data.meta.timezone;

        const todayFajrTime = parseTimeToDate(
          todayRes.data.timings.Fajr,
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          tz
        );

        const maghribTime = parseTimeToDate(
          todayRes.data.timings.Maghrib,
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          tz
        );

        const tomorrowFajrTime = parseTimeToDate(
          tomorrowRes.data.timings.Fajr,
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          tomorrow.getDate(),
          tz
        );

        const hijri = todayRes.data.date.hijri;
        const hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
        const gregorianDate = todayRes.data.date.readable;

        setData({
          todayFajrTime,
          maghribTime,
          tomorrowFajrTime,
          hijriDate,
          gregorianDate,
          maghribDisplay: todayRes.data.timings.Maghrib,
          fajrDisplay: todayRes.data.timings.Fajr,
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch prayer times");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [location, method]);

  return { data, loading, error };
}
