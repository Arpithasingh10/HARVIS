const API_BASE = "http://localhost:8000";

export class ApiError extends Error {}

async function handleResponse(res) {
  if (!res.ok) {
    throw new ApiError(`Backend responded with status ${res.status}`);
  }
  return res.json();
}

export async function fetchBranches() {
  const res = await fetch(`${API_BASE}/branches`);
  return handleResponse(res);
}

export async function fetchSections(branchId) {
  const res = await fetch(`${API_BASE}/branches/${branchId}/sections`);
  return handleResponse(res);
}

export async function postQuery(sessionContext, text) {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_context: sessionContext,
      text,
    }),
  });

  return handleResponse(res);
}

