/**
 * Express API Server for Food Recommendation System
 * Provides all ML endpoints for React frontend integration
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Increase payload limit to handle image uploads in community posts
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// ============================================================================
// SAMPLE FOOD DATABASE
// ============================================================================

const foodDatabase = [
  {
    food_id: 1,
    food_name: 'Apple',
    category: 'Fruit',
    calories: 52,
    sugar: 10.3,
    sodium: 2,
    fat: 0.2,
    protein: 0.3,
    fiber: 2.4,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Apple'
  },
  {
    food_id: 2,
    food_name: 'Banana',
    category: 'Fruit',
    calories: 89,
    sugar: 12.2,
    sodium: 358,
    fat: 0.3,
    protein: 1.1,
    fiber: 2.6,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Banana'
  },
  {
    food_id: 3,
    food_name: 'Salmon',
    category: 'Protein',
    calories: 208,
    sugar: 0,
    sodium: 75,
    fat: 13,
    protein: 20,
    fiber: 0,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Salmon'
  },
  {
    food_id: 4,
    food_name: 'Broccoli',
    category: 'Vegetable',
    calories: 34,
    sugar: 2.2,
    sodium: 64,
    fat: 0.4,
    protein: 2.8,
    fiber: 2.4,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Broccoli, Water, Salt'
  },
  {
    food_id: 5,
    food_name: 'Chocolate Bar',
    category: 'Snack',
    calories: 235,
    sugar: 23,
    sodium: 70,
    fat: 16,
    protein: 3,
    fiber: 0,
    additives: 'Yellow #5, Red #40',
    preservatives: 'BHA, BHT',
    ingredients: 'Sugar, Cocoa, Milk, Vanilla, Yellow #5'
  },
  {
    food_id: 6,
    food_name: 'Soda',
    category: 'Beverage',
    calories: 140,
    sugar: 39,
    sodium: 35,
    fat: 0,
    protein: 0,
    fiber: 0,
    additives: 'Caramel Color, Phosphoric Acid',
    preservatives: 'Sodium Benzoate',
    ingredients: 'Water, Sugar, CO2, Phosphoric Acid, Caffeine'
  },
  {
    food_id: 7,
    food_name: 'Spinach',
    category: 'Vegetable',
    calories: 23,
    sugar: 0.4,
    sodium: 24,
    fat: 0.4,
    protein: 2.9,
    fiber: 2.2,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Spinach, Water, Salt'
  },
  {
    food_id: 8,
    food_name: 'Almonds',
    category: 'Nuts',
    calories: 579,
    sugar: 4.4,
    sodium: 12,
    fat: 49.9,
    protein: 21.2,
    fiber: 3.5,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Almonds'
  },
  {
    food_id: 9,
    food_name: 'Burger',
    category: 'Fast Food',
    calories: 354,
    sugar: 8,
    sodium: 508,
    fat: 17.5,
    protein: 17,
    fiber: 0,
    additives: 'Sodium Benzoate',
    preservatives: 'Sodium Benzoate',
    ingredients: 'Beef, Bread, Lettuce, Tomato, Mayo, Salt'
  },
  {
    food_id: 10,
    food_name: 'Yogurt',
    category: 'Dairy',
    calories: 100,
    sugar: 4.7,
    sodium: 161,
    fat: 0.4,
    protein: 10,
    fiber: 0,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Milk, Live Cultures'
  },
  {
    food_id: 11,
    food_name: 'Donut',
    category: 'Dessert',
    calories: 269,
    sugar: 15,
    sodium: 302,
    fat: 17,
    protein: 4,
    fiber: 0,
    additives: 'Artificial Flavor',
    preservatives: 'Sodium Benzoate',
    ingredients: 'Wheat Flour, Sugar, Oil, Eggs, Vanilla'
  },
  {
    food_id: 12,
    food_name: 'Ice Cream',
    category: 'Dessert',
    calories: 207,
    sugar: 21,
    sodium: 52,
    fat: 11,
    protein: 3.5,
    fiber: 0,
    additives: 'Artificial Flavor',
    preservatives: 'Guar Gum',
    ingredients: 'Milk, Sugar, Vanilla, Cream'
  },
  {
    food_id: 13,
    food_name: 'Chickpea Salad',
    category: 'Vegetable',
    calories: 110,
    sugar: 6,
    sodium: 200,
    fat: 3,
    protein: 5,
    fiber: 8.5,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Chickpeas, Tomato, Cucumber, Olive Oil, Lime'
  },
  {
    food_id: 14,
    food_name: 'Whole Wheat Bread',
    category: 'Grain',
    calories: 80,
    sugar: 2,
    sodium: 408,
    fat: 1,
    protein: 4,
    fiber: 2.4,
    additives: 'None',
    preservatives: 'Potassium Sorbate',
    ingredients: 'Whole Wheat, Water, Yeast, Salt'
  },
  {
    food_id: 15,
    food_name: 'Eggs',
    category: 'Protein',
    calories: 155,
    sugar: 0.4,
    sodium: 124,
    fat: 11,
    protein: 13,
    fiber: 0,
    additives: 'None',
    preservatives: 'None',
    ingredients: 'Eggs'
  }
];

// ============================================================================
// SIMILARITY CALCULATION (Cosine Similarity)
// ============================================================================

function calculateSimilarity(food1, food2) {
  const features = ['calories', 'sugar', 'sodium', 'fat', 'protein', 'fiber'];
  
  // Normalize
  const normalized1 = {};
  const normalized2 = {};
  
  features.forEach(f => {
    normalized1[f] = food1[f] || 0;
    normalized2[f] = food2[f] || 0;
  });
  
  // Cosine similarity
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  features.forEach(f => {
    dotProduct += normalized1[f] * normalized2[f];
    magnitude1 += normalized1[f] * normalized1[f];
    magnitude2 += normalized2[f] * normalized2[f];
  });
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return Math.round((dotProduct / (magnitude1 * magnitude2)) * 100) / 100;
}

// ============================================================================
// HEALTH CLASSIFICATION
// ============================================================================

function classifyHealth(food) {
  const score = Math.min(100,
    (food.sugar > 15 ? 20 : 0) +
    (food.sodium > 800 ? 20 : 0) +
    (food.fat > 20 ? 15 : 0) +
    (food.calories > 300 ? 15 : 0) +
    (food.fiber < 1 ? 10 : 0) +
    (food.additives !== 'None' ? 10 : 0) +
    (food.preservatives !== 'None' ? 10 : 0)
  );
  
  const unhealthy = score > 50;
  return {
    classification: unhealthy ? 'Unhealthy' : 'Healthy',
    confidence: unhealthy ? (0.7 + (score / 100) * 0.3) : (1 - score / 100),
    unhealthy_prob: score / 100,
    healthy_prob: 1 - (score / 100)
  };
}

// ============================================================================
// UNHEALTHY SCORE
// ============================================================================

function calculateUnhealthyScore(food) {
  let score = 0;
  const factors = [];
  
  if (food.sugar > 15) {
    score += 20;
    factors.push({
      factor: 'High Sugar',
      impact: 20,
      description: 'May contribute to obesity and diabetes'
    });
  }
  
  if (food.sodium > 800) {
    score += 20;
    factors.push({
      factor: 'High Sodium',
      impact: 20,
      description: 'May increase blood pressure'
    });
  }
  
  if (food.fat > 20) {
    score += 15;
    factors.push({
      factor: 'High Fat',
      impact: 15,
      description: 'May increase cholesterol levels'
    });
  }
  
  if (food.calories > 300) {
    score += 15;
    factors.push({
      factor: 'High Calories',
      impact: 15,
      description: 'High caloric density'
    });
  }
  
  if (food.fiber < 1) {
    score += 5;
    factors.push({
      factor: 'Low Fiber',
      impact: 5,
      description: 'May affect digestive health'
    });
  }
  
  if (food.additives !== 'None') {
    score += 10;
    factors.push({
      factor: 'Artificial Additives',
      impact: 10,
      description: 'May cause allergic reactions or hyperactivity'
    });
  }
  
  if (food.preservatives !== 'None') {
    score += 10;
    factors.push({
      factor: 'Preservatives',
      impact: 10,
      description: 'May have long-term health effects'
    });
  }
  
  score = Math.min(score, 100);
  
  let rating = 'Excellent';
  if (score > 80) rating = 'Very Poor';
  else if (score > 60) rating = 'Poor';
  else if (score > 40) rating = 'Fair';
  else if (score > 20) rating = 'Good';
  
  return {
    unhealthy_percentage: score,
    health_rating: rating,
    contributing_factors: factors,
    summary: score > 70 
      ? 'This food has significant health concerns. Recommended intake: occasional only.'
      : score > 50 
      ? 'This food has some health concerns. Try to balance with healthier options.'
      : 'This is a relatively healthy food option.'
  };
}

// ============================================================================
// INGREDIENT ANALYSIS
// ============================================================================

function analyzeIngredients(ingredientText) {
  const healthyKeywords = ['salmon', 'almonds', 'spinach', 'broccoli', 'yogurt', 'apple', 'banana', 'eggs', 'fiber', 'protein', 'vitamin', 'calcium', 'antioxidants'];
  const unhealthyKeywords = ['hfcs', 'sugar', 'artificial', 'yellow', 'red', 'msg', 'trans fat', 'bha', 'bht', 'sodium benzoate', 'caramel color'];
  
  const ingredients = ingredientText.split(',').map(i => i.trim());
  const healthy = [];
  const unhealthy = [];
  
  ingredients.forEach(ing => {
    const lower = ing.toLowerCase();
    if (healthyKeywords.some(k => lower.includes(k))) {
      healthy.push(ing);
    } else if (unhealthyKeywords.some(k => lower.includes(k))) {
      unhealthy.push(ing);
    }
  });
  
  return {
    all_ingredients: ingredients,
    healthy_ingredients: healthy.length > 0 ? healthy : [],
    healthy_count: healthy.length,
    unhealthy_ingredients: unhealthy.length > 0 ? unhealthy : [],
    unhealthy_count: unhealthy.length,
    risk_level: unhealthy.length > 5 ? 'Critical' : unhealthy.length > 3 ? 'High' : unhealthy.length > 0 ? 'Medium' : 'Safe',
    summary: unhealthy.length > 0 
      ? `This product contains ${unhealthy.length} concerning ingredients.`
      : 'This product contains mostly natural ingredients.'
  };
}

// ============================================================================
// HEALTH RISK PREDICTION
// ============================================================================

function predictHealthRisks(food, userConditions = null) {
  const risks = [];
  
  if (food.sugar > 20) {
    risks.push({
      condition: 'Diabetes',
      severity: 'Critical',
      triggers: [`High sugar content (${food.sugar}g)`],
      recommendation: 'Avoid this food if diabetic. Choose low-sugar alternatives.'
    });
  }
  
  if (food.sodium > 500) {
    risks.push({
      condition: 'Hypertension',
      severity: 'High',
      triggers: [`High sodium content (${food.sodium}mg)`],
      recommendation: 'Monitor sodium intake. Limit to occasional consumption.'
    });
  }
  
  if (food.calories > 200) {
    risks.push({
      condition: 'Obesity',
      severity: 'High',
      triggers: [`High calorie content (${food.calories})`],
      recommendation: 'High caloric density. Monitor portion sizes.'
    });
  }
  
  if (food.fat > 15) {
    risks.push({
      condition: 'Heart Disease',
      severity: 'High',
      triggers: [`High fat content (${food.fat}g)`],
      recommendation: 'May increase risk of cardiovascular disease.'
    });
  }
  
  if (food.sugar > 15 && food.calories > 250) {
    risks.push({
      condition: 'High Cholesterol',
      severity: 'Medium',
      triggers: ['High sugar and calories combined'],
      recommendation: 'May increase cholesterol levels.'
    });
  }
  
  return {
    total_risks_detected: risks.length,
    health_risks: risks,
    warning_message: risks.length > 0 
      ? `This food poses ${risks.length > 2 ? 'multiple' : 'some'} health risk(s).`
      : 'This food has no major health risks.'
  };
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

function analyzeSentiment(text) {
  const positiveWords = ['happy', 'healthy', 'delicious', 'nutritious', 'love', 'great', 'excellent', 'amazing', 'wonderful', 'energized', 'fresh', 'good', 'tasty', 'yummy'];
  const negativeWords = ['unhealthy', 'bad', 'disgusting', 'harmful', 'sick', 'awful', 'terrible', 'hate', 'poor', 'gross', 'toxic', 'dangerous'];
  
  const lower = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lower.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lower.includes(word)) negativeCount++;
  });
  
  const total = positiveCount + negativeCount;
  let sentiment = 'Neutral';
  let confidence = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'Positive';
    confidence = Math.min(0.95, 0.5 + (positiveCount / Math.max(1, total)) * 0.45);
  } else if (negativeCount > positiveCount) {
    sentiment = 'Negative';
    confidence = Math.min(0.95, 0.5 + (negativeCount / Math.max(1, total)) * 0.45);
  }
  
  return {
    text,
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    positive_matches: positiveCount > 0 ? positiveWords.filter(w => lower.includes(w)) : [],
    negative_matches: negativeCount > 0 ? negativeWords.filter(w => lower.includes(w)) : [],
    summary: `${sentiment} sentiment with ${positiveCount + negativeCount} emotional indicators.`
  };
}

// ============================================================================
// ROUTES - UTILITY
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    models_loaded: ['recommender', 'classifier', 'analyzer', 'risk_predictor'],
    dataset_size: foodDatabase.length
  });
});

app.get('/api/foods/list', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.per_page) || 10;
  
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const foods = foodDatabase.slice(start, end);
  
  res.json({
    page,
    per_page: perPage,
    total: foodDatabase.length,
    foods: foods.map(f => ({
      food_name: f.food_name,
      category: f.category,
      calories: f.calories,
      sugar: f.sugar,
      protein: f.protein
    }))
  });
});

app.get('/api/foods/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const limit = parseInt(req.query.limit) || 10;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  
  const results = foodDatabase
    .filter(f => f.food_name.toLowerCase().includes(query))
    .slice(0, limit);
  
  res.json({
    query,
    count: results.length,
    foods: results.map(f => ({
      food_name: f.food_name,
      category: f.category,
      calories: f.calories
    }))
  });
});

// ============================================================================
// ROUTES - RECOMMENDATIONS
// ============================================================================

app.get('/api/recommend/similar/:foodName', (req, res) => {
  const foodName = req.params.foodName;
  const topK = parseInt(req.query.top_k) || 5;
  
  const food = foodDatabase.find(f => f.food_name.toLowerCase() === foodName.toLowerCase());
  
  if (!food) {
    return res.status(404).json({ error: `Food '${foodName}' not found` });
  }
  
  const recommendations = foodDatabase
    .filter(f => f.food_name !== foodName)
    .map(f => ({
      food_name: f.food_name,
      similarity_score: calculateSimilarity(food, f),
      calories: f.calories
    }))
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, topK);
  
  res.json({
    success: true,
    food_name: foodName,
    top_k: topK,
    recommendations
  });
});

// ============================================================================
// ROUTES - ANALYSIS
// ============================================================================

app.post('/api/health/classify', (req, res) => {
  const food = req.body;
  const result = classifyHealth(food);
  res.json(result);
});

app.post('/api/score/unhealthy', (req, res) => {
  const food = req.body;
  const result = calculateUnhealthyScore(food);
  res.json(result);
});

app.post('/api/ingredients/analyze', (req, res) => {
  const ingredients = req.body.ingredients || '';
  const result = analyzeIngredients(ingredients);
  res.json(result);
});

app.post('/api/risks/predict', (req, res) => {
  const food = req.body;
  const userConditions = req.body.user_health_conditions;
  const result = predictHealthRisks(food, userConditions);
  res.json(result);
});

// ============================================================================
// ROUTES - SENTIMENT
// ============================================================================

app.post('/api/sentiment/analyze', (req, res) => {
  const text = req.body.text || '';
  const result = analyzeSentiment(text);
  res.json(result);
});

app.post('/api/sentiment/batch', (req, res) => {
  const texts = req.body.texts || [];
  const results = texts.map(text => analyzeSentiment(text));
  
  res.json({
    texts_processed: texts.length,
    results
  });
});

// ============================================================================
// ROUTES - COMPLETE ANALYSIS
// ============================================================================

app.get('/api/analyze/food/:foodName', (req, res) => {
  const foodName = req.params.foodName;
  
  const food = foodDatabase.find(f => f.food_name.toLowerCase() === foodName.toLowerCase());
  
  if (!food) {
    return res.status(404).json({ error: `Food '${foodName}' not found` });
  }
  
  const classification = classifyHealth(food);
  const unhealthyScore = calculateUnhealthyScore(food);
  const ingredients = analyzeIngredients(food.ingredients);
  const healthRisks = predictHealthRisks(food);
  
  const recommendations = foodDatabase
    .filter(f => f.food_name !== foodName)
    .map(f => ({
      food_name: f.food_name,
      similarity_score: calculateSimilarity(food, f)
    }))
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, 5);
  
  res.json({
    food_name: foodName,
    nutrition: {
      calories: food.calories,
      sugar: food.sugar,
      sodium: food.sodium,
      fat: food.fat,
      protein: food.protein,
      fiber: food.fiber
    },
    classification,
    unhealthy_score: unhealthyScore,
    ingredients,
    health_risks: healthRisks.health_risks,
    recommendations
  });
});

// ============================================================================
// DATABASE SECTION - User Management
// ============================================================================

// In-memory user storage
const users = [];
const profiles = {};
const savedFoods = {};
const feedback = [];
const communities = {};

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

app.post('/api/db/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  const user = { id: Date.now().toString(), name, email, password };
  users.push(user);
  
  res.status(201).json({ 
    success: true, 
    message: 'User created successfully',
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.post('/api/db/auth/signin', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  res.json({ 
    success: true,
    message: 'Login successful',
    userId: user.id,
    user: { id: user.id, name: user.name, email: user.email },
    token: Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
  });
});

app.get('/api/db/users', (req, res) => {
  res.json({ 
    users: users.map(u => ({ id: u.id, name: u.name, email: u.email }))
  });
});

// ============================================================================
// USER PROFILE ENDPOINTS
// ============================================================================

app.post('/api/db/profile', (req, res) => {
  const { email, ...profileData } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  profiles[email] = { ...profileData, email, updatedAt: new Date() };
  res.json({ success: true, profile: profiles[email] });
});

app.get('/api/db/profile/:email', (req, res) => {
  const { email } = req.params;
  
  if (profiles[email]) {
    res.json({ profile: profiles[email] });
  } else {
    res.json({ profile: null });
  }
});

// ============================================================================
// SAVED FOODS ENDPOINTS
// ============================================================================

app.post('/api/db/saved-foods', (req, res) => {
  const { userId, food_name, food_id, ...foodData } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  if (!savedFoods[userId]) {
    savedFoods[userId] = [];
  }
  
  const savedFood = { 
    id: Date.now().toString(), 
    food_id, 
    food_name, 
    ...foodData, 
    savedAt: new Date() 
  };
  
  savedFoods[userId].push(savedFood);
  res.status(201).json({ success: true, savedFood });
});

app.get('/api/db/saved-foods/:userId', (req, res) => {
  const { userId } = req.params;
  const userFoods = savedFoods[userId] || [];
  res.json({ savedFoods: userFoods });
});

app.delete('/api/db/saved-foods/:foodId', (req, res) => {
  const { foodId } = req.params;
  
  let deleted = false;
  for (const userId in savedFoods) {
    const index = savedFoods[userId].findIndex(f => f.id === foodId);
    if (index !== -1) {
      savedFoods[userId].splice(index, 1);
      deleted = true;
      break;
    }
  }
  
  if (deleted) {
    res.json({ success: true, message: 'Food removed from saved foods' });
  } else {
    res.status(404).json({ error: 'Saved food not found' });
  }
});

// ============================================================================
// FEEDBACK ENDPOINTS
// ============================================================================

app.post('/api/db/feedback', (req, res) => {
  const feedbackData = { 
    id: Date.now().toString(), 
    ...req.body, 
    createdAt: new Date() 
  };
  
  feedback.push(feedbackData);
  res.status(201).json({ success: true, feedback: feedbackData });
});

app.get('/api/db/feedback', (req, res) => {
  res.json({ feedback });
});

// ============================================================================
// COMMUNITY ENDPOINTS
// ============================================================================

app.post('/api/db/community', (req, res) => {
  const { userId, authorEmail, caption, imageDataUrl, ...communityData } = req.body;
  
  const post = {
    id: Date.now().toString(),
    userId,
    authorEmail,
    caption,
    imageDataUrl,
    ...communityData,
    createdAt: new Date(),
    likes: 0,
    likedByEmails: [],
    comments: []
  };
  
  communities[post.id] = post;
  res.status(201).json({ success: true, post });
});

app.get('/api/db/community', (req, res) => {
  res.json({ posts: Object.values(communities) });
});

app.put('/api/db/community/:postId/like', (req, res) => {
  const { postId } = req.params;
  const { userEmail } = req.body;
  
  if (!communities[postId]) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const post = communities[postId];
  
  // Initialize likedByEmails if it doesn't exist
  if (!post.likedByEmails) {
    post.likedByEmails = [];
  }
  
  // Check if user already liked
  const alreadyLiked = post.likedByEmails.includes(userEmail);
  
  if (alreadyLiked) {
    // Remove like
    post.likedByEmails = post.likedByEmails.filter(email => email !== userEmail);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // Add like
    post.likedByEmails.push(userEmail);
    post.likes = (post.likes || 0) + 1;
  }
  
  res.json({ success: true, likes: post.likes, liked: !alreadyLiked });
});

app.post('/api/db/community/:postId/comment', (req, res) => {
  const { postId } = req.params;
  const { userEmail, userName, text } = req.body;
  
  if (!communities[postId]) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const comment = {
    id: Date.now().toString(),
    authorEmail: userEmail,
    authorName: userName,
    text,
    createdAt: new Date()
  };
  
  communities[postId].comments.push(comment);
  res.status(201).json({ success: true, comment });
});

// ============================================================================
// CONTACT ENDPOINTS
// ============================================================================

const contactMessages = [];

app.post('/api/db/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const contact = {
    id: Date.now().toString(),
    name,
    email,
    subject,
    message,
    createdAt: new Date()
  };
  
  contactMessages.push(contact);
  res.status(201).json({ success: true, contact });
});

app.get('/api/db/contact', (req, res) => {
  res.json({ contacts: contactMessages });
});

// ============================================================================
// OCR ENDPOINTS
// ============================================================================

app.post('/api/ocr/extract', (req, res) => {
  // For now, return a mock response
  // In production, this would use Tesseract or another OCR service
  res.json({
    extracted_text: 'Sample text extracted from image',
    matched_foods: []
  });
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 FOOD RECOMMENDATION API RUNNING');
  console.log('='.repeat(60));
  console.log(`\n📍 API URL: http://localhost:${PORT}`);
  console.log(`📊 Foods in database: ${foodDatabase.length}`);
  console.log('\n✅ Ready to accept requests from React frontend!');
  console.log('\n' + '='.repeat(60));
});

export default app;
