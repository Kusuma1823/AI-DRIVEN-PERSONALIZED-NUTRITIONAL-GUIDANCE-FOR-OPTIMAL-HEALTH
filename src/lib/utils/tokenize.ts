// Tokenize free-text (like allergies) into matching-friendly lowercase tokens.
// Keeps only basic alphanumerics to avoid false negatives from punctuation.
export function tokenize(input: string): string[] {
  const raw = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean);

  // De-duplicate while preserving order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

