import type { FoodDatasetRecord } from "../../dataset/types/dataset";

export function selectBetterAlternatives(params: {
  currentFood: FoodDatasetRecord;
  categoryFoods: FoodDatasetRecord[];
  limit?: number;
}): FoodDatasetRecord[] {
  const { currentFood, categoryFoods, limit = 4 } = params;

  const filtered = categoryFoods.filter((f) => f.foodId !== currentFood.foodId);

  // Prefer lower unhealthy percentage, then fewer unhealthy ingredients, then healthier overall.
  filtered.sort((a, b) => {
    if (a.unhealthyPercentage !== b.unhealthyPercentage) {
      return a.unhealthyPercentage - b.unhealthyPercentage;
    }
    if (a.unhealthyIngredientsCount !== b.unhealthyIngredientsCount) {
      return a.unhealthyIngredientsCount - b.unhealthyIngredientsCount;
    }
    return b.healthyPercentage - a.healthyPercentage;
  });

  // Keep it stable by slicing.
  return filtered.slice(0, limit);
}

