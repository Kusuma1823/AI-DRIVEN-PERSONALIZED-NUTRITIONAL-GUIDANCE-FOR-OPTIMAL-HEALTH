"""
Health Classification Module
Uses Random Forest Classifier to classify foods as Healthy or Unhealthy
"""

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import numpy as np
import pandas as pd
import joblib
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)


class HealthClassifier:
    """
    Random Forest Classifier for Food Health Classification
    
    Algorithm: Random Forest
    - Ensemble of decision trees
    - Each tree learns different patterns in the data
    - Final prediction is majority vote across all trees
    - Robust to overfitting and handles non-linear relationships
    
    Features Used:
    - calories, sugar, sodium, fat, saturated_fat
    - trans_fat, additives, preservatives
    """
    
    def __init__(self, model_path=None):
        """
        Initialize classifier
        Args:
            model_path: Path to pre-trained model
        """
        self.model = None
        self.feature_cols = [
            'calories', 'sugar', 'sodium', 'fat', 
            'protein', 'fiber', 'has_additives', 'has_preservatives'
        ]
        self.available_features = []
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def prepare_training_data(self, df):
        """
        Prepare training data
        Args:
            df: DataFrame with food data
        
        Returns:
            X (features), y (labels)
        """
        # Determine available features
        self.available_features = [col for col in self.feature_cols if col in df.columns]
        
        # Create missing features if needed
        if 'has_additives' not in df.columns and 'additives' in df.columns:
            df['has_additives'] = (df['additives'] != 'None').astype(int)
        if 'has_preservatives' not in df.columns and 'preservatives' in df.columns:
            df['has_preservatives'] = (df['preservatives'] != 'None').astype(int)
        
        # Update available features again
        self.available_features = [col for col in self.feature_cols if col in df.columns]
        
        # Create labels if not exists - use 'is_healthy' from 1500 dataset
        if 'label' not in df.columns:
            if 'is_healthy' in df.columns:
                # Use 1500 dataset format
                df['label'] = (df['is_healthy'] == 0).astype(int)  # 1=unhealthy, 0=healthy
            else:
                # Create labels from nutrition data
                unhealthy_score = 0
                if 'calories' in df.columns:
                    unhealthy_score += (df['calories'] > 300).astype(int) * 1
                if 'sugar' in df.columns:
                    unhealthy_score += (df['sugar'] > 10).astype(int) * 1.5
                if 'sodium' in df.columns:
                    unhealthy_score += (df['sodium'] > 800).astype(int) * 1.2
                if 'fat' in df.columns:
                    unhealthy_score += (df['fat'] > 15).astype(int) * 1
                if 'has_additives' in df.columns:
                    unhealthy_score += (df['has_additives'] == 1).astype(int) * 0.8
                if 'has_preservatives' in df.columns:
                    unhealthy_score += (df['has_preservatives'] == 1).astype(int) * 0.8
                df['label'] = (unhealthy_score > 3).astype(int)  # 1=unhealthy, 0=healthy
        
        # Select features
        X = df[self.available_features].fillna(0).values
        y = df['label'].values
        
        return X, y
    
    def train(self, df, test_size=0.2, random_state=42):
        """
        Train Random Forest classifier
        Args:
            df: Training DataFrame
            test_size: Proportion of data to use for testing
            random_state: Random seed
        
        Returns:
            Training metrics
        """
        print("Training Health Classifier...")
        
        X, y = self.prepare_training_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,        # 100 decision trees
            max_depth=10,            # Limit depth to prevent overfitting
            min_samples_split=5,     # Minimum 5 samples to split
            random_state=random_state
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"[OK] Model trained with {len(X_train)} samples")
        print(f"[OK] Test accuracy: {accuracy:.2%}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Healthy', 'Unhealthy']))
        
        return {
            'accuracy': accuracy,
            'train_samples': len(X_train),
            'test_samples': len(X_test)
        }
    
    def predict(self, food_data):
        """
        Predict if a food is healthy or unhealthy
        Args:
            food_data: Dictionary with food features
        
        Returns:
            Classification result with confidence
        """
        if self.model is None:
            return {'error': 'Model not trained'}
        
        # Prepare feature vector
        features = []
        for col in self.feature_cols:
            features.append(food_data.get(col, 0))
        
        X = np.array(features).reshape(1, -1)
        
        # Predict
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        return {
            'classification': 'Unhealthy' if prediction == 1 else 'Healthy',
            'confidence': float(max(probabilities)),
            'unhealthy_probability': float(probabilities[1]),
            'healthy_probability': float(probabilities[0])
        }
    
    def save_model(self, path):
        """Save trained model to disk"""
        joblib.dump(self.model, path)
        print(f"[OK] Model saved to {path}")
    
    def load_model(self, path):
        """Load trained model from disk"""
        self.model = joblib.load(path)
        print(f"[OK] Model loaded from {path}")


import os

if __name__ == "__main__":
    from data_preprocessing import DataPreprocessor
    
    # Load and preprocess data
    preprocessor = DataPreprocessor("data/foods_dataset.csv")
    df = preprocessor.load_data()
    df = preprocessor.clean_data()
    df = preprocessor.engineer_features()
    
    # Train classifier
    classifier = HealthClassifier()
    classifier.train(df)
    
    # Test prediction
    test_food = {
        'calories': 350,
        'sugar': 15,
        'sodium': 1000,
        'fat': 20,
        'protein': 10,
        'fiber': 2,
        'has_additives': 1,
        'has_preservatives': 1
    }
    
    result = classifier.predict(test_food)
    print("\nTest Prediction:")
    print(f"Classification: {result['classification']}")
    print(f"Confidence: {result['confidence']:.2%}")
