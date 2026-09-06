/**
 * Thin client for the existing HARVIS FastAPI backend.
 * Base URL is configurable via VITE_API_BASE_URL (defaults to 127.0.0.1:8000).
 */

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export type Branch = { id: number; name: string; code?: string | undefined };
export type Section = { id: number; name: string };

export type SessionContext = {
  year: number;
  branch_id: number;
  section_id: number;
};

export type QueryResponse = {
  intent: string;
  answer: string;
};

export class HarvisApiError extends Error {
  kind: "network" | "server";
  constructor(kind: "network" | "server", message: string) {
    super(message);
    this.kind = kind;
    this.name = "HarvisApiError";
  }
}

async function getJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new HarvisApiError("network", "HARVIS cannot reach the campus AI service.");
  }
  if (!response.ok) {
    throw new HarvisApiError("server", "HARVIS encountered a temporary system error.");
  }
  return (await response.json()) as T;
}

/** Normalises whatever shape the backend returns into { id, name }. */
function normalizeList(
  raw: unknown,
): Array<{ id: number; name: string; code?: string | undefined }> {
  const response = raw as {
    value?: unknown[];
    items?: unknown[];
  };

  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(response?.value)
      ? response.value
      : Array.isArray(response?.items)
        ? response.items
        : [];

  return items.map((item, index) => {
    const record = item as Record<string, unknown>;

    const id = Number(
    record["id"] ??
    record["section_id"] ??
    record["branch_id"] ??
    index,
    );

    const name = String(
      record["name"] ??
        record["branch_name"] ??
        record["section_name"] ??
        record["code"] ??
        id,
    );

    const code =
      record["code"] === undefined
        ? undefined
        : String(record["code"]);

    return { id, name, code };
  });
}

export async function fetchBranches(): Promise<Branch[]> {
  return normalizeList(await getJson<unknown>("/branches"));
}

export async function fetchSections(branchId: number): Promise<Section[]> {
  return normalizeList(await getJson<unknown>(`/branches/${branchId}/sections`));
}

export async function postQuery(
  sessionContext: SessionContext,
  text: string,
): Promise<QueryResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ session_context: sessionContext, text }),
    });
  } catch {
    throw new HarvisApiError("network", "HARVIS cannot reach the campus AI service.");
  }
  if (!response.ok) {
    throw new HarvisApiError("server", "HARVIS encountered a temporary system error.");
  }
  return (await response.json()) as QueryResponse;
}
