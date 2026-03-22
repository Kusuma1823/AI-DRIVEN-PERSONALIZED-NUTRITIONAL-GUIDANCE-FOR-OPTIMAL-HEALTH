import type { FoodRepository } from "../../dataset/repository/FoodRepository";
import type { FoodDatasetRecord, FoodIngredientRecord } from "../../dataset/types/dataset";
import type { FoodAnalysisResult, UserProfileInput } from "../types/recommendation";
import { computePersonalizedAnalysis } from "../engine/riskScorer";
import { selectBetterAlternatives } from "../alternatives/betterAlternatives";

export class RecommendationFacade {
  constructor(private repo: FoodRepository) {}

  async analyzeFood(params: {
    foodId: number;
    user: UserProfileInput;
    alternativesLimit?: number;
  }): Promise<FoodAnalysisResult | null> {
    const { foodId, user, alternativesLimit } = params;

    const food: FoodDatasetRecord | null = await this.repo.getFoodById(foodId);
    if (!food) return null;

    const ingredients: FoodIngredientRecord[] = await this.repo.getIngredientsForFood(foodId);

    const analysis = computePersonalizedAnalysis({
      food,
      ingredients,
      user,
    });

    const categoryFoods = await this.repo.getFoodsByCategory(food.category);
    const betterAlternatives = selectBetterAlternatives({
      currentFood: food,
      categoryFoods,
      limit: alternativesLimit ?? 4,
    });

    return {
      ...analysis,
      betterAlternatives,
    };
  }
}

