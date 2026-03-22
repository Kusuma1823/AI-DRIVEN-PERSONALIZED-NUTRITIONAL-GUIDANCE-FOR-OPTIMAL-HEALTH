"""
Training Pipeline
Integrates all ML modules and trains the complete food recommendation system
"""

import os
import pandas as pd
import numpy as np
import warnings
from data_preprocessing import DataPreprocessor
from health_classifier import HealthClassifier
from recommendation import FoodRecommender
from unhealthy_score import UnhealthyScoreCalculator

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)


def create_sample_dataset(output_path="data/foods_dataset.csv"):
    """
    Create a sample food dataset for training
    """
    sample_data = {
        'food_id': list(range(1, 51)),
        'food_name': [
            'Apple', 'Banana', 'Orange', 'Broccoli', 'Carrot',
            'Chicken Breast', 'Salmon', 'Eggs', 'Spinach', 'Almonds',
            'Whole Wheat Bread', 'Brown Rice', 'Oats', 'Yogurt', 'Milk',
            'Chocolate Bar', 'Donut', 'Soda', 'Burger', 'Pizza',
            'Fried Chicken', 'Ice Cream', 'Chips', 'Candy', 'Cake',
            'White Bread', 'Pasta', 'Cheese', 'Butter', 'Sugar',
            'Olive Oil', 'Avocado', 'Berries', 'Nuts', 'Lentils',
            'Sweet Potato', 'Garlic', 'Ginger', 'Green Tea', 'Coffee',
            'Honey', 'Peanut Butter', 'Turkey', 'Tofu', 'Beans',
            'Tomato', 'Lettuce', 'Cucumber', 'Bell Pepper', 'Mushroom'
        ],
        'category': [
            'Fruit', 'Fruit', 'Fruit', 'Vegetable', 'Vegetable',
            'Protein', 'Protein', 'Protein', 'Vegetable', 'Nuts',
            'Grain', 'Grain', 'Grain', 'Dairy', 'Dairy',
            'Snack', 'Snack', 'Beverage', 'Fast Food', 'Fast Food',
            'Fast Food', 'Dessert', 'Snack', 'Snack', 'Dessert',
            'Grain', 'Grain', 'Dairy', 'Dairy', 'Sweetener',
            'Oil', 'Fruit', 'Fruit', 'Nuts', 'Legume',
            'Vegetable', 'Vegetable', 'Spice', 'Beverage', 'Beverage',
            'Sweetener', 'Protein', 'Protein', 'Protein', 'Legume',
            'Vegetable', 'Vegetable', 'Vegetable', 'Vegetable', 'Vegetable'
        ],
        'calories': [
            52, 89, 47, 34, 41,
            165, 208, 155, 23, 579,
            80, 111, 150, 100, 150,
            235, 269, 140, 354, 290,
            320, 207, 160, 200, 350,
            75, 131, 402, 717, 16,
            884, 160, 57, 607, 116,
            86, 18, 5, 2, 4,
            64, 562, 165, 76, 245,
            18, 15, 16, 31, 15
        ],
        'sugar': [
            10.3, 12.2, 9.3, 2.2, 4.7,
            0, 0, 0.4, 0.4, 4.4,
            2, 2.3, 1, 4.7, 5,
            23, 15, 39, 8, 6,
            0, 21, 1, 54, 48,
            1, 0.3, 0.7, 0, 99.8,
            0, 0.7, 7.4, 12.7, 6.3,
            6.6, 1.7, 1.7, 0, 0,
            12, 6.3, 0, 0.5, 3.5,
            3.5, 2.3, 3.5, 4.2, 0.9
        ],
        'sodium': [
            2, 358, 0, 64, 69,
            75, 75, 124, 24, 12,
            408, 5, 2, 161, 107,
            70, 302, 35, 508, 616,
            400, 52, 180, 90, 367,
            358, 3, 621, 717, 0,
            0, 11, 2, 0, 6,
            77, 40, 3, 0, 0,
            4, 171, 100, 2, 2,
            12, 64, 2, 3, 3
        ],
        'fat': [
            0.2, 0.3, 0.3, 0.4, 0.2,
            3.6, 13, 11, 0.4, 49.9,
            1, 0.9, 3.4, 0.4, 3.3,
            16, 17, 0, 17.5, 10,
            21, 11, 9, 6, 17,
            1, 1.3, 33, 81.7, 0,
            100, 15, 0.3, 0.8, 0.4,
            0.2, 0.1, 0.1, 0, 0,
            0.3, 50, 3.6, 4.7, 0.4,
            0.3, 0.4, 0.2, 0.3, 0.3
        ],
        'protein': [
            0.3, 1.1, 0.9, 2.8, 0.9,
            31, 20, 13, 2.9, 21.2,
            4, 2.6, 10.7, 10, 7.7,
            3, 4, 0, 17, 12,
            26, 3.5, 3, 0, 4,
            3, 5, 7.6, 0.7, 0,
            0, 3, 1.1, 20, 8.8,
            0.9, 0.2, 0.3, 0.1, 0.3,
            0.8, 25, 29, 17, 17,
            5, 4, 3, 2, 3
        ],
        'fiber': [
            2.4, 2.6, 2.4, 2.4, 2.8,
            0, 0, 0, 2.2, 3.5,
            2.4, 1.5, 10.7, 0, 0,
            0, 0, 0, 0, 1.8,
            0, 0, 1, 0, 1,
            1.9, 1.8, 0, 0, 0,
            0, 6.7, 2.2, 5.3, 6.4,
            2.4, 2.1, 2.1, 0, 0,
            0.8, 6, 0, 2, 6.4,
            3, 1.2, 0.6, 2.1, 0.7
        ],
        'additives': [
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None',
            'Yellow #5, Red #40', 'Artificial Flavor', 'Caramel Color', 'Sodium Benzoate', 'MSG',
            'Sodium Phosphate', 'Artificial Flavor', 'Sodium Nitrite', 'Yellow #6', 'Artificial Flavor',
            'Potassium Sorbate', 'Durum Wheat', 'Sodium', 'Natural Flavor', 'None',
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None'
        ],
        'preservatives': [
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None',
            'Potassium Sorbate', 'None', 'None', 'None', 'None',
            'BHA, BHT', 'Sodium Benzoate', 'Sodium Benzoate', 'Sodium Benzoate', 'Sodium Nitrite',
            'Sodium Nitrite', 'Guar Gum', 'None', 'None', 'None',
            'Potassium Sorbate', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None',
            'None', 'None', 'None', 'None', 'None'
        ],
        'ingredients': [
            'Apple', 'Banana', 'Orange', 'Broccoli, Water, Salt', 'Carrot, Water',
            'Chicken Breast', 'Salmon', 'Eggs', 'Spinach, Water, Salt', 'Almonds',
            'Whole Wheat, Water, Yeast, Salt', 'Brown Rice, Water', 'Oats, Water', 'Milk, Live Cultures', 'Milk',
            'Sugar, Cocoa, Milk, Vanilla', 'Wheat Flour, Sugar, Oil, Eggs, Vanilla', 'Water, Sugar, CO2, Phosphoric Acid, Caffeine',
            'Beef, Bread, Lettuce, Tomato, Mayo, Salt', 'Dough, Tomato Sauce, Cheese, Toppings',
            'Chicken, Breading, Oil', 'Milk, Sugar, Vanilla, Cream', 'Potatoes, Oil, Salt',
            'Sugar, Corn Syrup, Gelatin', 'Wheat Flour, Sugar, Butter, Eggs, Vanilla',
            'White Bread, Water, Yeast', 'Durum Wheat Semolina, Water', 'Milk, Cultures',
            'Cream, Water', 'Sugar',
            'Olive Oil', 'Avocado', 'Berries', 'Almonds, Cashews, Walnuts', 'Lentils, Water',
            'Sweet Potato', 'Garlic', 'Ginger Root', 'Green Tea Leaves', 'Coffee Beans',
            'Honey', 'Peanuts, Sugar, Oil, Salt', 'Turkey', 'Soybeans, Water, Salt', 'Beans',
            'Tomato, Water', 'Lettuce, Water', 'Cucumber, Water', 'Bell Pepper', 'Mushroom'
        ]
    }
    
    df = pd.DataFrame(sample_data)
    df.to_csv(output_path, index=False)
    print(f"✓ Sample dataset created at {output_path}")
    return df


def run_training_pipeline(csv_path="data/foods_dataset.csv"):
    """
    Run complete training pipeline for all ML modules
    """
    
    print("=" * 60)
    print("FOOD RECOMMENDATION SYSTEM - TRAINING PIPELINE")
    print("=" * 60)
    
    # Create sample dataset if it doesn't exist
    if not os.path.exists(csv_path):
        print("\nCreating sample dataset...")
        df = create_sample_dataset()
    else:
        print(f"\nLoading dataset from {csv_path}")
        df = pd.read_csv(csv_path)
    
    # 1. DATA PREPROCESSING
    print("\n" + "=" * 60)
    print("1. DATA PREPROCESSING")
    print("=" * 60)
    
    preprocessor = DataPreprocessor()
    df_clean = preprocessor.df
    df_clean = df.copy()
    
    # Clean data
    for col in df.select_dtypes(include=['number']).columns:
        df_clean[col].fillna(df_clean[col].median(), inplace=True)
    for col in df.select_dtypes(include=['object']).columns:
        df_clean[col].fillna('Unknown', inplace=True)
    
    df_clean = df_clean.drop_duplicates(subset=['food_name'])
    
    # Engineer features
    df_clean['high_calories'] = (df_clean['calories'] > 300).astype(int)
    df_clean['high_sugar'] = (df_clean['sugar'] > 10).astype(int)
    df_clean['high_sodium'] = (df_clean['sodium'] > 800).astype(int)
    df_clean['high_fat'] = (df_clean['fat'] > 15).astype(int)
    df_clean['ingredient_count'] = df_clean['ingredients'].str.split(',').str.len()
    df_clean['has_additives'] = (df_clean['additives'] != 'None').astype(int)
    df_clean['has_preservatives'] = (df_clean['preservatives'] != 'None').astype(int)
    
    print(f"✓ Data cleaned and engineered")
    print(f"✓ Dataset shape: {df_clean.shape}")
    
    # 2. TRAIN HEALTH CLASSIFIER
    print("\n" + "=" * 60)
    print("2. TRAINING HEALTH CLASSIFIER (Random Forest)")
    print("=" * 60)
    
    classifier = HealthClassifier()
    metrics = classifier.train(df_clean)
    print(f"✓ Health classifier trained with {metrics['train_samples']} samples")
    print(f"✓ Test accuracy: {metrics['accuracy']:.2%}")
    classifier.save_model("models/health_classifier.pkl")
    
    # 3. CREATE RECOMMENDER
    print("\n" + "=" * 60)
    print("3. INITIALIZING RECOMMENDATION ENGINE (Content-Based Filtering)")
    print("=" * 60)
    
    recommender = FoodRecommender(df_clean)
    print(f"✓ Recommendation engine initialized with {len(df_clean)} foods")
    
    # 4. INITIALIZE OTHER MODULES
    print("\n" + "=" * 60)
    print("4. INITIALIZING OTHER MODULES")
    print("=" * 60)
    
    score_calculator = UnhealthyScoreCalculator()
    print("✓ Unhealthy score calculator initialized")
    
    from ingredient_analyzer import IngredientAnalyzer
    from risk_predictor import HealthRiskPredictor
    from sentiment_analysis import SentimentAnalyzer
    
    ingredient_analyzer = IngredientAnalyzer()
    print("✓ Ingredient analyzer initialized")
    
    risk_predictor = HealthRiskPredictor()
    print("✓ Health risk predictor initialized")
    
    sentiment_analyzer = SentimentAnalyzer()
    print("✓ Sentiment analyzer initialized")
    
    # 5. DEMONSTRATION
    print("\n" + "=" * 60)
    print("5. DEMONSTRATION - COMPLETE WORKFLOW")
    print("=" * 60)
    
    # Select a test food
    test_food_name = "Chocolate Bar"
    print(f"\n🍫 Testing with: {test_food_name}")
    
    # Get food data
    test_food = df_clean[df_clean['food_name'] == test_food_name].iloc[0].to_dict()
    
    # 5.1 Health Classification
    print(f"\n--- Health Classification ---")
    health_result = classifier.predict(test_food)
    print(f"Classification: {health_result['classification']}")
    print(f"Confidence: {health_result['confidence']:.0%}")
    
    # 5.2 Unhealthy Score
    print(f"\n--- Unhealthy Percentage ---")
    score_result = score_calculator.calculate_score(test_food)
    print(f"Unhealthy %: {score_result['unhealthy_percentage']}%")
    print(f"Health Rating: {score_result['health_rating']}")
    
    # 5.3 Ingredient Analysis
    print(f"\n--- Ingredient Analysis ---")
    ingredient_result = ingredient_analyzer.analyze_ingredients(test_food.get('ingredients', ''))
    print(f"Total Ingredients: {len(ingredient_result['all_ingredients'])}")
    print(f"Healthy: {ingredient_result['healthy_count']} | Unhealthy: {ingredient_result['unhealthy_count']}")
    
    # 5.4 Health Risk Prediction
    print(f"\n--- Health Risk Assessment ---")
    risk_result = risk_predictor.predict_health_risks(test_food)
    print(f"Total Risks Detected: {risk_result['total_risks_detected']}")
    if risk_result['health_risks']:
        print(f"Top Risk: {risk_result['health_risks'][0]['condition']}")
    
    # 5.5 Recommendations
    print(f"\n--- Recommendations ---")
    rec_result = recommender.get_recommendations(test_food_name, top_k=3)
    if rec_result['success']:
        print(f"Similar foods to {test_food_name}:")
        for i, rec in enumerate(rec_result['recommendations'][:3], 1):
            print(f"  {i}. {rec['food_name']} (similarity: {rec['similarity_score']})")
    
    print("\n" + "=" * 60)
    print("TRAINING PIPELINE COMPLETE!")
    print("=" * 60)
    
    return {
        'classifier': classifier,
        'recommender': recommender,
        'score_calculator': score_calculator,
        'ingredient_analyzer': ingredient_analyzer,
        'risk_predictor': risk_predictor,
        'sentiment_analyzer': sentiment_analyzer,
        'dataset': df_clean
    }


if __name__ == "__main__":
    models = run_training_pipeline()
    print("\n✓ All models trained and ready for API integration!")
