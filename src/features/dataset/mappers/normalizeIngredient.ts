import type { FoodIngredientRecord, FoodIngredientRecordRaw, IngredientType } from "../types/dataset";
import { isBlank } from "../../../lib/utils/isBlank";

export function normalizeIngredient(raw: FoodIngredientRecordRaw): FoodIngredientRecord {
  // Dataset strings are expected to be exactly: "Healthy" | "Neutral" | "Unhealthy".
  const ingredientType = raw.ingredient_type as IngredientType;

  return {
    foodId: raw.food_id,
    foodName: raw.food_name,
    category: raw.category,

    ingredientOrder: raw.ingredient_order,
    ingredientName: raw.ingredient_name,

    ingredientType,
    reasonIfUnhealthy: isBlank(raw.reason_if_unhealthy) ? "" : raw.reason_if_unhealthy,
    healthConcernTag: isBlank(raw.health_concern_tag) ? "" : raw.health_concern_tag,
    ingredientNote: isBlank(raw.ingredient_note) ? "" : raw.ingredient_note,
  };
}

