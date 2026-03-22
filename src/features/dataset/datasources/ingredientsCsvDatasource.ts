import type { FoodIngredientRecordRaw, IngredientType } from "../types/dataset";
import { parseCsv } from "../utils/parseCsv";

export const INGREDIENTS_CSV_PATH = "/data/food_ingredients_dataset_150.csv";

import ingredientsDatasetCsvText from "../../../../food_ingredients_dataset_150.csv?raw";

export async function loadIngredientsCsv(): Promise<FoodIngredientRecordRaw[]> {
  const rows = parseCsv<Record<string, unknown>>(ingredientsDatasetCsvText);

  return rows.map((r) => {
    return {
      food_id: Number(r.food_id),
      food_name: String(r.food_name ?? ""),
      category: String(r.category ?? ""),

      ingredient_order: Number(r.ingredient_order),
      ingredient_name: String(r.ingredient_name ?? ""),

      ingredient_type: (String(r.ingredient_type ?? "") as IngredientType) || "Neutral",
      reason_if_unhealthy: String(r.reason_if_unhealthy ?? ""),
      health_concern_tag: String(r.health_concern_tag ?? ""),
      ingredient_note: String(r.ingredient_note ?? ""),
    };
  });
}

