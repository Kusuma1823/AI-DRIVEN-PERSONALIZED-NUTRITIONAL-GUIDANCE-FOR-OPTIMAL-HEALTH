"""
Flask API for AI-Powered Food Recommendation System
Serves all ML models through REST endpoints
"""

import warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
import json
import numpy as np

from data_preprocessing import DataPreprocessor
from recommendation import FoodRecommender
from health_classifier import HealthClassifier
from unhealthy_score import UnhealthyScoreCalculator
from ingredient_analyzer import IngredientAnalyzer
from risk_predictor import HealthRiskPredictor
from sentiment_analysis import SentimentAnalyzer
from database import init_database, Database
import database as db


app = Flask(__name__)
CORS(app)

# Global model instances
models = {}
dataset = None
DATASET_SIZE = os.getenv('DATASET_SIZE', '1500')  # Default to 1500 dataset


def create_synthetic_nutrition_features(df):
    """
    Create synthetic nutrition features for models expecting them
    Based on ingredient counts and percentages
    """
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
    
    return df


def get_dataset_path():
    """Get the correct dataset path based on configuration"""
    if DATASET_SIZE == '1500':
        path = "data/foods_dataset_1500.csv"
        if os.path.exists(path):
            return path, 'foods_dataset_1500_processed.csv'
    
    # Fallback to 150 dataset
    return "data/foods_dataset.csv", "health_classifier.pkl"


def initialize_models():
    """Initialize all ML models"""
    global models, dataset
    
    csv_path, model_name = get_dataset_path()
    model_path = f"models/{model_name.replace('.csv', '.pkl')}"
    
    print(f"🔄 Loading dataset from: {csv_path}")
    print(f"🔄 Using dataset size: {DATASET_SIZE}")
    
    # Load dataset
    if not os.path.exists(csv_path):
        print(f"⚠️  Dataset not found at {csv_path}")
        if DATASET_SIZE == '1500':
            print("📌 Falling back to original 150 dataset...")
            from training_pipeline import create_sample_dataset, run_training_pipeline
            run_training_pipeline()
            csv_path = "data/foods_dataset.csv"
            model_path = "models/health_classifier.pkl"
        else:
            raise FileNotFoundError(f"Dataset not found at {csv_path}")
    
    # Load data
    dataset = pd.read_csv(csv_path)
    print(f"✓ Loaded {len(dataset)} food items from {csv_path}")
    
    # For 1500 dataset, apply feature engineering if not already done
    if DATASET_SIZE == '1500':
        processed_path = csv_path.replace('.csv', '_processed.csv')
        if os.path.exists(processed_path):
            print(f"✓ Using preprocessed dataset: {processed_path}")
            dataset = pd.read_csv(processed_path)
        else:
            print(f"🔄 Applying feature engineering to 1500 dataset...")
            from data_preprocessing import DataPreprocessor
            preprocessor = DataPreprocessor(dataset)
            _ = preprocessor.engineer_features_1500()
            dataset = preprocessor.df
            # Create synthetic nutrition features for recommendation engine
            dataset = create_synthetic_nutrition_features(dataset)
            print(f"✓ Feature engineering complete. Dataset shape: {dataset.shape}")
    
    # Initialize models
    models['recommender'] = FoodRecommender(dataset)
    
    # Try to load classifier
    classifier_1500 = "models/health_classifier_1500.pkl"
    if DATASET_SIZE == '1500' and os.path.exists(classifier_1500):
        models['classifier'] = HealthClassifier(classifier_1500)
        print(f"✓ Loaded classifier: {classifier_1500}")
    elif os.path.exists(model_path):
        models['classifier'] = HealthClassifier(model_path)
        print(f"✓ Loaded classifier: {model_path}")
    else:
        models['classifier'] = None
        print(f"⚠️  Classifier not found, will train from scratch")
    
    models['score_calculator'] = UnhealthyScoreCalculator()
    models['ingredient_analyzer'] = IngredientAnalyzer()
    models['risk_predictor'] = HealthRiskPredictor()
    models['sentiment_analyzer'] = SentimentAnalyzer()
    
    if models['classifier'] is None:
        # Train classifier if not available
        print("🔄 Training health classifier...")
        classifier = HealthClassifier()
        classifier.train(dataset)
        classifier.save_model(model_path)
        models['classifier'] = classifier
        print(f"✓ Trained and saved classifier: {model_path}")
    
    print("✓ All models initialized successfully")


# ============================================================================
# SYSTEM STATUS ENDPOINTS
# ============================================================================

@app.route('/api/status', methods=['GET'])
def api_status():
    """Get API and dataset status information"""
    return jsonify({
        'status': 'running',
        'version': '2.0-1500',
        'dataset': {
            'size': DATASET_SIZE,
            'total_foods': len(dataset) if dataset is not None else 0,
            'path': 'data/foods_dataset_1500.csv' if DATASET_SIZE == '1500' else 'data/foods_dataset.csv'
        },
        'models': {
            'recommender': 'initialized' if models.get('recommender') else 'not_loaded',
            'classifier': 'initialized' if models.get('classifier') else 'not_loaded',
            'ingredient_analyzer': 'initialized' if models.get('ingredient_analyzer') else 'not_loaded',
            'risk_predictor': 'initialized' if models.get('risk_predictor') else 'not_loaded',
            'sentiment_analyzer': 'initialized' if models.get('sentiment_analyzer') else 'not_loaded'
        },
        'features': ['recommendations', 'health_classification', 'unhealthy_score', 'ingredient_analysis', 'risk_prediction', 'sentiment_analysis']
    })


@app.route('/api/dataset-info', methods=['GET'])
def dataset_info():
    """Get detailed dataset information"""
    if dataset is None:
        return jsonify({'error': 'Dataset not loaded'}), 503
    
    return jsonify({
        'total_records': len(dataset),
        'columns': list(dataset.columns),
        'categories': dataset['category'].nunique() if 'category' in dataset.columns else None,
        'category_breakdown': dataset['category'].value_counts().to_dict() if 'category' in dataset.columns else None,
        'sample_foods': dataset['food_name'].head(10).tolist()
    })


# ============================================================================
# RECOMMENDATIONS ENDPOINTS
# ============================================================================

@app.route('/api/recommend/similar/<food_name>', methods=['GET'])
def get_similar_foods(food_name):
    """Get foods similar to the given food item"""
    try:
        top_k = request.args.get('top_k', 5, type=int)
        result = models['recommender'].get_recommendations(food_name, top_k=top_k)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/recommend/by-preferences', methods=['POST'])
def get_recommendations_by_preferences():
    """Get recommendations based on user preferences"""
    try:
        data = request.get_json()
        preferences = data.get('preferences', {})
        top_k = data.get('top_k', 5)
        
        result = models['recommender'].get_recommendations_by_preferences(preferences, top_k=top_k)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# HEALTH CLASSIFICATION ENDPOINTS
# ============================================================================

@app.route('/api/health/classify', methods=['POST'])
def classify_food_health():
    """Classify a food as healthy or unhealthy"""
    try:
        data = request.get_json()
        
        feature_data = {
            'calories': data.get('calories', 0),
            'sugar': data.get('sugar', 0),
            'sodium': data.get('sodium', 0),
            'fat': data.get('fat', 0),
            'protein': data.get('protein', 0),
            'fiber': data.get('fiber', 0),
            'has_additives': 1 if data.get('additives') not in ['None', '', None] else 0,
            'has_preservatives': 1 if data.get('preservatives') not in ['None', '', None] else 0
        }
        
        if models['classifier']:
            result = models['classifier'].predict(feature_data)
            return jsonify(result)
        else:
            return jsonify({'error': 'Classifier not available'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# UNHEALTHY SCORE ENDPOINTS
# ============================================================================

@app.route('/api/score/unhealthy', methods=['POST'])
def calculate_unhealthy_score():
    """Calculate unhealthy percentage for a food item"""
    try:
        data = request.get_json()
        result = models['score_calculator'].calculate_score(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# INGREDIENT ANALYSIS ENDPOINTS
# ============================================================================

@app.route('/api/ingredients/analyze', methods=['POST'])
def analyze_ingredients():
    """Analyze ingredients for healthy and unhealthy components"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', '')
        
        result = models['ingredient_analyzer'].analyze_ingredients(ingredients)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# HEALTH RISK PREDICTION ENDPOINTS
# ============================================================================

@app.route('/api/risks/predict', methods=['POST'])
def predict_health_risks():
    """Predict health risks based on food composition"""
    try:
        data = request.get_json()
        user_conditions = data.get('user_health_conditions', None)
        
        result = models['risk_predictor'].predict_health_risks(data, user_conditions)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# SENTIMENT ANALYSIS ENDPOINTS
# ============================================================================

@app.route('/api/sentiment/analyze', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of a text post"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        result = models['sentiment_analyzer'].analyze_sentiment(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/sentiment/batch', methods=['POST'])
def analyze_batch_sentiment():
    """Analyze sentiment for multiple texts"""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        
        result = models['sentiment_analyzer'].analyze_batch(texts)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# COMPLETE ANALYSIS WORKFLOW ENDPOINTS
# ============================================================================

@app.route('/api/analyze/food/<food_name>', methods=['GET'])
def complete_food_analysis(food_name):
    """
    Complete analysis of a food item
    Returns: classification, unhealthy score, ingredients, risks, recommendations
    """
    try:
        # Find food in dataset
        matching = dataset[dataset['food_name'].str.lower() == food_name.lower()]
        
        if matching.empty:
            return jsonify({'error': f"Food '{food_name}' not found in dataset"}), 404
        
        food_data = matching.iloc[0].to_dict()
        food_data = {k: (v if not pd.isna(v) else None) for k, v in food_data.items()}
        
        # 1. Health Classification
        feature_data = {
            'calories': food_data.get('calories', 0),
            'sugar': food_data.get('sugar', 0),
            'sodium': food_data.get('sodium', 0),
            'fat': food_data.get('fat', 0),
            'protein': food_data.get('protein', 0),
            'fiber': food_data.get('fiber', 0),
            'has_additives': 1 if food_data.get('additives') not in ['None', '', None] else 0,
            'has_preservatives': 1 if food_data.get('preservatives') not in ['None', '', None] else 0
        }
        
        classification = models['classifier'].predict(feature_data) if models['classifier'] else None
        
        # 2. Unhealthy Score
        score_result = models['score_calculator'].calculate_score(food_data)
        
        # 3. Ingredient Analysis
        ingredient_result = models['ingredient_analyzer'].analyze_ingredients(
            food_data.get('ingredients', '')
        )
        
        # 4. Health Risk Prediction
        risk_result = models['risk_predictor'].predict_health_risks(food_data)
        
        # 5. Recommendations
        rec_result = models['recommender'].get_recommendations(food_name, top_k=5)
        
        return jsonify({
            'food_name': food_name,
            'nutrition': {
                'calories': food_data.get('calories'),
                'sugar': food_data.get('sugar'),
                'sodium': food_data.get('sodium'),
                'fat': food_data.get('fat'),
                'protein': food_data.get('protein'),
                'fiber': food_data.get('fiber')
            },
            'classification': classification,
            'unhealthy_score': score_result,
            'ingredients': ingredient_result,
            'health_risks': risk_result['health_risks'],
            'recommendations': rec_result.get('recommendations', [])
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.route('/api/foods/search', methods=['GET'])
def search_foods():
    """Search foods in dataset"""
    try:
        query = request.args.get('q', '').lower()
        limit = request.args.get('limit', 10, type=int)
        
        if not query:
            return jsonify({'error': 'Query parameter required'}), 400
        
        results = dataset[dataset['food_name'].str.lower().str.contains(query, na=False)].head(limit)
        
        return jsonify({
            'query': query,
            'count': len(results),
            'foods': [
                {
                    'food_name': row['food_name'],
                    'category': row['category'],
                    'calories': row['calories']
                }
                for _, row in results.iterrows()
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/foods/list', methods=['GET'])
def list_foods():
    """List all foods in dataset with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        start = (page - 1) * per_page
        end = start + per_page
        
        foods = dataset.iloc[start:end]
        
        return jsonify({
            'page': page,
            'per_page': per_page,
            'total': len(dataset),
            'foods': [
                {
                    'food_name': row['food_name'],
                    'category': row['category'],
                    'calories': row['calories'],
                    'sugar': row['sugar'],
                    'protein': row['protein']
                }
                for _, row in foods.iterrows()
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': list(models.keys()),
        'dataset_size': len(dataset) if dataset is not None else 0
    })


# ============================================================================
# OCR ENDPOINT - DETECT TEXT AND MATCH WITH DATASET
# ============================================================================

@app.route('/api/ocr/extract', methods=['POST'])
def ocr_extract():
    """
    Extract text from image and match against dataset
    Detects if recognized text corresponds to foods in the dataset
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Use Tesseract via pytesseract for OCR
        try:
            import pytesseract
            from PIL import Image
            import io
            
            # Load image
            image = Image.open(io.BytesIO(file.read()))
            
            # Extract text
            extracted_text = pytesseract.image_to_string(image)
            text_tokens = extracted_text.strip().split()
            
        except:
            # Fallback: use a simple text extraction approach
            return jsonify({
                'extracted_text': '',
                'matched_foods': [],
                'confidence': 0.0,
                'message': 'OCR service unavailable. Please install pytesseract.'
            }), 200
        
        # Match extracted text with dataset
        matched_foods = []
        if dataset is not None and len(text_tokens) > 0:
            for token in text_tokens:
                if len(token) > 2:  # Skip very short tokens
                    token_lower = token.lower()
                    matches = dataset[dataset['food_name'].str.lower().str.contains(token_lower, na=False)]['food_name'].unique()
                    for match in matches[:3]:  # Top 3 matches per token
                        matched_foods.append({
                            'name': match,
                            'token': token,
                            'confidence': 0.85
                        })
        
        # Remove duplicates
        seen_names = set()
        unique_matches = []
        for match in matched_foods:
            if match['name'] not in seen_names:
                unique_matches.append(match)
                seen_names.add(match['name'])
        
        return jsonify({
            'extracted_text': extracted_text.strip(),
            'matched_foods': unique_matches[:5],  # Top 5 matches
            'confidence': min(0.95, len(unique_matches) * 0.2),
            'success': True
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================
# DATABASE ENDPOINTS - USER DATA MANAGEMENT
# ============================================================================

# ----- Authentication Endpoints -----
@app.route('/api/db/auth/signup', methods=['POST'])
def db_signup():
    """Register new user"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').lower().strip()
        name = data.get('name', 'User').strip() or 'User'
        password = data.get('password', '').strip()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Check if user exists
        existing = db.get_user(email)
        if existing:
            return jsonify({'error': 'Email already exists'}), 400
        
        user_id = str(int(__import__('time').time() * 1000))
        
        if db.save_user(user_id, name, email, password):
            return jsonify({'userId': user_id}), 201
        else:
            return jsonify({'error': 'Failed to create account'}), 500
    except Exception as e:
        print(f"[ERROR] Signup: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/auth/signin', methods=['POST'])
def db_signin():
    """Sign in user"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').lower().strip()
        password = data.get('password', '').strip()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        user = db.get_user(email)
        
        if user and user.get('password') == password:
            return jsonify({'userId': user['id']}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        print(f"[ERROR] Signin: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/users', methods=['GET'])
def db_get_all_users():
    """Get all users (admin only)"""
    try:
        users = db.get_all_users()
        return jsonify({'success': True, 'users': users}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----- User Profile Endpoints -----
@app.route('/api/db/profile', methods=['POST'])
def db_save_profile():
    """Save user profile"""
    try:
        data = request.json
        if db.save_user_profile(data.get('email'), data):
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'error': 'Failed to save profile'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/profile/<email>', methods=['GET'])
def db_get_profile(email):
    """Get user profile"""
    try:
        profile = db.get_user_profile(email)
        if profile:
            return jsonify({'success': True, 'profile': profile}), 200
        else:
            return jsonify({'success': False, 'profile': None}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----- Saved Foods Endpoints -----
@app.route('/api/db/saved-foods', methods=['POST'])
def db_save_food():
    """Save food for user"""
    try:
        data = request.json
        if db.save_food(data.get('userId'), data):
            return jsonify({'success': True}), 201
        else:
            return jsonify({'success': False}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/saved-foods/<user_id>', methods=['GET'])
def db_get_saved_foods(user_id):
    """Get saved foods for user"""
    try:
        foods = db.get_saved_foods(user_id)
        return jsonify({'success': True, 'savedFoods': foods}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/saved-foods/<food_id>', methods=['DELETE'])
def db_remove_saved_food(food_id):
    """Remove saved food"""
    try:
        if db.remove_saved_food(food_id):
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----- Feedback Endpoints -----
@app.route('/api/db/feedback', methods=['POST'])
def db_save_feedback():
    """Save feedback ticket"""
    try:
        data = request.json
        if db.save_feedback(data):
            return jsonify({'success': True}), 201
        else:
            return jsonify({'success': False}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/feedback', methods=['GET'])
def db_get_all_feedback():
    """Get all feedback (admin only)"""
    try:
        feedback = db.get_all_feedback()
        return jsonify({'success': True, 'feedback': feedback}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----- Community Endpoints -----
@app.route('/api/db/community', methods=['POST'])
def db_save_community_post():
    """Save community post"""
    try:
        data = request.json
        if db.save_community_post(data.get('authorEmail'), data):
            return jsonify({'success': True}), 201
        else:
            return jsonify({'success': False}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/community', methods=['GET'])
def db_get_all_community():
    """Get all community posts"""
    try:
        posts = db.get_all_community_posts()
        return jsonify({'success': True, 'posts': posts}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/community/<email>', methods=['GET'])
def db_get_user_community(email):
    """Get community posts by user"""
    try:
        posts = db.get_user_community_posts(email)
        return jsonify({'success': True, 'posts': posts}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----- Contact Endpoints -----
@app.route('/api/db/contact', methods=['POST'])
def db_save_contact():
    """Save contact submission"""
    try:
        data = request.json
        if db.save_contact_submission(data):
            return jsonify({'success': True}), 201
        else:
            return jsonify({'success': False}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/contact', methods=['GET'])
def db_get_all_contact():
    """Get all contact submissions (admin only)"""
    try:
        submissions = db.get_all_contact_submissions()
        return jsonify({'success': True, 'submissions': submissions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/db/contact/<email>', methods=['GET'])
def db_get_user_contact(email):
    """Get contact submissions by user"""
    try:
        submissions = db.get_user_contact_submissions(email)
        return jsonify({'success': True, 'submissions': submissions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("=" * 70)
    print("INITIALIZING AI-POWERED FOOD RECOMMENDATION SYSTEM")
    print("=" * 70)
    print(f"\n📊 Using Dataset: {DATASET_SIZE} foods")
    
    # Initialize database
    print("[DB] Initializing SQLite database...")
    init_database()
    print("[DB] Database ready: data/efood.db")
    
    initialize_models()

    print("\n" + "=" * 70)
    print("✅ API RUNNING AT http://localhost:5000")
    print("=" * 70)
    
    print("\n📊 SYSTEM STATUS ENDPOINTS:")
    print("  GET  /api/status              - API and dataset status")
    print("  GET  /api/dataset-info        - Dataset information")
    
    print("\n🔍 QUERY ENDPOINTS:")
    print("  GET  /api/foods/list          - List all foods")
    print("  GET  /api/foods/search        - Search foods")
    
    print("\n💡 RECOMMENDATION ENDPOINTS:")
    print("  GET  /api/recommend/similar/<food_name> - Similar foods")
    print("  POST /api/recommend/by-preferences      - Recommend by preferences")
    
    print("\n🏥 HEALTH ENDPOINTS:")
    print("  POST /api/health/classify     - Classify food health")
    print("  POST /api/score/unhealthy     - Calculate unhealthy score")
    print("  POST /api/ingredients/analyze - Analyze ingredients")
    print("  POST /api/risks/predict       - Predict health risks")
    
    print("\n💬 SENTIMENT ENDPOINTS:")
    print("  POST /api/sentiment/analyze   - Analyze sentiment")
    print("  POST /api/sentiment/batch     - Batch sentiment analysis")
    
    print("\n📋 COMPLETE ANALYSIS:")
    print("  GET  /api/analyze/food/<food_name> - Complete food analysis")
    
    print("\n" + "=" * 70)
    print(f"Start with: curl http://localhost:5000/api/status")
    print("=" * 70 + "\n")
    app.run(debug=True, port=5000)
