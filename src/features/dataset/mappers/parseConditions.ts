import { isBlank } from "../../../lib/utils/isBlank";

export function parseConditions(input: string): string[] {
  if (isBlank(input)) return [];

  // Dataset stores conditions as a comma-separated string.
  // Example: "High Blood Pressure (Hypertension), Heart Disease, Kidney Disease"
  return input
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

