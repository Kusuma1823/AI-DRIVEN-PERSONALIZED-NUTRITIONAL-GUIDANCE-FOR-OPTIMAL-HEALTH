import { dbClient } from "../../lib/database/dbClient";

export type SavedFood = {
  id: string;
  foodId: string;
  foodName: string;
  category: string;
  unhealthyPercentage: number;
  savedAt: number;
  userId: string;
};

export async function getSavedFoods(userId: string): Promise<SavedFood[]> {
  try {
    const foods = await dbClient.savedFoods.getAll(userId);
    return foods || [];
  } catch {
    return [];
  }
}

export async function saveFood(userId: string, food: { foodId: string; foodName: string; category: string; unhealthyPercentage: number }): Promise<void> {
  try {
    await dbClient.savedFoods.save(userId, food);
  } catch (e) {
    console.error("Error saving food:", e);
  }
}

export async function removeSavedFood(userId: string, savedFoodId: string): Promise<void> {
  try {
    await dbClient.savedFoods.remove(savedFoodId);
  } catch (e) {
    console.error("Error removing saved food:", e);
  }
}

export async function isFoodSaved(userId: string, foodId: string): Promise<boolean> {
  try {
    const foods = await getSavedFoods(userId);
    return foods.some(f => f.foodId === foodId);
  } catch {
    return false;
  }
}
