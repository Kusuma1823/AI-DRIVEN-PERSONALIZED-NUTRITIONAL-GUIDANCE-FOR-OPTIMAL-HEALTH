/**
 * Hook for calling the Food Recommendation API
 * Provides functions to fetch recommendations, analyze foods, etc.
 */

import { useCallback, useState } from 'react';

const API_URL = 'http://localhost:5000/api';

export function useFoodAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze a food completely
  const analyzeFoodComplete = useCallback(async (foodName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/analyze/food/${foodName}`);
      if (!response.ok) throw new Error('Food not found');
      const data = await response.json();
      return data;
    } catch (err: any) {
      const message = err.message || 'Failed to analyze food';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get similar foods
  const getSimilarFoods = useCallback(async (foodName: string, topK: number = 5) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/recommend/similar/${foodName}?top_k=${topK}`);
      if (!response.ok) throw new Error('Food not found');
      const data = await response.json();
      return data.recommendations || [];
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Classify food health
  const classifyFood = useCallback(async (nutritionData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/health/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nutritionData)
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to classify food');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate unhealthy score
  const calculateUnhealthyScore = useCallback(async (nutritionData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/score/unhealthy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nutritionData)
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to calculate score');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze ingredients
  const analyzeIngredients = useCallback(async (ingredientText: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/ingredients/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientText })
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to analyze ingredients');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Predict health risks
  const predictHealthRisks = useCallback(async (nutritionData: any, userConditions?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/risks/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nutritionData,
          user_health_conditions: userConditions
        })
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to predict risks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze sentiment
  const analyzeSentiment = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/sentiment/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to analyze sentiment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // List foods
  const listFoods = useCallback(async (page: number = 1, perPage: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/foods/list?page=${page}&per_page=${perPage}`);
      const data = await response.json();
      return data.foods || [];
    } catch (err: any) {
      setError(err.message || 'Failed to list foods');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search foods
  const searchFoods = useCallback(async (query: string, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/foods/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const data = await response.json();
      return data.foods || [];
    } catch (err: any) {
      setError(err.message || 'Failed to search foods');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    analyzeFoodComplete,
    getSimilarFoods,
    classifyFood,
    calculateUnhealthyScore,
    analyzeIngredients,
    predictHealthRisks,
    analyzeSentiment,
    listFoods,
    searchFoods
  };
}
