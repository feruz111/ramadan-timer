import { useState, useEffect, useRef } from "react";
import { useLocation } from "./hooks/useLocation";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import { useCountdown } from "./hooks/useCountdown";
import { Countdown } from "./components/Countdown";
import { LocationPicker } from "./components/LocationPicker";
import { IftarMessage } from "./components/IftarMessage";
import { MethodPicker } from "./components/MethodPicker";
import { ThemeToggle } from "./components/ThemeToggle";
import {
  DEFAULT_METHOD,
  getMethodForCountry,
  loadSavedMethod,
  persistMethod,
} from "./services/aladhanApi";
import { useTheme } from "./hooks/useTheme";
import type { Phase, CalcMethod } from "./types";

const IFTAR_MESSAGE_DURATION = 5000;

function getPhase(todayFajr: Date, maghrib: Date): Phase {
  const now = new Date();
  if (now < todayFajr) return "before-fajr";
  if (now < maghrib) return "fasting";
  return "after-maghrib";
}

function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { location, status, setManualLocation } = useLocation();
  const [method, setMethod] = useState<CalcMethod>(
    () => loadSavedMethod() ?? DEFAULT_METHOD
  );
  const { data, loading, error } = usePrayerTimes(location, method);
  const [phase, setPhase] = useState<Phase>("fasting");
  const [showIftarMessage, setShowIftarMessage] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);

  // Auto-select method based on country on first visit (no saved method yet)
  useEffect(() => {
    if (!location || loadSavedMethod()) return;
    const detected = getMethodForCountry(location.countryCode);
    setMethod(detected);
    persistMethod(detected);
  }, [location]);

  function handleMethodChange(m: CalcMethod) {
    setMethod(m);
    persistMethod(m);
  }

  function handleLocationChange(loc: Parameters<typeof setManualLocation>[0]) {
    setManualLocation(loc);
    setEditingLocation(false);
    const detected = getMethodForCountry(loc.countryCode);
    setMethod(detected);
    persistMethod(detected);
  }

  const prevPhaseRef = useRef<Phase | null>(null);

  useEffect(() => {
    if (!data) {
      prevPhaseRef.current = null;
      setShowIftarMessage(false);
      return;
    }

    // Initialize phase from data — no iftar message on load/city switch
    const initialPhase = getPhase(data.todayFajrTime, data.maghribTime);
    setPhase(initialPhase);
    setShowIftarMessage(false);
    prevPhaseRef.current = initialPhase;

    // Poll every second for real-time phase transitions
    const id = setInterval(() => {
      const current = getPhase(data.todayFajrTime, data.maghribTime);
      if (current !== prevPhaseRef.current) {
        if (prevPhaseRef.current === "fasting" && current === "after-maghrib") {
          setShowIftarMessage(true);
          setTimeout(() => setShowIftarMessage(false), IFTAR_MESSAGE_DURATION);
        }
        setPhase(current);
        prevPhaseRef.current = current;
      }
    }, 1000);

    return () => clearInterval(id);
  }, [data]);

  const target =
    phase === "fasting"
      ? data?.maghribTime ?? null
      : phase === "before-fajr"
        ? data?.todayFajrTime ?? null
        : data?.tomorrowFajrTime ?? null;

  const countdown = useCountdown(target);

  const isFasting = phase === "fasting";
  const bgClass = isFasting
    ? "bg-amber-50 dark:bg-dark"
    : "bg-slate-50 dark:bg-[#0a0f1a]";

  const progress = (() => {
    if (!data) return null;
    const now = Date.now();
    let start: number, end: number;
    if (phase === "fasting") {
      start = data.todayFajrTime.getTime();
      end = data.maghribTime.getTime();
    } else if (phase === "after-maghrib") {
      start = data.maghribTime.getTime();
      end = data.tomorrowFajrTime.getTime();
    } else {
      return null;
    }
    return Math.min(1, Math.max(0, (now - start) / (end - start)));
  })();

  const label =
    phase === "fasting"
      ? "until Iftar"
      : phase === "before-fajr"
        ? "until Fajr / Suhoor ends"
        : "until Suhoor";

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 p-8 font-mono dark:bg-dark">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <p className="text-lg text-neutral-500">Detecting location...</p>
      </div>
    );
  }

  if (status === "denied" && !location) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 p-8 font-mono dark:bg-dark">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <LocationPicker onSelect={handleLocationChange} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 p-8 font-mono dark:bg-dark">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <p className="text-lg text-neutral-500">Loading prayer times...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 p-8 font-mono dark:bg-dark">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center p-8 font-mono transition-colors duration-700 ${bgClass}`}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <header className="mb-12 text-center">
        {editingLocation ? (
          <LocationPicker onSelect={handleLocationChange} onCancel={() => setEditingLocation(false)} />
        ) : (
          <button
            onClick={() => setEditingLocation(true)}
            className="group mb-1 inline-flex cursor-pointer items-center gap-1.5 border-b border-dashed border-neutral-300 text-base text-neutral-500 transition-colors hover:border-gold hover:text-gold dark:border-neutral-700"
          >
            {location?.label}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-70 transition-opacity group-hover:opacity-100"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        <p className="mt-1 text-sm text-neutral-500">
          {data.hijriDate} &middot; {data.gregorianDate}
        </p>
      </header>

      <main className="flex flex-1 items-center justify-center">
        {showIftarMessage ? (
          <IftarMessage />
        ) : (
          <Countdown
            hours={countdown.hours}
            minutes={countdown.minutes}
            seconds={countdown.seconds}
            label={label}
            progress={progress}
          />
        )}
      </main>

      <footer className="mt-12 text-center text-[0.95rem] text-neutral-500">
        <p>
          {isFasting ? (
            <>
              Maghrib: <span className="text-gold">{data.maghribDisplay}</span>
              &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              Fajr: <span className="text-gold">{data.fajrDisplay}</span>
            </>
          ) : (
            <>
              Fajr: <span className="text-gold">{data.fajrDisplay}</span>
              &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              Maghrib: <span className="text-gold">{data.maghribDisplay}</span>
            </>
          )}
        </p>
        <div className="mt-3">
          <MethodPicker value={method} onChange={handleMethodChange} />
        </div>
      </footer>
    </div>
  );
}

export default App;
