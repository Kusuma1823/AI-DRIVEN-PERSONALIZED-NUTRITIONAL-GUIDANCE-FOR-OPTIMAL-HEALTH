import type {
  DatasetOverallRecommendation,
  FoodDatasetRecord,
  FoodDatasetRecordRaw,
} from "../types/dataset";
import { parseConditions } from "./parseConditions";

export function normalizeFood(raw: FoodDatasetRecordRaw): FoodDatasetRecord {
  return {
    foodId: raw.food_id,
    foodName: raw.food_name,
    category: raw.category,
    processingLevel: raw.processing_level,

    totalIngredients: raw.total_ingredients,
    healthyIngredientsCount: raw.healthy_ingredients_count,
    neutralIngredientsCount: raw.neutral_ingredients_count,
    unhealthyIngredientsCount: raw.unhealthy_ingredients_count,

    healthyPercentage: raw.healthy_percentage,
    neutralPercentage: raw.neutral_percentage,
    unhealthyPercentage: raw.unhealthy_percentage,

    affectedHealthConditions: parseConditions(raw.affected_health_conditions),
    datasetOverallRecommendation: raw.overall_recommendation as DatasetOverallRecommendation,
    description: raw.description,
  };
}

