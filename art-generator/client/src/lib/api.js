export async function generateImages({ prompt, model, size, count }) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model, size, n: count }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data.images || [];
}

export async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) return { ok: false, configured: false };
    return await response.json();
  } catch {
    return { ok: false, configured: false };
  }
}
