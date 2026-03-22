export function matchHealthConditions(
  datasetConditions: string[],
  userConditions: string[]
): string[] {
  const ds = datasetConditions.map((c) => c.trim().toLowerCase()).filter(Boolean);
  const us = new Set(userConditions.map((c) => c.trim().toLowerCase()).filter(Boolean));

  const out: string[] = [];
  for (const raw of datasetConditions) {
    const key = raw.trim().toLowerCase();
    if (key && us.has(key) && !out.includes(raw)) {
      out.push(raw);
    }
  }
  return out;
}

