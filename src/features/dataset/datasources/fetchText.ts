export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to fetch text: ${url} (${res.status})`);
  }
  return await res.text();
}

