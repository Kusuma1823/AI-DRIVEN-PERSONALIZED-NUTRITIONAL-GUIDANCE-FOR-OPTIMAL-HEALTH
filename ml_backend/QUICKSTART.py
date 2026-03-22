"""
QUICK START GUIDE
AI-Powered Food Recommendation System
"""

# ============================================================================
# STEP 1: INSTALL DEPENDENCIES
# ============================================================================
"""
Run this command in the ml_backend directory:

PowerShell:
  pip install -r requirements.txt

This installs:
  - Flask (API framework)
  - Flask-CORS (Cross-origin requests)
  - pandas & numpy (Data processing)
  - scikit-learn (ML models)
  - nltk (Natural language processing)
  - joblib (Model persistence)
  - python-dotenv (Environment variables)
  - scipy (Scientific computing)
"""


# ============================================================================
# STEP 2: TRAIN MODELS (First Time Only)
# ============================================================================
"""
Run this command to train all models:

PowerShell:
  python training_pipeline.py

This will:
  ✓ Create sample dataset (50 foods)
  ✓ Preprocess and engineer features
  ✓ Train Random Forest health classifier
  ✓ Initialize all ML modules
  ✓ Save trained models to ml_backend/models/
  ✓ Show demonstration of complete workflow
  ✓ Display test results

Output:
  - ml_backend/data/foods_dataset.csv (sample foods)
  - ml_backend/models/health_classifier.pkl (trained model)
"""


# ============================================================================
# STEP 3: START THE FLASK API
# ============================================================================
"""
Run this command to start the API server:

PowerShell:
  python app.py

The server will start at:
  http://localhost:5000

You should see:
  ✓ All models initialized
  ✓ API RUNNING AT http://localhost:5000
  ✓ List of all available endpoints
"""


# ============================================================================
# STEP 4: TEST THE API
# ============================================================================
"""
Test endpoints using PowerShell or any API client (Postman, etc.)

A) Health Check:
  GET http://localhost:5000/api/health

B) List Foods:
  GET http://localhost:5000/api/foods/list?page=1&per_page=10

C) Search Foods:
  GET http://localhost:5000/api/foods/search?q=apple

D) Complete Food Analysis:
  GET http://localhost:5000/api/analyze/food/Apple

E) Get Similar Foods:
  GET http://localhost:5000/api/recommend/similar/Apple?top_k=5

F) Classify Food Health:
  POST http://localhost:5000/api/health/classify
  Body: {
    "calories": 235,
    "sugar": 23,
    "sodium": 70,
    "fat": 16,
    "protein": 3,
    "fiber": 0,
    "additives": "Yellow #5",
    "preservatives": "BHA, BHT"
  }

G) Calculate Unhealthy Score:
  POST http://localhost:5000/api/score/unhealthy
  Body: {
    "calories": 235,
    "sugar": 23,
    "sodium": 70,
    "fat": 16,
    "protein": 3,
    "fiber": 0
  }

H) Analyze Ingredients:
  POST http://localhost:5000/api/ingredients/analyze
  Body: {
    "ingredients": "Sugar, Cocoa, Milk, Vanilla, Yellow #5, Red #40"
  }

I) Predict Health Risks:
  POST http://localhost:5000/api/risks/predict
  Body: {
    "calories": 1500,
    "sugar": 100,
    "sodium": 3000,
    "fat": 50,
    "ingredients": "Sugar, Fructose, HFCS"
  }

J) Analyze Sentiment:
  POST http://localhost:5000/api/sentiment/analyze
  Body: {
    "text": "I feel healthy and energized after eating these vegetables!"
  }
"""


# ============================================================================
# STEP 5: CONNECT TO REACT FRONTEND
# ============================================================================
"""
The React frontend at http://localhost:5173 can now call the API:

Update your React pages to fetch data:

const getFoodAnalysis = async (foodName) => {
  const response = await fetch('/api/analyze/food/' + foodName)
  const data = await response.json()
  return data
}

const getSimilarFoods = async (foodName) => {
  const response = await fetch(`/api/recommend/similar/${foodName}?top_k=5`)
  const data = await response.json()
  return data
}

Since Flask and React run on different ports, CORS is enabled:
  - React: http://localhost:5173
  - API: http://localhost:5000
  - Flask is configured to accept requests from React
"""


# ============================================================================
# STEP 6: PROJECT STRUCTURE
# ============================================================================
"""
ml_backend/
├── app.py                    # Flask API
├── training_pipeline.py      # Model training script
├── requirements.txt          # Python dependencies
├── data/
│   └── foods_dataset.csv     # Sample food data (created by training)
├── models/
│   └── health_classifier.pkl # Trained Random Forest model
├── data_preprocessing.py     # DataPreprocessor class
├── recommendation.py         # FoodRecommender class (cosine similarity)
├── health_classifier.py      # HealthClassifier class (Random Forest)
├── unhealthy_score.py        # UnhealthyScoreCalculator class
├── ingredient_analyzer.py    # IngredientAnalyzer class (NLP)
├── risk_predictor.py         # HealthRiskPredictor class (rule-based)
└── sentiment_analysis.py     # SentimentAnalyzer class (lexicon-based)
"""


# ============================================================================
# STEP 7: API ENDPOINTS REFERENCE
# ============================================================================
"""
UTILITY ENDPOINTS
================
GET  /api/health
     Returns: API status and loaded models

GET  /api/foods/list?page=1&per_page=10
     Returns: Paginated list of foods

GET  /api/foods/search?q=apple
     Returns: Foods matching search query


RECOMMENDATION ENDPOINTS
========================
GET  /api/recommend/similar/<food_name>?top_k=5
     Returns: Similar foods with similarity scores

POST /api/recommend/by-preferences
     Returns: Foods matching user preferences


CLASSIFICATION ENDPOINTS
========================
POST /api/health/classify
     Returns: Healthy/unhealthy classification with confidence


SCORE ENDPOINTS
===============
POST /api/score/unhealthy
     Returns: Unhealthy percentage (0-100) with factors


INGREDIENT ENDPOINTS
====================
POST /api/ingredients/analyze
     Returns: Healthy/unhealthy ingredients with risks


RISK ENDPOINTS
==============
POST /api/risks/predict
     Returns: Health risks associated with food


SENTIMENT ENDPOINTS
===================
POST /api/sentiment/analyze
     Returns: Sentiment (positive/neutral/negative) with confidence

POST /api/sentiment/batch
     Returns: Sentiment for multiple texts


COMPREHENSIVE ENDPOINTS
=====================
GET  /api/analyze/food/<food_name>
     Returns: Complete analysis (classification, score, ingredients,
              risks, recommendations) in one request
"""


# ============================================================================
# STEP 8: TROUBLESHOOTING
# ============================================================================
"""
Issue: "ModuleNotFoundError: No module named 'flask'"
Fix: Run 'pip install -r requirements.txt' in ml_backend directory

Issue: "Address already in use" on port 5000
Fix: Change port in app.py: app.run(port=5001)

Issue: "Food not found in dataset"
Fix: First run 'python training_pipeline.py' to create dataset

Issue: CORS errors when React calls API
Fix: Flask-CORS is already enabled in app.py

Issue: "Classifier not available"
Fix: Run 'python training_pipeline.py' to train the model
"""


# ============================================================================
# SAMPLE DATA
# ============================================================================
"""
Sample foods included in dataset:
Healthy: Apple, Banana, Broccoli, Salmon, Almonds, Spinach, Yogurt
Unhealthy: Chocolate Bar, Donut, Soda, Burger, Pizza, Ice Cream
Mixed: Pasta, Cheese, Bread, Milk, Eggs, Chicken

The training_pipeline.py creates a complete dataset with 50 foods.
"""


# ============================================================================
# ML MODELS SUMMARY
# ============================================================================
"""
1. RECOMMENDATION ENGINE (Content-Based Filtering)
   - Algorithm: Cosine similarity on nutrition features
   - Input: Food name
   - Output: Similar foods with similarity scores (0-1)

2. HEALTH CLASSIFIER (Random Forest)
   - Algorithm: 100 decision trees, max_depth=10
   - Input: Nutrition data (calories, sugar, sodium, fat, etc.)
   - Output: Healthy/Unhealthy classification with confidence

3. UNHEALTHY SCORE CALCULATOR (Weighted Penalties)
   - Algorithm: Sum weighted penalties for unhealthy factors
   - Input: Nutrition data
   - Output: Unhealthy percentage (0-100)

4. INGREDIENT ANALYZER (NLP Keyword Matching)
   - Algorithm: Dictionary lookup with 27 healthy + 20 unhealthy ingredients
   - Input: Ingredient string
   - Output: Healthy/unhealthy ingredients with risk explanations

5. HEALTH RISK PREDICTOR (Rule-Based)
   - Algorithm: Rule-based detection for 8 health conditions
   - Input: Nutrition data
   - Output: Risk assessment (Critical/High/Medium/Low)

6. SENTIMENT ANALYZER (Lexicon-Based)
   - Algorithm: Sentiment lexicon with 90+ words
   - Input: User text
   - Output: Sentiment (Positive/Neutral/Negative) with confidence
"""


if __name__ == "__main__":
    print("""
    ═══════════════════════════════════════════════════════════════════
    AI-POWERED FOOD RECOMMENDATION SYSTEM - QUICK START GUIDE
    ═══════════════════════════════════════════════════════════════════
    
    Follow these steps:
    
    1. Install dependencies:
       pip install -r requirements.txt
    
    2. Train models:
       python training_pipeline.py
    
    3. Start API server:
       python app.py
    
    4. Test endpoints (in another terminal):
       curl http://localhost:5000/api/health
    
    5. React frontend will call API at http://localhost:5000
    
    ═══════════════════════════════════════════════════════════════════
    """)
