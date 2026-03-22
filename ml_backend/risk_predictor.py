"""
Health Risk Predictor Module
Predicts possible health risks based on food composition
"""

from collections import defaultdict
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)


class HealthRiskPredictor:
    """
    Predicts health risks based on food nutrition and ingredients
    
    Algorithm: Rule-Based Risk Detection
    - Analyzes nutrition values against health thresholds
    - Identifies ingredient-based risks
    - Cross-references with common health conditions
    - Returns warnings for detected risks
    """
    
    def __init__(self):
        """Initialize risk detection rules"""
        self.risk_conditions = {
            'diabetes': {
                'triggers': [
                    {'factor': 'high_sugar', 'threshold': 12, 'weight': 3},
                    {'factor': 'high_calories', 'threshold': 400, 'weight': 2},
                    {'factor': 'low_fiber', 'threshold': 3, 'weight': 2},
                    {'factor': 'artificial_sweeteners', 'weight': 1}
                ],
                'description': 'High sugar and low fiber can spike blood glucose'
            },
            'hypertension': {
                'triggers': [
                    {'factor': 'high_sodium', 'threshold': 1200, 'weight': 3},
                    {'factor': 'high_saturated_fat', 'threshold': 10, 'weight': 2}
                ],
                'description': 'Excess sodium increases blood pressure'
            },
            'obesity': {
                'triggers': [
                    {'factor': 'high_calories', 'threshold': 400, 'weight': 2},
                    {'factor': 'high_fat', 'threshold': 20, 'weight': 2},
                    {'factor': 'high_sugar', 'threshold': 10, 'weight': 2},
                    {'factor': 'low_fiber', 'threshold': 3, 'weight': 1}
                ],
                'description': 'High calorie, fat, and sugar increase obesity risk'
            },
            'heart_disease': {
                'triggers': [
                    {'factor': 'high_saturated_fat', 'threshold': 7, 'weight': 3},
                    {'factor': 'trans_fat', 'threshold': 0.3, 'weight': 3},
                    {'factor': 'high_sodium', 'threshold': 1200, 'weight': 2},
                    {'factor': 'high_cholesterol', 'threshold': 100, 'weight': 2}
                ],
                'description': 'Saturated fat and cholesterol increase heart disease risk'
            },
            'high_cholesterol': {
                'triggers': [
                    {'factor': 'high_saturated_fat', 'threshold': 7, 'weight': 3},
                    {'factor': 'trans_fat', 'threshold': 0.3, 'weight': 3},
                    {'factor': 'high_cholesterol', 'threshold': 80, 'weight': 2}
                ],
                'description': 'Saturated fats raise LDL (bad) cholesterol'
            },
            'fatty_liver': {
                'triggers': [
                    {'factor': 'high_sugar', 'threshold': 15, 'weight': 3},
                    {'factor': 'high_fructose', 'threshold': 10, 'weight': 3},
                    {'factor': 'high_calories', 'threshold': 500, 'weight': 2}
                ],
                'description': 'Excess sugar and calories increase fat accumulation in liver'
            },
            'dental_disease': {
                'triggers': [
                    {'factor': 'high_sugar', 'threshold': 10, 'weight': 3},
                    {'factor': 'acidic', 'weight': 2}
                ],
                'description': 'Sugar feeds bacteria that cause tooth decay'
            },
            'lactose_intolerance': {
                'triggers': [
                    {'factor': 'contains_dairy', 'weight': 3}
                ],
                'description': 'Contains milk products which may cause issues'
            }
        }
    
    def predict_health_risks(self, food_data, user_health_conditions=None):
        """
        Predict health risks for a food item
        
        Args:
            food_data: Dictionary with food nutrition data
                Example: {
                    'food_name': 'Soda',
                    'calories': 140,
                    'sugar': 39,
                    'sodium': 35,
                    'fat': 0,
                    'saturated_fat': 0,
                    'trans_fat': 0,
                    'fiber': 0,
                    'ingredients': 'Water, Sugar, CO2, Caffeine'
                }
            user_health_conditions: List of user's existing health conditions
        
        Returns:
            Dictionary with identified health risks and severity
        """
        
        risks_detected = []
        risk_scores = defaultdict(lambda: {'score': 0, 'triggers_hit': []})
        
        # Extract nutrition values
        calories = food_data.get('calories', 0)
        sugar = food_data.get('sugar', 0)
        sodium = food_data.get('sodium', 0)
        fat = food_data.get('fat', 0)
        saturated_fat = food_data.get('saturated_fat', 0)
        trans_fat = food_data.get('trans_fat', 0)
        fiber = food_data.get('fiber', 0)
        cholesterol = food_data.get('cholesterol', 0)
        ingredients = food_data.get('ingredients', '').lower()
        
        # Check each health condition
        for condition, risk_config in self.risk_conditions.items():
            score = 0
            triggers_hit = []
            
            for trigger in risk_config['triggers']:
                factor = trigger['factor']
                weight = trigger['weight']
                
                # Check triggers
                if factor == 'high_sugar' and sugar > trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"Sugar {sugar}g (threshold: {trigger['threshold']}g)")
                
                elif factor == 'high_calories' and calories > trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"Calories {calories} (threshold: {trigger['threshold']})")
                
                elif factor == 'low_fiber' and fiber < trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"Low fiber {fiber}g (threshold: {trigger['threshold']}g)")
                
                elif factor == 'high_sodium' and sodium > trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"Sodium {sodium}mg (threshold: {trigger['threshold']}mg)")
                
                elif factor == 'high_saturated_fat' and saturated_fat > trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"Saturated fat {saturated_fat}g (threshold: {trigger['threshold']}g)")
                
                elif factor == 'trans_fat' and trans_fat > trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"Trans fat {trans_fat}g (threshold: {trigger['threshold']}g)")
                
                elif factor == 'high_fat' and fat > trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"Total fat {fat}g (threshold: {trigger['threshold']}g)")
                
                elif factor == 'high_cholesterol' and cholesterol > trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"Cholesterol {cholesterol}mg (threshold: {trigger['threshold']}mg)")
                
                elif factor == 'artificial_sweeteners' and 'aspartame' in ingredients or 'saccharin' in ingredients:
                    score += weight
                    triggers_hit.append("Contains artificial sweeteners")
                
                elif factor == 'high_fructose' and sugar > trigger['threshold']:
                    score += weight
                    triggers_hit.append(f"High fructose content {sugar}g")
                
                elif factor == 'contains_dairy' and ('milk' in ingredients or 'cheese' in ingredients or 'yogurt' in ingredients):
                    score += weight
                    triggers_hit.append("Contains dairy products")
                
                elif factor == 'acidic' and any(word in ingredients for word in ['citric acid', 'vinegar', 'lemon', 'lime']):
                    score += weight
                    triggers_hit.append("Contains acidic ingredients")
            
            if score > 0:
                risk_scores[condition]['score'] = score
                risk_scores[condition]['triggers_hit'] = triggers_hit
        
        # Convert scores to risk levels
        for condition, data in risk_scores.items():
            score = data['score']
            
            if score >= 6:
                severity = 'Critical'
            elif score >= 4:
                severity = 'High'
            elif score >= 2:
                severity = 'Medium'
            else:
                severity = 'Low'
            
            risks_detected.append({
                'condition': condition.replace('_', ' ').title(),
                'severity': severity,
                'score': score,
                'description': self.risk_conditions[condition]['description'],
                'triggers': data['triggers_hit']
            })
        
        # Sort by severity
        severity_order = {'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3}
        risks_detected.sort(key=lambda x: severity_order[x['severity']])
        
        # Filter by user's health conditions if provided
        if user_health_conditions:
            relevant_risks = [r for r in risks_detected if r['condition'].lower() in [c.lower() for c in user_health_conditions]]
        else:
            relevant_risks = risks_detected
        
        return {
            'food_name': food_data.get('food_name', 'Unknown'),
            'total_risks_detected': len([r for r in risks_detected if r['severity'] in ['Critical', 'High']]),
            'health_risks': relevant_risks[:5],  # Top 5 risks
            'warning': self._generate_warning(risks_detected)
        }
    
    def _generate_warning(self, risks):
        """Generate overall warning message"""
        critical_risks = [r for r in risks if r['severity'] == 'Critical']
        high_risks = [r for r in risks if r['severity'] == 'High']
        
        if critical_risks:
            return f"[WARNING] CRITICAL HEALTH RISKS ({len(critical_risks)} conditions). Avoid or consume very rarely."
        elif high_risks:
            return f"[WARNING] Health risk for {len(high_risks)} health conditions. Consume in moderation."
        elif risks:
            return "This food may have some health considerations. Monitor consumption."
        else:
            return "[OK] No significant health risks detected."


if __name__ == "__main__":
    predictor = HealthRiskPredictor()
    
    # Test with sample food
    test_food = {
        'food_name': 'Regular Soda (12oz)',
        'calories': 140,
        'sugar': 39,
        'sodium': 35,
        'fat': 0,
        'saturated_fat': 0,
        'trans_fat': 0,
        'fiber': 0,
        'cholesterol': 0,
        'ingredients': 'water, sugar, carbonated water, phosphoric acid, caffeine'
    }
    
    result = predictor.predict_health_risks(test_food)
    
    print(f"\nHealth Risk Assessment: {result['food_name']}")
    print(f"Total Risks: {result['total_risks_detected']}")
    print(f"\nWarning: {result['warning']}")
    
    print(f"\nDetailed Risks:")
    for risk in result['health_risks']:
        print(f"\n  {risk['condition']} ({risk['severity']})")
        print(f"  Description: {risk['description']}")
        print(f"  Triggers:")
        for trigger in risk['triggers']:
            print(f"    - {trigger}")
