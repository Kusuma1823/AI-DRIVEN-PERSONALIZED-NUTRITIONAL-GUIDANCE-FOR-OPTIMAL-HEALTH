import type { PersonalizedRecommendationAnalysis, RiskStatus } from "../types/recommendation";
import type { UserProfileInput } from "../types/recommendation";
import type { FoodDatasetRecord, FoodIngredientRecord } from "../../dataset/types/dataset";
import { matchAllergiesToIngredients } from "./matchAllergies";
import { matchHealthConditions } from "./matchHealthConditions";

export function mapRiskScoreToStatus(score: number): RiskStatus {
  if (score < 30) return "Safe";
  if (score < 60) return "Caution";
  return "Avoid";
}

export function computePersonalizedAnalysis(params: {
  food: FoodDatasetRecord;
  ingredients: FoodIngredientRecord[];
  user: UserProfileInput;
}): Omit<PersonalizedRecommendationAnalysis, "ingredientLevelFlags" | "allergyMatches"> & {
  allergyMatches: Array<{ token: string }>;
  ingredientLevelFlags: PersonalizedRecommendationAnalysis["ingredientLevelFlags"];
} {
  const { food, ingredients, user } = params;

  const matchedHealth = matchHealthConditions(food.affectedHealthConditions, user.selectedHealthConditions);
  const allergyMatches = matchAllergiesToIngredients(user.allergies, ingredients);
  const allergyTokens = Array.from(new Set(allergyMatches.map((m) => m.token)));

  // Rule-based scoring (0-100-ish).
  // Note: we only use the dataset fields that exist in your prototype.
  let score = 0;
  score += food.unhealthyPercentage * 0.8; // unhealthy percentage is the primary signal
  score += (food.unhealthyIngredientsCount / Math.max(1, food.totalIngredients)) * 20; // redundant but reinforces
  score += matchedHealth.length * 15; // each condition overlap increases risk
  score += allergyTokens.length * 18; // each allergy token match increases risk

  // BMI is user-provided (not in dataset). Use it as an additional personalization factor.
  // This keeps the app "health-tech" without assuming any missing nutrition fields.
  const bmi = user.bmi;
  if (bmi > 0) {
    if (bmi >= 30) {
      score += 18;
    } else if (bmi >= 25) {
      score += 10;
    }
  }

  // Dataset-provided overall recommendation is treated as a weak prior.
  score += food.datasetOverallRecommendation === "Avoid" ? 5 : 2;

  // Clamp to [0, 100]
  score = Math.max(0, Math.min(100, score));
  const status = mapRiskScoreToStatus(score);

  const reasons: string[] = [];
  reasons.push(`Unhealthy ingredients account for ${food.unhealthyPercentage.toFixed(1)}% of this item.`);
  if (food.unhealthyIngredientsCount > 0) {
    reasons.push(`${food.unhealthyIngredientsCount} ingredient(s) are flagged as unhealthy in the dataset.`);
  }
  if (matchedHealth.length > 0) {
    reasons.push(`Matches your selected health condition(s): ${matchedHealth.join(", ")}.`);
  }
  if (allergyTokens.length > 0) {
    reasons.push(`Allergy-related matches found in ingredients (token(s): ${allergyTokens.join(", ")}).`);
  }
  if (bmi > 0) {
    if (bmi >= 30) {
      reasons.push(`Your BMI is in an obesity range; risk score increased accordingly.`);
    } else if (bmi >= 25) {
      reasons.push(`Your BMI is in an overweight range; risk score increased accordingly.`);
    }
  }
  if (reasons.length === 0) reasons.push("No specific risk signals matched. Please review ingredients for suitability.");

  // Ingredient-level flags for the UI.
  const ingredientLevelFlags = ingredients.map((ing) => {
    const match = allergyMatches.find((m) => m.ingredientName === ing.ingredientName);
    return {
      ingredientOrder: ing.ingredientOrder,
      ingredientName: ing.ingredientName,
      ingredientType: ing.ingredientType,
      healthConcernTag: ing.healthConcernTag || undefined,
      reasonIfUnhealthy: ing.reasonIfUnhealthy || undefined,
      matchedAllergyToken: match?.token,
    };
  });

  const analysis: PersonalizedRecommendationAnalysis = {
    food,
    ingredients,
    score,
    status,
    matchedHealthConditions: matchedHealth,
    allergyMatches: allergyMatches.map((m) => ({ token: m.token })),
    reasons,
    datasetOverallRecommendation: food.datasetOverallRecommendation,
    unhealthyPercentage: food.unhealthyPercentage,
    ingredientLevelFlags,
  };

  return analysis;
}

