"""
Quick test to verify 1500 dataset is properly formatted and loadable
Run this to verify dataset integration before full training
"""

import os
import pandas as pd
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)

def test_dataset():
    """Test if 1500 dataset is properly loaded"""
    
    print("=" * 70)
    print("DATASET VERIFICATION TEST")
    print("=" * 70)
    
    # Check files exist
    print("\n1. Checking dataset files...")
    datasets = {
        'Main Dataset': 'data/foods_dataset_1500.csv',
        'Ingredients Dataset': 'data/food_ingredients_dataset_1500.csv'
    }
    
    for name, path in datasets.items():
        if os.path.exists(path):
            size = os.path.getsize(path) / (1024 * 1024)
            print(f"   ✓ {name}: {path} ({size:.2f} MB)")
        else:
            print(f"   ✗ {name}: NOT FOUND at {path}")
            return False
    
    # Load and inspect main dataset
    print("\n2. Loading main dataset...")
    try:
        df = pd.read_csv('data/foods_dataset_1500.csv')
        print(f"   ✓ Loaded {len(df)} food records")
        
        # Check columns
        print(f"   ✓ Columns ({len(df.columns)}):")
        for col in df.columns:
            print(f"     - {col}: {df[col].dtype}")
        
        # Check for missing values
        print(f"\n3. Data quality check:")
        missing = df.isnull().sum()
        if missing.sum() == 0:
            print(f"   ✓ No missing values")
        else:
            print(f"   ⚠ Missing values detected:")
            for col, count in missing[missing > 0].items():
                print(f"     - {col}: {count} missing")
        
        # Sample inspection
        print(f"\n4. Sample records:")
        sample = df.sample(min(3, len(df)))
        for idx, row in sample.iterrows():
            print(f"\n   Food #{idx}: {row['food_name']}")
            print(f"     Category: {row['category']}")
            print(f"     Health Distribution: Healthy {row['healthy_percentage']:.1f}% | Neutral {row['neutral_percentage']:.1f}% | Unhealthy {row['unhealthy_percentage']:.1f}%")
            print(f"     Recommendation: {row['overall_recommendation']}")
        
        # Statistics
        print(f"\n5. Dataset statistics:")
        print(f"   Categories: {df['category'].nunique()} unique")
        print(f"   Processing Levels: {df['processing_level'].nunique()} unique")
        print(f"   Recommendations: {df['overall_recommendation'].nunique()} unique")
        
        print(f"\n   Category breakdown:")
        categories = df['category'].value_counts().head(10)
        for cat, count in categories.items():
            print(f"     - {cat}: {count}")
        
        print("\n" + "=" * 70)
        print("✅ DATASET VERIFICATION PASSED!")
        print("=" * 70)
        print("\nNext step: Run train_with_1500_dataset.py to train models")
        
        return True
        
    except Exception as e:
        print(f"   ✗ Error loading dataset: {str(e)}")
        return False


if __name__ == "__main__":
    success = test_dataset()
    exit(0 if success else 1)
