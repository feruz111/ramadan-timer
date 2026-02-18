/**
 * Parse a time string like "17:21" into an absolute Date,
 * interpreting it in the given IANA timezone (e.g. "America/Toronto").
 */
export function parseTimeToDate(
  timeStr: string,
  year: number,
  month: number,
  day: number,
  timezone: string
): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Build a naive UTC date with the same calendar values
  const naiveUtc = Date.UTC(year, month, day, hours, minutes, 0);

  // Find the UTC offset of the target timezone at roughly this instant.
  // Comparing toLocaleString in UTC vs target timezone gives us the offset.
  const probe = new Date(naiveUtc);
  const utcParts = dateParts(probe, "UTC");
  const tzParts = dateParts(probe, timezone);
  const offsetMs =
    new Date(tzParts.year, tzParts.month - 1, tzParts.day, tzParts.hour, tzParts.minute).getTime() -
    new Date(utcParts.year, utcParts.month - 1, utcParts.day, utcParts.hour, utcParts.minute).getTime();

  // The real UTC instant = naive - offset
  // e.g. 17:35 in UTC-5 → naive 17:35Z, offset = -5h → 17:35 - (-5h) = 22:35Z ✓
  return new Date(naiveUtc - offsetMs);
}

/** Extract numeric date parts in a given timezone. */
function dateParts(date: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(
    f.formatToParts(date).map((x) => [x.type, x.value])
  );
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour === "24" ? "0" : p.hour),
    minute: Number(p.minute),
  };
}

/**
 * Format a date as DD-MM-YYYY for the Aladhan API.
 */
export function formatDateForApi(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Pad a number to 2 digits.
 */
export function padTwo(n: number): string {
  return String(n).padStart(2, "0");
}
