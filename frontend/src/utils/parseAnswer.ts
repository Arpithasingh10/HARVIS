/**
 * Best-effort presentation parser.
 *
 * The backend answer stays exactly as-is (prose).
 * This only extracts fields so the UI can render a
 * structured timetable card.
 */

import { formatTimesInText } from "./timeFormatter";

export type StructuredAnswer = {
  subject?: string;
  timeRange?: string;
  room?: string;
  faculty?: string;
};

export function parseAnswer(raw: string): StructuredAnswer | null {
  if (!raw) return null;

  const text = formatTimesInText(raw);

  const subject =
    /you have\s+(.+?)\s+(?:from|at|in|with|on)\b/i
      .exec(text)?.[1]
      ?.trim();

  const from =
    /\bfrom\s+([0-9:]+\s*(?:AM|PM))\s*(?:to|-|—|–|until)\s*([0-9:]+\s*(?:AM|PM))/i
      .exec(text);

  const single =
    /\bat\s+([0-9:]+\s*(?:AM|PM))/i.exec(text);

  const timeRange = from
    ? `${from[1]} — ${from[2]}`
    : single
      ? single[1]
      : undefined;

  const room =
    /\b(?:in|at)\s+(room\s+[\w-]+|lab\s+[\w-]+)/i
      .exec(text)?.[1]
      ?.trim();

  /*
   * Faculty appears after "with" and before the day in
   * the backend's standard timetable response:
   *
   * "... with Dr. Suresh Babu (Monday)."
   *
   * We deliberately allow periods inside names/titles.
   */
  const faculty =
    /\bwith\s+(.+?)(?=\s*\([A-Za-z]+\)\s*\.?$)/i
      .exec(text)?.[1]
      ?.trim();

  const result: StructuredAnswer = {};

  if (subject) result.subject = subject;
  if (timeRange) result.timeRange = timeRange;
  if (room) result.room = room;
  if (faculty) result.faculty = faculty;

  // A structured timetable card needs a subject plus at least one detail.
  if (!result.subject || Object.keys(result).length < 2) {
    return null;
  }

  return result;
}