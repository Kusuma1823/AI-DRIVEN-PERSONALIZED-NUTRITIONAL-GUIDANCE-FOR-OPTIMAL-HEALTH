export async function fetchJsonArray<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to fetch JSON: ${url} (${res.status})`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error(`Invalid JSON shape (expected array): ${url}`);
  }
  return data as T[];
}

