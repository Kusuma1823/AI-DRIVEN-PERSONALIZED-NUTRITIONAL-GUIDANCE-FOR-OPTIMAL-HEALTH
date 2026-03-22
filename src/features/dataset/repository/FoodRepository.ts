import type {
  FoodDatasetRecord,
  FoodDatasetRecordRaw,
  FoodIngredientRecord,
  FoodIngredientRecordRaw,
} from "../types/dataset";
import { normalizeFood } from "../mappers/normalizeFood";
import { normalizeIngredient } from "../mappers/normalizeIngredient";
import { loadFoodsCsv } from "../datasources/foodsCsvDatasource";
import { loadFoodsJson } from "../datasources/foodsJsonDatasource";
import { loadIngredientsCsv } from "../datasources/ingredientsCsvDatasource";
import { loadIngredientsJson } from "../datasources/ingredientsJsonDatasource";

export type DatasetSourceMode = "json" | "csv";

export interface FoodRepositoryConfig {
  mode: DatasetSourceMode;
}

export interface FoodSearchSuggestion {
  foodId: number;
  foodName: string;
  category: string;
}

export class FoodRepository {
  private config: FoodRepositoryConfig;

  private foods: FoodDatasetRecord[] | null = null;
  private ingredientsByFoodId: Map<number, FoodIngredientRecord[]> | null = null;
  private foodById: Map<number, FoodDatasetRecord> | null = null;

  constructor(config: FoodRepositoryConfig) {
    this.config = config;
  }

  async ensureLoaded(): Promise<void> {
    if (this.foods && this.ingredientsByFoodId && this.foodById) return;

    const [foodsRaw, ingredientsRaw] = await Promise.all([
      this.config.mode === "json" ? loadFoodsJson() : loadFoodsCsv(),
      this.config.mode === "json" ? loadIngredientsJson() : loadIngredientsCsv(),
    ]);

    const normalizedFoods = foodsRaw.map((r) => normalizeFood(r as FoodDatasetRecordRaw));
    const normalizedIngredients = ingredientsRaw.map((r) => normalizeIngredient(r as FoodIngredientRecordRaw));

    const ingMap = new Map<number, FoodIngredientRecord[]>();
    for (const ing of normalizedIngredients) {
      const list = ingMap.get(ing.foodId) ?? [];
      list.push(ing);
      ingMap.set(ing.foodId, list);
    }

    // Guarantee ingredient ordering within each food.
    for (const [foodId, list] of ingMap.entries()) {
      list.sort((a, b) => a.ingredientOrder - b.ingredientOrder);
      ingMap.set(foodId, list);
    }

    const foodMap = new Map<number, FoodDatasetRecord>();
    for (const food of normalizedFoods) {
      foodMap.set(food.foodId, food);
    }

    this.foods = normalizedFoods;
    this.ingredientsByFoodId = ingMap;
    this.foodById = foodMap;
  }

  async loadAllFoods(): Promise<FoodDatasetRecord[]> {
    await this.ensureLoaded();
    return this.foods ? [...this.foods] : [];
  }

  async getFoodById(foodId: number): Promise<FoodDatasetRecord | null> {
    await this.ensureLoaded();
    return this.foodById?.get(foodId) ?? null;
  }

  async getIngredientsForFood(foodId: number): Promise<FoodIngredientRecord[]> {
    await this.ensureLoaded();
    return this.ingredientsByFoodId?.get(foodId) ? [...(this.ingredientsByFoodId?.get(foodId) ?? [])] : [];
  }

  async getFoodsByCategory(category: string): Promise<FoodDatasetRecord[]> {
    await this.ensureLoaded();
    const target = category.trim().toLowerCase();
    return (this.foods ?? []).filter((f) => f.category.toLowerCase() === target);
  }

  async searchFoodSuggestions(query: string, limit = 6): Promise<FoodSearchSuggestion[]> {
    await this.ensureLoaded();
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const foods = this.foods ?? [];
    const scored = foods
      .map((f) => {
        // Simple ranking: prefix match wins, otherwise substring.
        const name = f.foodName.toLowerCase();
        const category = f.category.toLowerCase();
        const prefix = name.startsWith(q) ? 100 : 0;
        const substring = name.includes(q) ? 50 : 0;
        const catBoost = category.includes(q) ? 10 : 0;
        return { f, score: prefix + substring + catBoost };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map((x) => ({
      foodId: x.f.foodId,
      foodName: x.f.foodName,
      category: x.f.category,
    }));
  }
}

