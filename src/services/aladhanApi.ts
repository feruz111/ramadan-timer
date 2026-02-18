import type { Location, AladhanResponse, CalcMethod } from "../types";
import { formatDateForApi } from "../utils/time";

const BASE_URL = "https://api.aladhan.com/v1/timings";

// Aladhan API method IDs: https://aladhan.com/prayer-times-api#tag/Monthly-Prayer-Times-Calendar/paths/~1v1~1calendar~1%7Byear%7D~1%7Bmonth%7D/get
export const CALC_METHODS: CalcMethod[] = [
  { id: "3",  label: "Muslim World League",   region: "Europe, Far East",        params: "method=3" },
  { id: "4",  label: "Umm Al-Qura",           region: "Saudi Arabia",            params: "method=4" },
  { id: "5",  label: "Egyptian General Auth.", region: "Africa, Middle East",     params: "method=5" },
  { id: "2",  label: "ISNA",                  region: "North America",           params: "method=2" },
  { id: "1",  label: "Karachi",               region: "Pakistan, India",         params: "method=1" },
  { id: "13", label: "Diyanet (Turkey)",       region: "Turkey, Balkans",         params: "method=13" },
  { id: "14", label: "Russia / CIS",           region: "Russia, Central Asia",    params: "method=14" },
  { id: "uz", label: "Uzbekistan (15°/15°)",   region: "Uzbekistan",              params: "method=99&methodSettings=15,null,15&tune=0,0,0,0,0,4,0,0,0" },
  { id: "9",  label: "Kuwait",                 region: "Kuwait",                  params: "method=9" },
  { id: "10", label: "Qatar",                  region: "Qatar",                   params: "method=10" },
  { id: "8",  label: "Gulf Region",            region: "UAE, Oman, Bahrain",      params: "method=8" },
  { id: "11", label: "Singapore",              region: "Singapore, SE Asia",      params: "method=11" },
];

export const DEFAULT_METHOD = CALC_METHODS[0]; // MWL

// Map ISO 3166-1 alpha-2 country codes to method IDs
const COUNTRY_METHOD_MAP: Record<string, string> = {
  UZ: "uz", TJ: "uz", TM: "uz", KG: "uz",
  TR: "13",
  SA: "4", YE: "4",
  EG: "5", SY: "5", LB: "5", JO: "5", LY: "5", SD: "5", IQ: "5",
  US: "2", CA: "2", MX: "2",
  PK: "1", IN: "1", BD: "1", AF: "1",
  RU: "14", KZ: "14", AZ: "14",
  KW: "9",
  QA: "10",
  AE: "8", OM: "8", BH: "8",
  MY: "11", SG: "11", ID: "11", BN: "11",
};

export function getMethodForCountry(countryCode?: string): CalcMethod {
  if (!countryCode) return DEFAULT_METHOD;
  const methodId = COUNTRY_METHOD_MAP[countryCode.toUpperCase()];
  if (!methodId) return DEFAULT_METHOD;
  return CALC_METHODS.find((m) => m.id === methodId) ?? DEFAULT_METHOD;
}

const METHOD_STORAGE_KEY = "ramadan-timer-method";

export function loadSavedMethod(): CalcMethod | null {
  try {
    const id = localStorage.getItem(METHOD_STORAGE_KEY);
    if (!id) return null;
    return CALC_METHODS.find((m) => m.id === id) ?? null;
  } catch {
    return null;
  }
}

export function persistMethod(method: CalcMethod) {
  localStorage.setItem(METHOD_STORAGE_KEY, method.id);
}

function buildUrl(date: Date, location: Location, method: CalcMethod): string {
  const dateStr = formatDateForApi(date);
  return `${BASE_URL}/${dateStr}?latitude=${location.latitude}&longitude=${location.longitude}&${method.params}`;
}

export async function fetchTimings(
  date: Date,
  location: Location,
  method: CalcMethod
): Promise<AladhanResponse> {
  const url = buildUrl(date, location, method);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Aladhan API error: ${res.status}`);
  }
  return res.json();
}
