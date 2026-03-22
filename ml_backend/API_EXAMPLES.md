# API Usage Examples

This document provides comprehensive examples for using the Food Recommendation System API.

## Base URL
```
http://localhost:5000
```

## Authentication
No authentication required for development. For production, implement JWT tokens.

---

## 1. Health & Utility Endpoints

### 1.1 Health Check

**Request:**
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": [
    "recommender",
    "classifier",
    "score_calculator",
    "ingredient_analyzer",
    "risk_predictor",
    "sentiment_analyzer"
  ],
  "dataset_size": 50
}
```

**Python:**
```python
import requests

response = requests.get('http://localhost:5000/api/health')
print(response.json())
```

**JavaScript:**
```javascript
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log(data))
```

---

### 1.2 List Foods (Paginated)

**Request:**
```bash
GET /api/foods/list?page=1&per_page=10
```

**Query Parameters:**
- `page` (integer, default=1): Page number
- `per_page` (integer, default=10): Items per page

**Response:**
```json
{
  "page": 1,
  "per_page": 10,
  "total": 50,
  "foods": [
    {
      "food_name": "Apple",
      "category": "Fruit",
      "calories": 52,
      "sugar": 10.3,
      "protein": 0.3
    },
    {
      "food_name": "Banana",
      "category": "Fruit",
      "calories": 89,
      "sugar": 12.2,
      "protein": 1.1
    }
  ]
}
```

**Python:**
```python
import requests

params = {'page': 1, 'per_page': 5}
response = requests.get('http://localhost:5000/api/foods/list', params=params)
foods = response.json()['foods']
for food in foods:
    print(f"{food['food_name']}: {food['calories']} cal")
```

**JavaScript:**
```javascript
const getFoods = async (page = 1, perPage = 10) => {
  const url = `http://localhost:5000/api/foods/list?page=${page}&per_page=${perPage}`;
  const response = await fetch(url);
  return response.json();
};

getFoods(1, 5).then(data => {
  data.foods.forEach(food => {
    console.log(`${food.food_name}: ${food.calories} cal`);
  });
});
```

---

### 1.3 Search Foods

**Request:**
```bash
GET /api/foods/search?q=apple&limit=10
```

**Query Parameters:**
- `q` (string, required): Search query
- `limit` (integer, default=10): Max results

**Response:**
```json
{
  "query": "apple",
  "count": 1,
  "foods": [
    {
      "food_name": "Apple",
      "category": "Fruit",
      "calories": 52
    }
  ]
}
```

**Python:**
```python
import requests

response = requests.get('http://localhost:5000/api/foods/search', 
                       params={'q': 'apple', 'limit': 5})
results = response.json()
print(f"Found {results['count']} foods")
```

**JavaScript:**
```javascript
const searchFoods = async (query) => {
  const response = await fetch(`http://localhost:5000/api/foods/search?q=${query}`);
  return response.json();
};

searchFoods('salmon').then(data => {
  console.log(`Found ${data.count} foods`);
  data.foods.forEach(food => console.log(food.food_name));
});
```

---

## 2. Recommendation Endpoints

### 2.1 Get Similar Foods

**Request:**
```bash
GET /api/recommend/similar/Apple?top_k=5
```

**Query Parameters:**
- `top_k` (integer, default=5): Number of recommendations

**Response:**
```json
{
  "success": true,
  "food_name": "Apple",
  "top_k": 5,
  "recommendations": [
    {
      "food_name": "Banana",
      "similarity_score": 0.92
    },
    {
      "food_name": "Orange",
      "similarity_score": 0.87
    },
    {
      "food_name": "Strawberry",
      "similarity_score": 0.85
    }
  ]
}
```

**Python:**
```python
import requests

response = requests.get('http://localhost:5000/api/recommend/similar/Apple', 
                       params={'top_k': 3})
data = response.json()

print(f"Similar to {data['food_name']}:")
for rec in data['recommendations']:
    print(f"  - {rec['food_name']} (similarity: {rec['similarity_score']:.2f})")
```

**JavaScript:**
```javascript
const getSimilarFoods = async (foodName, topK = 5) => {
  const url = `http://localhost:5000/api/recommend/similar/${foodName}?top_k=${topK}`;
  const response = await fetch(url);
  return response.json();
};

getSimilarFoods('Apple', 3).then(data => {
  console.log(`Similar to ${data.food_name}:`);
  data.recommendations.forEach(rec => {
    console.log(`  - ${rec.food_name} (${(rec.similarity_score * 100).toFixed(1)}%)`);
  });
});
```

---

### 2.2 Get Recommendations by Preferences

**Request:**
```bash
POST /api/recommend/by-preferences
```

**Request Body:**
```json
{
  "preferences": {
    "max_calories": 200,
    "max_sugar": 15,
    "min_fiber": 2,
    "max_sodium": 300
  },
  "top_k": 5
}
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "max_calories": 200,
    "max_sugar": 15,
    "min_fiber": 2,
    "max_sodium": 300
  },
  "matching_count": 12,
  "recommendations": [
    {
      "food_name": "Broccoli",
      "calories": 34,
      "sugar": 2.2,
      "fiber": 2.4
    }
  ]
}
```

**Python:**
```python
import requests
import json

preferences = {
  "preferences": {
    "max_calories": 200,
    "max_sugar": 15,
    "min_fiber": 2
  },
  "top_k": 5
}

response = requests.post('http://localhost:5000/api/recommend/by-preferences',
                        json=preferences)
data = response.json()
```

**JavaScript:**
```javascript
const getRecommendationsByPreferences = async (preferences, topK = 5) => {
  const response = await fetch('http://localhost:5000/api/recommend/by-preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences,
      top_k: topK
    })
  });
  return response.json();
};

getRecommendationsByPreferences({
  max_calories: 200,
  max_sugar: 15,
  min_fiber: 2
}).then(data => {
  console.log(`Found ${data.matching_count} matching foods`);
});
```

---

## 3. Health Classification Endpoints

### 3.1 Classify Food Health

**Request:**
```bash
POST /api/health/classify
```

**Request Body:**
```json
{
  "calories": 235,
  "sugar": 23,
  "sodium": 70,
  "fat": 16,
  "protein": 3,
  "fiber": 0,
  "additives": "Yellow #5, Red #40",
  "preservatives": "BHA, BHT"
}
```

**Response:**
```json
{
  "classification": "Unhealthy",
  "confidence": 0.87,
  "healthy_prob": 0.13,
  "unhealthy_prob": 0.87
}
```

**Python:**
```python
import requests

food_data = {
    "calories": 235,
    "sugar": 23,
    "sodium": 70,
    "fat": 16,
    "protein": 3,
    "fiber": 0,
    "additives": "Yellow #5",
    "preservatives": "BHA"
}

response = requests.post('http://localhost:5000/api/health/classify',
                        json=food_data)
result = response.json()
print(f"Classification: {result['classification']} ({result['confidence']:.0%})")
```

**JavaScript:**
```javascript
const classifyFood = async (foodData) => {
  const response = await fetch('http://localhost:5000/api/health/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(foodData)
  });
  return response.json();
};

classifyFood({
  calories: 235,
  sugar: 23,
  sodium: 70,
  fat: 16,
  protein: 3,
  fiber: 0,
  additives: "Yellow #5",
  preservatives: "BHA"
}).then(result => {
  console.log(`Class: ${result.classification} (${(result.confidence * 100).toFixed(0)}%)`);
});
```

---

## 4. Unhealthy Score Endpoints

### 4.1 Calculate Unhealthy Percentage

**Request:**
```bash
POST /api/score/unhealthy
```

**Request Body:**
```json
{
  "calories": 235,
  "sugar": 23,
  "sodium": 70,
  "fat": 16,
  "saturated_fat": 8,
  "trans_fat": 0,
  "fiber": 0,
  "additives": "Yes",
  "preservatives": "Yes"
}
```

**Response:**
```json
{
  "unhealthy_percentage": 58,
  "health_rating": "Poor",
  "contributing_factors": [
    {
      "factor": "Trans Fat",
      "impact": 25,
      "description": "Increases risk of heart disease"
    },
    {
      "factor": "Sugar",
      "impact": 20,
      "description": "High sugar content"
    }
  ],
  "summary": "This food has significant health concerns. Recommended intake: occasional only."
}
```

**Python:**
```python
import requests

food_data = {
    "calories": 235,
    "sugar": 23,
    "sodium": 70,
    "fat": 16
}

response = requests.post('http://localhost:5000/api/score/unhealthy',
                        json=food_data)
score = response.json()
print(f"Unhealthy Score: {score['unhealthy_percentage']}%")
print(f"Rating: {score['health_rating']}")
```

**JavaScript:**
```javascript
const calculateScore = async (foodData) => {
  const response = await fetch('http://localhost:5000/api/score/unhealthy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(foodData)
  });
  return response.json();
};

calculateScore({ calories: 235, sugar: 23, sodium: 70, fat: 16 })
  .then(score => {
    console.log(`Score: ${score.unhealthy_percentage}% - ${score.health_rating}`);
    score.contributing_factors.forEach(f => {
      console.log(`  ${f.factor}: +${f.impact}pts`);
    });
  });
```

---

## 5. Ingredient Analysis Endpoints

### 5.1 Analyze Ingredients

**Request:**
```bash
POST /api/ingredients/analyze
```

**Request Body:**
```json
{
  "ingredients": "Sugar, Cocoa, Milk, Vanilla, Yellow #5, Red #40, Artificial Flavor"
}
```

**Response:**
```json
{
  "all_ingredients": [
    "Sugar",
    "Cocoa",
    "Milk",
    "Vanilla",
    "Yellow #5",
    "Red #40",
    "Artificial Flavor"
  ],
  "healthy_ingredients": {
    "Cocoa": "Rich in antioxidants",
    "Milk": "Good source of calcium"
  },
  "healthy_count": 2,
  "unhealthy_ingredients": {
    "Sugar": {
      "risk": "Contributes to obesity and dental cavities",
      "severity": "High"
    },
    "Yellow #5": {
      "risk": "May cause hyperactivity in children",
      "severity": "Medium"
    }
  },
  "unhealthy_count": 4,
  "risk_level": "High",
  "summary": "This product contains several concerning additives and high sugar content."
}
```

**Python:**
```python
import requests

response = requests.post('http://localhost:5000/api/ingredients/analyze',
                        json={
                            "ingredients": "Sugar, Cocoa, HFCS, Yellow #5, MSG"
                        })
analysis = response.json()
print(f"Risk Level: {analysis['risk_level']}")
print(f"Unhealthy: {analysis['unhealthy_count']} ingredients")
```

**JavaScript:**
```javascript
const analyzeIngredients = async (ingredientText) => {
  const response = await fetch('http://localhost:5000/api/ingredients/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients: ingredientText })
  });
  return response.json();
};

analyzeIngredients("Sugar, HFCS, High Fructose Corn Syrup")
  .then(analysis => {
    console.log(`Risk Level: ${analysis.risk_level}`);
    analysis.unhealthy_ingredients.forEach((ing, i) => {
      console.log(`  ${i + 1}. ${ing}`);
    });
  });
```

---

## 6. Health Risk Prediction Endpoints

### 6.1 Predict Health Risks

**Request:**
```bash
POST /api/risks/predict
```

**Request Body:**
```json
{
  "calories": 1500,
  "sugar": 100,
  "sodium": 3000,
  "fat": 50,
  "fiber": 2,
  "ingredients": "Sugar, HFCS, High Fructose Corn Syrup",
  "user_health_conditions": ["diabetes", "hypertension"]
}
```

**Response:**
```json
{
  "total_risks_detected": 4,
  "health_risks": [
    {
      "condition": "Diabetes",
      "severity": "Critical",
      "triggers": [
        "High sugar content (100g)",
        "HFCS detected in ingredients"
      ],
      "recommendation": "Avoid this food if diabetic. Choose low-sugar alternatives."
    },
    {
      "condition": "Obesity",
      "severity": "High",
      "triggers": [
        "High calorie content (1500)"
      ],
      "recommendation": "High caloric density. Monitor portion sizes."
    }
  ],
  "warning_message": "This food poses CRITICAL health risks. Not recommended for diabetic individuals."
}
```

**Python:**
```python
import requests

food_with_context = {
    "calories": 1500,
    "sugar": 100,
    "sodium": 3000,
    "fat": 50,
    "user_health_conditions": ["diabetes"]
}

response = requests.post('http://localhost:5000/api/risks/predict',
                        json=food_with_context)
risks = response.json()
for risk in risks['health_risks']:
    print(f"{risk['condition']}: {risk['severity']}")
```

**JavaScript:**
```javascript
const predictRisks = async (foodData, userConditions = null) => {
  const payload = {
    ...foodData,
    user_health_conditions: userConditions
  };
  const response = await fetch('http://localhost:5000/api/risks/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
};

predictRisks(
  { calories: 1500, sugar: 100, sodium: 3000, fat: 50 },
  ['diabetes', 'hypertension']
).then(risks => {
  console.log(`Detected ${risks.total_risks_detected} risks:`);
  risks.health_risks.forEach(r => {
    console.log(`  - ${r.condition} (${r.severity})`);
  });
});
```

---

## 7. Sentiment Analysis Endpoints

### 7.1 Analyze Sentiment

**Request:**
```bash
POST /api/sentiment/analyze
```

**Request Body:**
```json
{
  "text": "I absolutely love eating these healthy vegetables! They make me feel amazing."
}
```

**Response:**
```json
{
  "text": "I absolutely love eating these healthy vegetables! They make me feel amazing.",
  "sentiment": "Positive",
  "confidence": 0.92,
  "positive_matches": ["love", "healthy", "amazing"],
  "negative_matches": [],
  "summary": "Positive sentiment with strong emotional language."
}
```

**Python:**
```python
import requests

response = requests.post('http://localhost:5000/api/sentiment/analyze',
                        json={
                            "text": "This food makes me feel terrible and unhealthy"
                        })
sentiment = response.json()
print(f"Sentiment: {sentiment['sentiment']} ({sentiment['confidence']:.0%})")
```

**JavaScript:**
```javascript
const analyzeSentiment = async (text) => {
  const response = await fetch('http://localhost:5000/api/sentiment/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.json();
};

analyzeSentiment("I love how healthy and delicious this salad is!")
  .then(result => {
    console.log(`Sentiment: ${result.sentiment} (${(result.confidence * 100).toFixed(0)}%)`);
  });
```

---

### 7.2 Batch Sentiment Analysis

**Request:**
```bash
POST /api/sentiment/batch
```

**Request Body:**
```json
{
  "texts": [
    "I love this healthy food!",
    "This tastes awful and unhealthy",
    "It's okay, nothing special"
  ]
}
```

**Response:**
```json
{
  "texts_processed": 3,
  "results": [
    {
      "text": "I love this healthy food!",
      "sentiment": "Positive",
      "confidence": 0.88
    },
    {
      "text": "This tastes awful and unhealthy",
      "sentiment": "Negative",
      "confidence": 0.85
    },
    {
      "text": "It's okay, nothing special",
      "sentiment": "Neutral",
      "confidence": 0.72
    }
  ]
}
```

**Python:**
```python
import requests

texts = [
    "I love this healthy food!",
    "This is terrible and unhealthy",
    "It's okay"
]

response = requests.post('http://localhost:5000/api/sentiment/batch',
                        json={"texts": texts})
results = response.json()
for result in results['results']:
    print(f"{result['sentiment']}: {result['text']}")
```

**JavaScript:**
```javascript
const analyzeBatchSentiment = async (texts) => {
  const response = await fetch('http://localhost:5000/api/sentiment/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts })
  });
  return response.json();
};

analyzeBatchSentiment([
  "I feel great!",
  "This is bad",
  "It's fine"
]).then(results => {
  results.results.forEach(r => {
    console.log(`${r.sentiment}: "${r.text}"`);
  });
});
```

---

## 8. Comprehensive Analysis Endpoint

### 8.1 Complete Food Analysis

**Request:**
```bash
GET /api/analyze/food/Apple
```

**Response:**
```json
{
  "food_name": "Apple",
  "nutrition": {
    "calories": 52,
    "sugar": 10.3,
    "sodium": 2,
    "fat": 0.2,
    "protein": 0.3,
    "fiber": 2.4
  },
  "classification": {
    "classification": "Healthy",
    "confidence": 0.96,
    "healthy_prob": 0.96,
    "unhealthy_prob": 0.04
  },
  "unhealthy_score": {
    "unhealthy_percentage": 3,
    "health_rating": "Excellent",
    "contributing_factors": []
  },
  "ingredients": {
    "all_ingredients": ["Apple"],
    "healthy_ingredients": {"Apple": "Rich in fiber and vitamin C"},
    "healthy_count": 1,
    "unhealthy_ingredients": {},
    "unhealthy_count": 0,
    "risk_level": "Safe"
  },
  "health_risks": [],
  "recommendations": [
    {
      "food_name": "Banana",
      "similarity_score": 0.92
    },
    {
      "food_name": "Orange",
      "similarity_score": 0.87
    }
  ]
}
```

**Python:**
```python
import requests

response = requests.get('http://localhost:5000/api/analyze/food/Apple')
analysis = response.json()

print(f"=== {analysis['food_name']} ===")
print(f"Classification: {analysis['classification']['classification']}")
print(f"Unhealthy Score: {analysis['unhealthy_score']['unhealthy_percentage']}%")
print(f"Rating: {analysis['unhealthy_score']['health_rating']}")
print(f"Recommendations:")
for rec in analysis['recommendations'][:3]:
    print(f"  - {rec['food_name']}")
```

**JavaScript:**
```javascript
const analyzeFoodComplete = async (foodName) => {
  const response = await fetch(`http://localhost:5000/api/analyze/food/${foodName}`);
  return response.json();
};

analyzeFoodComplete('Apple').then(analysis => {
  console.log(`${analysis.food_name}`);
  console.log(`  Classification: ${analysis.classification.classification}`);
  console.log(`  Unhealthy Score: ${analysis.unhealthy_score.unhealthy_percentage}%`);
  console.log(`  Rating: ${analysis.unhealthy_score.health_rating}`);
});
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Food 'InvalidFood' not found in dataset"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (invalid parameters)
- `404` - Resource not found
- `500` - Server error
- `503` - Service unavailable (model not loaded)

**Python Error Handling:**
```python
import requests

try:
    response = requests.post('http://localhost:5000/api/health/classify',
                            json={'calories': 'invalid'})
    response.raise_for_status()
    data = response.json()
except requests.exceptions.HTTPError as e:
    print(f"Error: {e.response.status_code}")
    print(f"Message: {e.response.json()['error']}")
```

---

## Rate Limiting

Currently no rate limiting. For production, implement:
- Max 100 requests per minute per IP
- Queue system for long-running operations
- Caching for frequently accessed data

---

## Best Practices

1. **Error Handling**: Always check response status codes
2. **Caching**: Cache results for repeated requests
3. **Timeout**: Set request timeouts (30 seconds)
4. **Batch Processing**: Use batch endpoints for multiple items
5. **Validation**: Validate input before sending

---

## Support

For issues or questions, please refer to the README.md or QUICKSTART.py files.
