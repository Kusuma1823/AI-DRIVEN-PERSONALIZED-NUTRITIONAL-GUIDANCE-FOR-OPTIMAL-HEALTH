"""
Content-Based Food Recommendation Module
Uses cosine similarity to recommend similar food items based on nutrition profile
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import pandas as pd
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)


class FoodRecommender:
    """
    Content-Based Food Recommendation System
    
    Algorithm: Cosine Similarity
    - Calculates similarity between foods based on nutritional info
    - Returns top K most similar foods to the selected food
    - Features: calories, sugar, fat, sodium, protein, fiber, category
    """
    
    def __init__(self, df, feature_cols=None):
        """
        Initialize the recommender
        Args:
            df: DataFrame with food data
            feature_cols: List of columns to use for similarity calculation
        """
        self.df = df.copy()
        
        # Default features for recommendation
        if feature_cols is None:
            self.feature_cols = [
                'calories', 'sugar', 'sodium', 'fat', 'protein', 'fiber'
            ]
        else:
            self.feature_cols = feature_cols
        
        # Filter to only available columns
        self.feature_cols = [col for col in self.feature_cols if col in self.df.columns]
        
        # Create feature matrix and normalize
        self.scaler = StandardScaler()
        self.feature_matrix = self._create_feature_matrix()
        
    def _create_feature_matrix(self):
        """
        Create normalized feature matrix
        Returns:
            Normalized feature matrix
        """
        features = self.df[self.feature_cols].fillna(0).values
        return self.scaler.fit_transform(features)
    
    def get_recommendations(self, food_name, top_k=5):
        """
        Get food recommendations similar to the given food
        
        Args:
            food_name: Name of the food item
            top_k: Number of recommendations to return
        
        Returns:
            List of recommended food dictionaries with similarity scores
        """
        # Find the food in dataset
        matching_foods = self.df[self.df['food_name'].str.lower() == food_name.lower()]
        
        if matching_foods.empty:
            return {
                'success': False,
                'error': f"Food '{food_name}' not found in dataset",
                'recommendations': []
            }
        
        food_idx = matching_foods.index[0]
        
        # Calculate similarity with all other foods (cosine similarity)
        food_vector = self.feature_matrix[food_idx].reshape(1, -1)
        similarities = cosine_similarity(food_vector, self.feature_matrix)[0]
        
        # Get top K similar foods (excluding the food itself)
        similar_indices = np.argsort(similarities)[::-1][1:top_k+1]
        
        recommendations = []
        for idx in similar_indices:
            recommendations.append({
                'food_name': self.df.iloc[idx]['food_name'],
                'category': self.df.iloc[idx].get('category', 'Unknown'),
                'similarity_score': round(float(similarities[idx]), 4),
                'calories': self.df.iloc[idx].get('calories', 0),
                'protein': self.df.iloc[idx].get('protein', 0),
                'fat': self.df.iloc[idx].get('fat', 0),
                'sugar': self.df.iloc[idx].get('sugar', 0)
            })
        
        return {
            'success': True,
            'original_food': food_name,
            'recommendations': recommendations
        }
    
    def get_recommendations_by_preferences(self, preferences, top_k=5):
        """
        Get food recommendations based on user preferences
        
        Args:
            preferences: Dictionary with preferred nutrition values
                Example: {'calories': 200, 'sugar': 5, 'protein': 15}
            top_k: Number of recommendations to return
        
        Returns:
            List of recommended foods matching user preferences
        """
        # Create preference vector
        preference_vector = np.zeros(len(self.feature_cols))
        
        for i, col in enumerate(self.feature_cols):
            if col in preferences:
                preference_vector[i] = preferences[col]
        
        # Normalize preference vector
        preference_vector = self.scaler.transform(preference_vector.reshape(1, -1))[0]
        
        # Calculate similarity with all foods
        similarities = cosine_similarity([preference_vector], self.feature_matrix)[0]
        
        # Get top K similar foods
        similar_indices = np.argsort(similarities)[::-1][:top_k]
        
        recommendations = []
        for idx in similar_indices:
            recommendations.append({
                'food_name': self.df.iloc[idx]['food_name'],
                'category': self.df.iloc[idx].get('category', 'Unknown'),
                'similarity_score': round(float(similarities[idx]), 4),
                'calories': self.df.iloc[idx].get('calories', 0),
                'protein': self.df.iloc[idx].get('protein', 0),
                'fat': self.df.iloc[idx].get('fat', 0),
                'sugar': self.df.iloc[idx].get('sugar', 0)
            })
        
        return {
            'success': True,
            'preference_query': preferences,
            'recommendations': recommendations
        }


if __name__ == "__main__":
    # Example usage
    from data_preprocessing import DataPreprocessor
    
    # Load and preprocess data
    preprocessor = DataPreprocessor("data/foods_dataset.csv")
    df = preprocessor.load_data()
    df = preprocessor.clean_data()
    df = preprocessor.engineer_features()
    
    # Create recommender
    recommender = FoodRecommender(df)
    
    # Get recommendations for a food
    results = recommender.get_recommendations("Apple", top_k=5)
    print("Similar Foods:")
    for rec in results['recommendations']:
        print(f"  - {rec['food_name']}: similarity={rec['similarity_score']}")
    
    # Get recommendations based on preferences
    preferences = {'calories': 150, 'sugar': 5, 'protein': 10}
    results = recommender.get_recommendations_by_preferences(preferences, top_k=5)
    print("\nBased on Preferences:")
    for rec in results['recommendations']:
        print(f"  - {rec['food_name']}: similarity={rec['similarity_score']}")
