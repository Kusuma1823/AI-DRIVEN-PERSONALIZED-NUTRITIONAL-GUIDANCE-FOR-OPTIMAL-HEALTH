import type { FoodDatasetRecord, FoodIngredientRecord } from "../types/dataset";
import { FoodRepository, type FoodSearchSuggestion } from "../repository/FoodRepository";

export interface FoodSelectionResult {
  food: FoodDatasetRecord;
  ingredients: FoodIngredientRecord[];
}

export class FoodSearchService {
  constructor(private repo: FoodRepository) {}

  async getSuggestions(query: string, limit = 6): Promise<FoodSearchSuggestion[]> {
    return this.repo.searchFoodSuggestions(query, limit);
  }

  async getFoodByIdSelection(foodId: number): Promise<FoodSelectionResult | null> {
    const food = await this.repo.getFoodById(foodId);
    if (!food) return null;
    const ingredients = await this.repo.getIngredientsForFood(foodId);
    return { food, ingredients };
  }

  async getFoodByNameSelection(foodName: string): Promise<FoodSelectionResult | null> {
    // Name matching is best-effort since the dataset has a finite set of names.
    const q = foodName.trim().toLowerCase();
    if (!q) return null;

    const foods = await this.repo.loadAllFoods();
    const exact = foods.find((f) => f.foodName.toLowerCase() === q);
    const chosen = exact ?? foods.find((f) => f.foodName.toLowerCase().includes(q));
    if (!chosen) return null;

    const ingredients = await this.repo.getIngredientsForFood(chosen.foodId);
    return { food: chosen, ingredients };
  }
}

