import type { FoodDatasetRecordRaw } from "../types/dataset";
import { parseCsv } from "../utils/parseCsv";

export const FOODS_CSV_PATH = "/data/foods_dataset_150.csv";

// Import CSV text directly via Vite. This avoids needing `/public/data/*`.
import foodsDatasetCsvText from "../../../../foods_dataset_150.csv?raw";

export async function loadFoodsCsv(): Promise<FoodDatasetRecordRaw[]> {
  const rows = parseCsv<Record<string, unknown>>(foodsDatasetCsvText);

  return rows.map((r) => {
    return {
      food_id: Number(r.food_id),
      food_name: String(r.food_name ?? ""),
      category: String(r.category ?? ""),
      processing_level: String(r.processing_level ?? ""),
      total_ingredients: Number(r.total_ingredients),

      healthy_ingredients_count: Number(r.healthy_ingredients_count),
      neutral_ingredients_count: Number(r.neutral_ingredients_count),
      unhealthy_ingredients_count: Number(r.unhealthy_ingredients_count),

      healthy_percentage: Number(r.healthy_percentage),
      neutral_percentage: Number(r.neutral_percentage),
      unhealthy_percentage: Number(r.unhealthy_percentage),

      affected_health_conditions: String(r.affected_health_conditions ?? ""),
      overall_recommendation: r.overall_recommendation as FoodDatasetRecordRaw["overall_recommendation"],
      description: String(r.description ?? ""),
    };
  });
}

