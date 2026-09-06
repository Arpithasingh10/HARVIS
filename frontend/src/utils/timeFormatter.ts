/**
 * Time formatting utilities.
 *
 * The backend keeps 24-hour "HH:MM" values. Students should only ever see
 * 12-hour times ("2:30 PM"), so every backend string is passed through here
 * before it reaches the screen (or the speech synthesiser).
 */

const TIME_PATTERN = /\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b(?!\s*(?:AM|PM)\b)/gi;

/** Convert a single "HH:MM" (or "HH:MM:SS") value to "h:MM AM/PM". */
export function formatTime24to12(value: string): string {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(value.trim());
  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hour12}:${minutes} ${suffix}`;
}

/**
 * Rewrite every 24-hour time found inside a free-form sentence.
 * Backend answers are prose, e.g. "You have Major Project at 14:00 in Room 304".
 */
export function formatTimesInText(text: string): string {
  if (!text) return text;
  return text.replace(TIME_PATTERN, (whole) => formatTime24to12(whole));
}

/** Current wall-clock time, 12-hour, for status/timestamp chips. */
export function nowLabel(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
