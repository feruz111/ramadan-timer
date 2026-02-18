export interface Location {
  latitude: number;
  longitude: number;
  label: string;
  countryCode?: string;
}

export type LocationStatus = "loading" | "granted" | "denied" | "error";

export interface PrayerTimesData {
  todayFajrTime: Date;
  maghribTime: Date;
  tomorrowFajrTime: Date;
  hijriDate: string;
  gregorianDate: string;
  maghribDisplay: string;
  fajrDisplay: string;
}

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export type Phase = "before-fajr" | "fasting" | "after-maghrib";

export interface CalcMethod {
  id: string;
  label: string;
  region: string;
  params: string;
}

export interface AladhanTimings {
  Fajr: string;
  Maghrib: string;
  [key: string]: string;
}

export interface AladhanHijriDate {
  day: string;
  month: { en: string };
  year: string;
}

export interface AladhanResponse {
  data: {
    timings: AladhanTimings;
    date: {
      readable: string;
      hijri: AladhanHijriDate;
    };
    meta: {
      timezone: string;
    };
  };
}
