import type { FoodIngredientRecord } from "../../dataset/types/dataset";

export interface AllergyMatch {
  token: string;
  ingredientName?: string;
}

export function matchAllergiesToIngredients(
  allergies: string[],
  ingredients: FoodIngredientRecord[]
): AllergyMatch[] {
  const tokens = allergies
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 3);

  if (tokens.length === 0) return [];

  const matches: AllergyMatch[] = [];
  const seen = new Set<string>();

  for (const ing of ingredients) {
    const name = ing.ingredientName.toLowerCase();
    const note = (ing.ingredientNote ?? "").toLowerCase();
    const reason = (ing.reasonIfUnhealthy ?? "").toLowerCase();

    for (const token of tokens) {
      const hit = name.includes(token) || note.includes(token) || reason.includes(token);
      if (hit) {
        const key = `${token}|${ing.ingredientName}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({ token, ingredientName: ing.ingredientName });
        }
      }
    }
  }

  return matches;
}

