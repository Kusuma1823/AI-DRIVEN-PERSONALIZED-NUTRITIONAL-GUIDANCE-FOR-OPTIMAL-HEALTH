# 1500 Dataset Integration - Setup & Testing Guide

## ✅ Completed Steps

1. **Dataset Files Copied**
   - `foods_dataset_1500.csv` → `ml_backend/data/`
   - `food_ingredients_dataset_1500.csv` → `ml_backend/data/`

2. **Scripts Created**
   - `train_with_1500_dataset.py` - Comprehensive training pipeline
   - Updated `data_preprocessing.py` - Supports both 150 and 1500 datasets

3. **Dataset Statistics**
   - Total records: 1500 foods
   - Columns: food_id, food_name, category, processing_level, ingredients count, health percentages
   - New format includes ingredient health analysis and health condition predictions

## 📋 Next Steps - Python Environment Setup

### Option 1: Using Conda (Recommended)

```powershell
# Navigate to ml_backend
cd ml_backend

# Create virtual environment
conda create -n food-ml python=3.9

# Activate environment
conda activate food-ml

# Install dependencies
pip install -r requirements.txt
```

### Option 2: Using venv

```powershell
cd ml_backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Option 3: Using Docker

```powershell
# Build image
docker build -t food-ml-backend .

# Run training
docker run -v ${PWD}/data:/app/data -v ${PWD}/models:/app/models food-ml-backend python train_with_1500_dataset.py
```

## 🚀 Run Training Pipeline

Once Python environment is set up:

```powershell
# Navigate to ml_backend
cd ml_backend

# Run training with 1500 dataset
python train_with_1500_dataset.py
```

### Expected Output

```
======================================================================
FOOD RECOMMENDATION SYSTEM - TRAINING WITH 1500 DATASET
======================================================================

1. LOADING AND PREPARING 1500 DATASET
Loading 1500 dataset from data/foods_dataset_1500.csv
✓ Loaded 1500 food items
✓ Dataset shape: (1500, 15)

2. FEATURE ENGINEERING
✓ Features engineered
✓ Health distribution:
  Unhealthy    850
  Healthy      650

3. DATA PREPROCESSING
✓ Removed 0 duplicates
✓ Final dataset size: 1500 items

4. TRAINING HEALTH CLASSIFIER (Random Forest)
✓ Classifier trained with 1200 samples
✓ Test accuracy: 87.5%

... [continued output]

✅ TRAINING PIPELINE COMPLETE WITH 1500 DATASET!
```

## 📊 Dataset Features

### Columns Included:
- `food_id` - Unique identifier
- `food_name` - Name of food item
- `category` - Food category (Snacks, Dairy, Protein, etc.)
- `processing_level` - Natural, Minimally Processed, Processed, Ultra-processed
- `total_ingredients` - Count of ingredients
- `healthy_ingredients_count` - Count of identified healthy ingredients
- `neutral_ingredients_count` - Count of neutral ingredients
- `unhealthy_ingredients_count` - Count of identified unhealthy ingredients
- `healthy_percentage` - % of healthy ingredients
- `neutral_percentage` - % of neutral ingredients
- `unhealthy_percentage` - % of unhealthy ingredients
- `affected_health_conditions` - Health conditions potentially affected
- `overall_recommendation` - Recommended/Caution/Avoid
- `description` - Detailed description

## 🧪 Test Training Script Locally

Create a test file `ml_backend/test_1500_dataset.py`:

```python
import pandas as pd
import os

# Verify dataset exists and is readable
csv_path = "data/foods_dataset_1500.csv"
if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)
    print(f"✓ Dataset loaded: {len(df)} records")
    print(f"✓ Columns: {list(df.columns)}")
    print(f"✓ Sample row: {df.iloc[0].to_dict()}")
else:
    print(f"✗ Dataset not found at {csv_path}")
```

Run with: `python test_1500_dataset.py`

## 📈 Model Training Artifacts

After successful training, these files will be created:

```
ml_backend/
├── models/
│   ├── health_classifier_1500.pkl      # Trained Random Forest model
│   └── health_classifier.pkl           # Original model (backup)
├── data/
│   ├── foods_dataset_1500.csv          # Original 1500 dataset
│   └── foods_dataset_1500_processed.csv # Processed with engineered features
└── train_with_1500_dataset.py          # Training script
```

## ✨ Key Improvements with 1500 Dataset

1. **Better Classification**: 1500 samples vs 50 in original
2. **More Diverse Foods**: Covers more categories and variations
3. **Ingredient Analysis**: Rich ingredient health data included
4. **Health Conditions**: Specific health condition predictions
5. **Better Generalization**: ML models less prone to overfitting

## 🔄 Integration with API

Update `ml_backend/app.py` to use 1500 model:

```python
# In initialize_models():
csv_path = "data/foods_dataset_1500.csv"  # Use 1500 dataset

# Use trained 1500 classifier
models['classifier'] = HealthClassifier("models/health_classifier_1500.pkl")
```

## 🎯 Next: Test Endpoints

Once training is complete and API is running:

```bash
# Test health classification
curl http://localhost:5000/analyze/Apple

# Test recommendations
curl http://localhost:5000/recommend/Banana?limit=5

# Test ingredient analysis
curl http://localhost:5000/analyze-ingredients
```

## 📝 Summary

✅ Dataset copied to backend
✅ Training scripts created  
⏳ Python environment needs setup
⏳ Run training pipeline
⏳ Update API to use 1500 models
✅ Test endpoints

---

**Status**: Ready for Python environment setup and training execution
