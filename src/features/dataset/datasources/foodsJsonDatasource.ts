import type { FoodDatasetRecordRaw } from "../types/dataset";

export const FOODS_JSON_PATH = "/data/foods_dataset_150.json";

// Vite can bundle local JSON imports; this makes the app work without
// copying dataset files into `public/`.
// Path is relative to this file:
// src/features/dataset/datasources/ -> project root
import foodsDatasetJson from "../../../../foods_dataset_150.json";

export async function loadFoodsJson(): Promise<FoodDatasetRecordRaw[]> {
  // Keep async signature for repository abstraction.
  return foodsDatasetJson as FoodDatasetRecordRaw[];
}

