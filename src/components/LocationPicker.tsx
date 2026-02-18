import { useState, useEffect, useRef } from "react";
import type { Location } from "../types";

interface Props {
  onSelect: (location: Location) => void;
  onCancel?: () => void;
}

interface GeoResult {
  name: string;
  country: string;
  country_code: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export function LocationPicker({ onSelect, onCancel }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${GEOCODE_URL}?name=${encodeURIComponent(trimmed)}&count=6&language=en`
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  function pick(r: GeoResult) {
    onSelect({
      latitude: r.latitude,
      longitude: r.longitude,
      label: [r.name, r.country].filter(Boolean).join(", "),
      countryCode: r.country_code?.toUpperCase(),
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onCancel?.();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) pick(results[activeIndex]);
    }
  }

  function formatLabel(r: GeoResult) {
    return [r.name, r.admin1, r.country].filter(Boolean).join(", ");
  }

  return (
    <div className="w-full max-w-sm p-4 text-center">
      <div className="mb-4 flex items-center justify-center gap-3">
        <h2 className="text-xl font-medium text-gold">Enter Your City</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Istanbul, Dubai, Cairo"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-base text-white outline-none placeholder:text-neutral-600 transition-colors focus:border-gold"
          autoFocus
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            ...
          </span>
        )}
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 text-left">
            {results.map((r, i) => (
              <li key={`${r.latitude}-${r.longitude}`}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className={`block w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors ${
                    i === activeIndex
                      ? "bg-neutral-800 text-gold"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {formatLabel(r)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
