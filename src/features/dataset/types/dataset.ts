export type IngredientType = "Healthy" | "Neutral" | "Unhealthy";
export type DatasetOverallRecommendation = "Caution" | "Avoid";

// Raw dataset shapes (match your JSON/CSV column names).
export interface FoodDatasetRecordRaw {
  food_id: number;
  food_name: string;
  category: string;
  processing_level: string;
  total_ingredients: number;

  healthy_ingredients_count: number;
  neutral_ingredients_count: number;
  unhealthy_ingredients_count: number;

  healthy_percentage: number;
  neutral_percentage: number;
  unhealthy_percentage: number;

  // In your dataset this is a single comma-separated string.
  affected_health_conditions: string;
  overall_recommendation: DatasetOverallRecommendation;
  description: string;
}

export interface FoodIngredientRecordRaw {
  food_id: number;
  food_name: string;
  category: string;

  ingredient_order: number;
  ingredient_name: string;

  ingredient_type: IngredientType;
  reason_if_unhealthy: string;
  health_concern_tag: string;
  ingredient_note: string;
}

// Normalized app-level shapes (what the rest of the app consumes).
export interface FoodDatasetRecord {
  foodId: number;
  foodName: string;
  category: string;
  processingLevel: string;

  totalIngredients: number;
  healthyIngredientsCount: number;
  neutralIngredientsCount: number;
  unhealthyIngredientsCount: number;

  healthyPercentage: number;
  neutralPercentage: number;
  unhealthyPercentage: number;

  affectedHealthConditions: string[];
  datasetOverallRecommendation: DatasetOverallRecommendation;
  description: string;
}

export interface FoodIngredientRecord {
  foodId: number;
  foodName: string;
  category: string;

  ingredientOrder: number;
  ingredientName: string;

  ingredientType: IngredientType;
  reasonIfUnhealthy: string;
  healthConcernTag: string;
  ingredientNote: string;
}

