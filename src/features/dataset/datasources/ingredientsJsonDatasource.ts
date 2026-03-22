import type { FoodIngredientRecordRaw } from "../types/dataset";

export const INGREDIENTS_JSON_PATH = "/data/food_ingredients_dataset_150.json";

import ingredientsDatasetJson from "../../../../food_ingredients_dataset_150.json";

export async function loadIngredientsJson(): Promise<FoodIngredientRecordRaw[]> {
  return ingredientsDatasetJson as FoodIngredientRecordRaw[];
}

