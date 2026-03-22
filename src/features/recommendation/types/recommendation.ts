import type { DatasetOverallRecommendation, FoodDatasetRecord, FoodIngredientRecord } from "../../dataset/types/dataset";

export type RiskStatus = "Safe" | "Caution" | "Avoid";

export interface UserProfileInput {
  age: number;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  heightCm: number;
  weightKg: number;

  bmi: number;

  allergies: string[]; // tokenized or raw tokens from UI
  selectedHealthConditions: string[]; // strings matching dataset condition labels (case-insensitive)
}

export interface IngredientRiskFlag {
  ingredientOrder: number;
  ingredientName: string;
  ingredientType: FoodIngredientRecord["ingredientType"];
  healthConcernTag?: string;
  reasonIfUnhealthy?: string;
  matchedAllergyToken?: string;
}

export interface PersonalizedHealthWarning {
  matchedHealthConditions: string[];
  matchedAllergyTokens: string[];
  message: string;
}

export interface PersonalizedRecommendationAnalysis {
  food: FoodDatasetRecord;
  ingredients: FoodIngredientRecord[];

  score: number; // 0-100-ish
  status: RiskStatus;

  // For UI explanations
  matchedHealthConditions: string[];
  allergyMatches: Array<{ token: string }>;
  reasons: string[];
  datasetOverallRecommendation: DatasetOverallRecommendation;

  unhealthyPercentage: number;
  ingredientLevelFlags: IngredientRiskFlag[];
}

export interface FoodAnalysisResult extends PersonalizedRecommendationAnalysis {
  betterAlternatives: FoodDatasetRecord[];
}

export interface AnalysisDisplayOptions {
  overview: boolean;
  riskBreakdown: boolean;
  ingredientAnalysis: boolean;
  personalizedWarning: boolean;
  betterAlternatives: boolean;
}

