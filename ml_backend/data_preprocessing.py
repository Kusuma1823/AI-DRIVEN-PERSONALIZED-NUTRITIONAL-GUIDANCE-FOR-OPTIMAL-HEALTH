"""
Data Preprocessing Module
Handles loading, cleaning, and feature engineering for the food dataset
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import os
import warnings

# Suppress pandas and sklearn warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)

class DataPreprocessor:
    """Handle data loading, cleaning, and feature engineering"""
    
    def __init__(self, csv_path=None):
        """
        Initialize the preprocessor
        Args:
            csv_path: Path to the food dataset CSV file
        """
        self.csv_path = csv_path
        self.df = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def load_data(self, csv_path=None):
        """
        Load food dataset from CSV
        Args:
            csv_path: Path to CSV file
        Returns:
            DataFrame with loaded data
        """
        if csv_path is None:
            csv_path = self.csv_path
            
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Dataset not found at {csv_path}")
        
        self.df = pd.read_csv(csv_path)
        print(f"[OK] Loaded {len(self.df)} food items")
        print(f"[OK] Columns: {list(self.df.columns)}")
        return self.df
    
    def clean_data(self):
        """
        Clean and handle missing values
        Returns:
            Cleaned DataFrame
        """
        # Fill missing numeric values with median
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if self.df[col].isnull().sum() > 0:
                self.df[col] = self.df[col].fillna(self.df[col].median())
                print(f"[OK] Filled missing values in {col}")
        
        # Fill missing text values with 'Unknown'
        text_cols = self.df.select_dtypes(include=['object']).columns
        for col in text_cols:
            if self.df[col].isnull().sum() > 0:
                self.df[col] = self.df[col].fillna('Unknown')
                print(f"[OK] Filled missing text values in {col}")
        
        # Remove duplicates
        initial_len = len(self.df)
        self.df = self.df.drop_duplicates(subset=['food_name'])
        print(f"[OK] Removed {initial_len - len(self.df)} duplicates")
        
        return self.df
    
    def engineer_features(self):
        """
        Create engineered features for ML models
        Supports both standard nutrition-based and ingredient-based (1500) datasets
        Returns:
            DataFrame with new features
        """
        # Check if this is the 1500 dataset format
        if 'unhealthy_percentage' in self.df.columns:
            return self.engineer_features_1500()
        
        # Create unhealthy flag based on nutrition values
        if 'calories' in self.df.columns:
            self.df['high_calories'] = (self.df['calories'] > 300).astype(int)
        
        if 'sugar' in self.df.columns:
            self.df['high_sugar'] = (self.df['sugar'] > 10).astype(int)
        
        if 'sodium' in self.df.columns:
            self.df['high_sodium'] = (self.df['sodium'] > 800).astype(int)
        
        if 'fat' in self.df.columns:
            self.df['high_fat'] = (self.df['fat'] > 15).astype(int)
        
        # Create ingredient count feature
        if 'ingredients' in self.df.columns:
            self.df['ingredient_count'] = self.df['ingredients'].str.split(',').str.len()
        
        # Create additive flag
        if 'additives' in self.df.columns:
            self.df['has_additives'] = (self.df['additives'] != 'None').astype(int)
        
        if 'preservatives' in self.df.columns:
            self.df['has_preservatives'] = (self.df['preservatives'] != 'None').astype(int)
        
        print("[OK] Created engineered features")
        return self.df
    
    def engineer_features_1500(self):
        """
        Create engineered features specifically for 1500 dataset
        Uses ingredient percentages and health condition information
        Returns:
            DataFrame with new features
        """
        # Create health classification based on recommendation
        def map_recommendation_to_health(rec):
            if pd.isna(rec):
                return 'Unknown'
            if rec in ['Recommended', 'Recommended with caution']:
                return 'Healthy'
            else:
                return 'Unhealthy'
        
        self.df['health_label'] = self.df['overall_recommendation'].apply(map_recommendation_to_health)
        self.df['is_healthy'] = (self.df['health_label'] == 'Healthy').astype(int)
        
        # Feature engineering from ingredient percentages
        self.df['high_unhealthy_percentage'] = (self.df['unhealthy_percentage'] > 40).astype(int)
        self.df['low_healthy_percentage'] = (self.df['healthy_percentage'] < 30).astype(int)
        self.df['mixed_ingredients'] = (self.df['neutral_ingredients_count'] > 0).astype(int)
        
        # Health condition count
        self.df['health_condition_count'] = self.df['affected_health_conditions'].fillna('').str.split(',').str.len()
        
        # Processing level risk
        processing_risk = {
            'Natural': 0,
            'Minimally Processed': 1,
            'Processed': 2,
            'Ultra-processed': 3
        }
        self.df['processing_risk'] = self.df['processing_level'].map(processing_risk).fillna(1)
        
        print("[OK] Created engineered features for 1500 dataset")
        return self.df
    
    def normalize_numeric_features(self, feature_cols):
        """
        Normalize numeric features for ML models
        Args:
            feature_cols: List of numeric column names to normalize
        Returns:
            Normalized feature matrix
        """
        features = self.df[feature_cols].copy()
        features_normalized = self.scaler.fit_transform(features)
        return features_normalized
    
    def encode_categorical_features(self, feature_cols):
        """
        Encode categorical features
        Args:
            feature_cols: List of categorical column names
        Returns:
            Encoded features as numpy array
        """
        encoded_features = np.zeros((len(self.df), len(feature_cols)))
        
        for idx, col in enumerate(feature_cols):
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                encoded_features[:, idx] = self.label_encoders[col].fit_transform(self.df[col].astype(str))
            else:
                encoded_features[:, idx] = self.label_encoders[col].transform(self.df[col].astype(str))
        
        return encoded_features
    
    def get_feature_matrix(self, numeric_cols, categorical_cols=None):
        """
        Get complete feature matrix for training
        Args:
            numeric_cols: List of numeric column names
            categorical_cols: List of categorical column names
        Returns:
            Combined feature matrix
        """
        # Normalize numeric features
        numeric_features = self.normalize_numeric_features(numeric_cols)
        result = numeric_features.copy()
        
        # Encode categorical features if provided
        if categorical_cols:
            categorical_features = self.encode_categorical_features(categorical_cols)
            result = np.hstack([numeric_features, categorical_features])
        
        return result
    
    def get_preprocessed_data(self):
        """
        Get complete preprocessed dataset
        Returns:
            Preprocessed DataFrame
        """
        return self.df


if __name__ == "__main__":
    # Example usage
    preprocessor = DataPreprocessor("data/foods_dataset.csv")
    
    # Load and clean data
    df = preprocessor.load_data()
    df = preprocessor.clean_data()
    
    # Engineer features
    df = preprocessor.engineer_features()
    
    print("\n[OK] Data preprocessing complete!")
    print(f"Dataset shape: {df.shape}")
    print(f"\nFirst few rows:")
    print(df.head())
