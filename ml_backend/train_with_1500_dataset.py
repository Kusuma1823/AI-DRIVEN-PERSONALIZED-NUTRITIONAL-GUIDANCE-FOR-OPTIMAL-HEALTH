"""
Training Pipeline for 1500 Dataset Integration
Specifically configured for the expanded 1500-food dataset with ingredient analysis
"""

import os
import pandas as pd
import numpy as np
import warnings
from data_preprocessing import DataPreprocessor
from health_classifier import HealthClassifier
from recommendation import FoodRecommender
from unhealthy_score import UnhealthyScoreCalculator
from ingredient_analyzer import IngredientAnalyzer
from risk_predictor import HealthRiskPredictor
from sentiment_analysis import SentimentAnalyzer
import joblib

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)


def prepare_1500_dataset(csv_path="data/foods_dataset_1500.csv"):
    """
    Load and prepare the 1500 dataset
    Maps 1500 dataset columns to required format for ML models
    """
    
    print(f"Loading 1500 dataset from {csv_path}")
    df = pd.read_csv(csv_path)
    
    print(f"[OK] Loaded {len(df)} food items")
    print(f"[OK] Columns: {list(df.columns)}")
    print(f"[OK] Dataset shape: {df.shape}")
    
    # Display sample data
    print(f"\nSample data:")
    print(df[['food_name', 'category', 'processing_level', 'overall_recommendation']].head())
    
    return df


def engineer_features_for_1500(df):
    """
    Engineer features from the 1500 dataset for ML models
    Creates classification labels based on ingredient percentages and recommendations
    """
    
    print(f"\nEngineering features for ML models...")
    
    # Create health classification label (Healthy/Unhealthy) based on overall_recommendation
    def map_recommendation_to_health(rec):
        if rec in ['Recommended', 'Recommended with caution', 'Caution']:
            return 'Healthy'
        else:
            return 'Unhealthy'
    
    df['health_label'] = df['overall_recommendation'].apply(map_recommendation_to_health)
    
    # Feature engineering
    df['high_unhealthy_percentage'] = (df['unhealthy_percentage'] > 40).astype(int)
    df['low_healthy_percentage'] = (df['healthy_percentage'] < 30).astype(int)
    df['mixed_ingredients'] = df['neutral_ingredients_count'] > 0
    
    # Create numeric health label for classifier
    df['is_healthy'] = (df['health_label'] == 'Healthy').astype(int)
    
    # Process affected health conditions
    df['health_condition_count'] = df['affected_health_conditions'].fillna('').str.split(',').str.len()
    
    print(f"[OK] Features engineered")
    print(f"[OK] Health distribution:")
    print(df['health_label'].value_counts())
    
    return df


def create_synthetic_nutrition_features(df):
    """
    Create synthetic nutrition features for models expecting them
    Based on ingredient counts and percentages
    """
    
    print("\nCreating synthetic nutrition features...")
    
    # Synthetic calorie estimate based on processing level and ingredients
    processing_calories = {
        'Natural': 100,
        'Minimally Processed': 120,
        'Processed': 200,
        'Ultra-processed': 280
    }
    
    df['calories'] = df['processing_level'].map(processing_calories).fillna(150)
    df['calories'] += np.random.normal(30, 20, len(df))
    df['calories'] = df['calories'].clip(lower=10)
    
    # Sugar estimate (higher for unhealthy percentage)
    df['sugar'] = (df['unhealthy_percentage'] / 100) * 50 + np.random.normal(5, 3, len(df))
    df['sugar'] = df['sugar'].clip(lower=0)
    
    # Sodium estimate
    df['sodium'] = (df['unhealthy_percentage'] / 100) * 1200 + np.random.normal(100, 50, len(df))
    df['sodium'] = df['sodium'].clip(lower=0)
    
    # Fat estimate
    df['fat'] = (df['unhealthy_percentage'] / 100) * 30 + np.random.normal(5, 3, len(df))
    df['fat'] = df['fat'].clip(lower=0)
    
    # Fiber estimate (inverse of unhealthy percentage)
    df['fiber'] = ((100 - df['unhealthy_percentage']) / 100) * 15 + np.random.normal(1, 0.5, len(df))
    df['fiber'] = df['fiber'].clip(lower=0)
    
    # Protein estimate (higher for natural/healthy items)
    df['protein'] = (df['healthy_percentage'] / 100) * 25 + np.random.normal(5, 2, len(df))
    df['protein'] = df['protein'].clip(lower=0)
    
    # Additives and preservatives
    df['additives'] = 'None'
    df['preservatives'] = 'None'
    
    # Set for processed items
    processed_mask = df['processing_level'].isin(['Processed', 'Ultra-processed'])
    df.loc[processed_mask, 'additives'] = 'Artificial Flavors, Colors'
    df.loc[processed_mask, 'preservatives'] = 'Potassium Sorbate, Sodium Benzoate'
    
    # Ingredients field (use description as placeholder)
    df['ingredients'] = df['description'].fillna(df['food_name'])
    
    print(f"[OK] Synthetic nutrition features created")
    print(f"[OK] Nutrition stats:")
    print(df[['calories', 'sugar', 'sodium', 'fat', 'fiber', 'protein']].describe())
    
    return df


def run_training_pipeline_1500():
    """
    Run complete training pipeline with 1500 dataset
    """
    
    print("=" * 70)
    print("FOOD RECOMMENDATION SYSTEM - TRAINING WITH 1500 DATASET")
    print("=" * 70)
    
    # 1. LOAD AND PREPARE DATASET
    print("\n" + "=" * 70)
    print("1. LOADING AND PREPARING 1500 DATASET")
    print("=" * 70)
    
    csv_path = "data/foods_dataset_1500.csv"
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
    
    df = prepare_1500_dataset(csv_path)
    
    # 2. ENGINEER FEATURES
    print("\n" + "=" * 70)
    print("2. FEATURE ENGINEERING")
    print("=" * 70)
    
    df = engineer_features_for_1500(df)
    df = create_synthetic_nutrition_features(df)
    
    # Save preprocessed dataset
    processed_path = "data/foods_dataset_1500_processed.csv"
    df.to_csv(processed_path, index=False)
    print(f"[OK] Processed dataset saved to {processed_path}")
    
    # 3. DATA CLEANING
    print("\n" + "=" * 70)
    print("3. DATA PREPROCESSING")
    print("=" * 70)
    
    # Fill missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].median(), inplace=True)
    
    text_cols = df.select_dtypes(include=['object']).columns
    for col in text_cols:
        if df[col].isnull().sum() > 0:
            df[col].fillna('Unknown', inplace=True)
    
    # Remove duplicates
    initial_len = len(df)
    df.drop_duplicates(subset=['food_name'], inplace=True)
    print(f"[OK] Removed {initial_len - len(df)} duplicates")
    print(f"[OK] Final dataset size: {len(df)} items")
    
    # 4. TRAIN HEALTH CLASSIFIER
    print("\n" + "=" * 70)
    print("4. TRAINING HEALTH CLASSIFIER (Random Forest)")
    print("=" * 70)
    
    classifier = HealthClassifier()
    metrics = classifier.train(df)
    print(f"[OK] Classifier trained with {metrics['train_samples']} samples")
    print(f"[OK] Test accuracy: {metrics['accuracy']:.2%}")
    
    classifier.save_model("models/health_classifier_1500.pkl")
    print(f"[OK] Model saved to models/health_classifier_1500.pkl")
    
    # 5. CREATE RECOMMENDER
    print("\n" + "=" * 70)
    print("5. INITIALIZING RECOMMENDATION ENGINE")
    print("=" * 70)
    
    recommender = FoodRecommender(df)
    print(f"[OK] Recommender initialized with {len(df)} foods")
    
    # 6. INITIALIZE OTHER MODULES
    print("\n" + "=" * 70)
    print("6. INITIALIZING ML MODULES")
    print("=" * 70)
    
    score_calculator = UnhealthyScoreCalculator()
    ingredient_analyzer = IngredientAnalyzer()
    risk_predictor = HealthRiskPredictor()
    sentiment_analyzer = SentimentAnalyzer()
    
    print("[OK] All modules initialized")
    
    # 7. TESTING
    print("\n" + "=" * 70)
    print("7. TESTING MODELS")
    print("=" * 70)
    
    # Test with multiple foods
    test_foods = df.sample(min(5, len(df)))
    
    for idx, test_food in test_foods.iterrows():
        food_dict = test_food.to_dict()
        print(f"\n--- Testing: {food_dict['food_name']} ---")
        
        # Health classification
        health_result = classifier.predict(food_dict)
        print(f"  Classification: {health_result['classification']} ({health_result['confidence']:.0%})")
        
        # Unhealthy score
        score_result = score_calculator.calculate_score(food_dict)
        print(f"  Unhealthy Score: {score_result['unhealthy_percentage']}%")
        
        # Overall recommendation from dataset
        print(f"  Dataset Recommendation: {food_dict['overall_recommendation']}")
    
    # Test recommendations
    print(f"\n--- Recommendation Tests ---")
    sample_food = df.iloc[0]['food_name']
    rec_result = recommender.get_recommendations(sample_food, top_k=3)
    if rec_result['success']:
        print(f"Similar to {sample_food}:")
        for rec in rec_result['recommendations'][:3]:
            print(f"  • {rec['food_name']} (similarity: {rec['similarity_score']:.3f})")
    
    # 8. SUMMARY STATISTICS
    print("\n" + "=" * 70)
    print("8. DATASET STATISTICS")
    print("=" * 70)
    
    print(f"Total foods: {len(df)}")
    print(f"Categories: {df['category'].nunique()}")
    print(f"Processing levels: {df['processing_level'].nunique()}")
    print(f"Health distribution:")
    print(f"  Healthy: {(df['is_healthy'] == 1).sum()}")
    print(f"  Unhealthy: {(df['is_healthy'] == 0).sum()}")
    print(f"\nRecommendation distribution:")
    print(df['overall_recommendation'].value_counts())
    
    print("\n" + "=" * 70)
    print("[OK] TRAINING PIPELINE COMPLETE WITH 1500 DATASET!")
    print("=" * 70)
    
    return {
        'classifier': classifier,
        'recommender': recommender,
        'score_calculator': score_calculator,
        'ingredient_analyzer': ingredient_analyzer,
        'risk_predictor': risk_predictor,
        'sentiment_analyzer': sentiment_analyzer,
        'dataset': df,
        'metrics': metrics
    }


if __name__ == "__main__":
    # Run training pipeline
    models = run_training_pipeline_1500()
    
    print("\n[OK] All models trained with 1500 dataset and ready for deployment!")
    print(f"[ACCURACY] Classifier: {models['metrics']['accuracy']:.2%}")
    print(f"[SIZE] Dataset: {len(models['dataset'])} foods")
