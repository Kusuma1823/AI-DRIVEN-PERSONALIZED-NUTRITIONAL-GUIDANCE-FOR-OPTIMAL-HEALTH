"""
Unhealthy Score Calculator Module
Calculates unhealthy percentage of a food item based on nutrition factors
"""

import pandas as pd
import numpy as np
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)


class UnhealthyScoreCalculator:
    """
    Calculates unhealthy percentage (0-100) for a food item
    
    Algorithm: Weighted Penalty Scoring
    - Each unhealthy factor contributes a penalty score
    - Penalties are weighted by health importance
    - Total penalty is converted to 0-100 scale
    
    Factors Considered:
    - High sugar (>10g per serving) - 20 points
    - High sodium (>800mg per item) - 20 points
    - High saturated fat (>7g) - 15 points
    - High trans fat (>0.5g) - 25 points
    - Artificial additives - 10 points
    - Preservatives - 10 points
    - Low fiber (<3g) - 5 points
    """
    
    def __init__(self):
        """Initialize the calculator with penalty weights"""
        self.penalties = {
            'high_sugar': {'threshold': 10, 'weight': 20, 'description': 'High sugar content'},
            'high_sodium': {'threshold': 800, 'weight': 20, 'description': 'High sodium content'},
            'high_fat': {'threshold': 15, 'weight': 15, 'description': 'High unsaturated fat'},
            'high_saturated_fat': {'threshold': 7, 'weight': 15, 'description': 'High saturated fat'},
            'trans_fat': {'threshold': 0.5, 'weight': 25, 'description': 'Contains trans fat'},
            'additives': {'weight': 10, 'description': 'Artificial additives present'},
            'preservatives': {'weight': 10, 'description': 'Preservatives present'},
            'low_fiber': {'threshold': 3, 'weight': 5, 'description': 'Low fiber content'}
        }
        self.max_penalty = sum(p['weight'] for p in self.penalties.values())
    
    def calculate_score(self, food_data):
        """
        Calculate unhealthy percentage for a food item
        
        Args:
            food_data: Dictionary with food nutrition and ingredient info
                Example: {
                    'food_name': 'Donut',
                    'calories': 300,
                    'sugar': 15,
                    'sodium': 250,
                    'fat': 16,
                    'saturated_fat': 8,
                    'trans_fat': 0.5,
                    'fiber': 1,
                    'additives': 'Yellow #5, Red #40',
                    'preservatives': 'Sodium benzoate'
                }
        
        Returns:
            Dictionary with unhealthy score and contributing factors
        """
        total_penalty = 0
        contributing_factors = []
        
        # Check sugar
        sugar = food_data.get('sugar', 0)
        if sugar > self.penalties['high_sugar']['threshold']:
            penalty = self.penalties['high_sugar']['weight']
            total_penalty += penalty
            contributing_factors.append({
                'factor': 'High Sugar',
                'value': f"{sugar}g (threshold: {self.penalties['high_sugar']['threshold']}g)",
                'penalty': penalty
            })
        
        # Check sodium
        sodium = food_data.get('sodium', 0)
        if sodium > self.penalties['high_sodium']['threshold']:
            penalty = self.penalties['high_sodium']['weight']
            total_penalty += penalty
            contributing_factors.append({
                'factor': 'High Sodium',
                'value': f"{sodium}mg (threshold: {self.penalties['high_sodium']['threshold']}mg)",
                'penalty': penalty
            })
        
        # Check fat
        fat = food_data.get('fat', 0)
        if fat > self.penalties['high_fat']['threshold']:
            penalty = self.penalties['high_fat']['weight']
            total_penalty += penalty
            contributing_factors.append({
                'factor': 'High Fat',
                'value': f"{fat}g (threshold: {self.penalties['high_fat']['threshold']}g)",
                'penalty': penalty
            })
        
        # Check saturated fat
        saturated_fat = food_data.get('saturated_fat', 0)
        if saturated_fat > self.penalties['high_saturated_fat']['threshold']:
            penalty = self.penalties['high_saturated_fat']['weight']
            total_penalty += penalty
            contributing_factors.append({
                'factor': 'High Saturated Fat',
                'value': f"{saturated_fat}g (threshold: {self.penalties['high_saturated_fat']['threshold']}g)",
                'penalty': penalty
            })
        
        # Check trans fat
        trans_fat = food_data.get('trans_fat', 0)
        if trans_fat > self.penalties['trans_fat']['threshold']:
            penalty = self.penalties['trans_fat']['weight']
            total_penalty += penalty
            contributing_factors.append({
                'factor': 'Trans Fat Present',
                'value': f"{trans_fat}g (threshold: {self.penalties['trans_fat']['threshold']}g)",
                'penalty': penalty
            })
        
        # Check additives
        additives = food_data.get('additives')
        if additives and additives != 'None' and additives != '':
            penalty = self.penalties['additives']['weight']
            total_penalty += penalty
            contributing_factors.append({
                'factor': 'Artificial Additives',
                'value': additives,
                'penalty': penalty
            })
        
        # Check preservatives
        preservatives = food_data.get('preservatives')
        if preservatives and preservatives != 'None' and preservatives != '':
            penalty = self.penalties['preservatives']['weight']
            total_penalty += penalty
            contributing_factors.append({
                'factor': 'Preservatives',
                'value': preservatives,
                'penalty': penalty
            })
        
        # Check fiber
        fiber = food_data.get('fiber', 0)
        if fiber < self.penalties['low_fiber']['threshold']:
            penalty = self.penalties['low_fiber']['weight']
            total_penalty += penalty
            contributing_factors.append({
                'factor': 'Low Fiber',
                'value': f"{fiber}g (threshold: {self.penalties['low_fiber']['threshold']}g)",
                'penalty': penalty
            })
        
        # Convert penalty to percentage (0-100)
        unhealthy_percentage = min(100, (total_penalty / self.max_penalty) * 100)
        
        return {
            'food_name': food_data.get('food_name', 'Unknown'),
            'unhealthy_percentage': round(unhealthy_percentage, 2),
            'health_rating': self._get_health_rating(unhealthy_percentage),
            'total_penalty_points': total_penalty,
            'max_penalty_points': self.max_penalty,
            'contributing_factors': contributing_factors,
            'summary': self._get_summary(unhealthy_percentage, contributing_factors)
        }
    
    def _get_health_rating(self, percentage):
        """Get health rating based on percentage"""
        if percentage < 20:
            return 'Excellent'
        elif percentage < 40:
            return 'Good'
        elif percentage < 60:
            return 'Fair'
        elif percentage < 80:
            return 'Poor'
        else:
            return 'Very Poor'
    
    def _get_summary(self, percentage, factors):
        """Generate human-readable summary"""
        if percentage < 20:
            return "This is a nutritionally sound choice!"
        elif percentage < 40:
            return "This food has some healthy aspects but could be improved."
        elif percentage < 60:
            return "This food has notable unhealthy factors. Consider alternatives."
        elif percentage < 80:
            return "This food is primarily unhealthy. Consume in moderation."
        else:
            return "This food has significant health concerns. Avoid regular consumption."


if __name__ == "__main__":
    calculator = UnhealthyScoreCalculator()
    
    # Test with sample food
    test_food = {
        'food_name': 'Chocolate Donut',
        'calories': 300,
        'sugar': 18,
        'sodium': 250,
        'fat': 16,
        'saturated_fat': 8,
        'trans_fat': 0.5,
        'fiber': 1,
        'additives': 'Yellow #5, Red #40',
        'preservatives': 'Sodium benzoate'
    }
    
    result = calculator.calculate_score(test_food)
    print(f"\n{result['food_name']}")
    print(f"Unhealthy Percentage: {result['unhealthy_percentage']}%")
    print(f"Health Rating: {result['health_rating']}")
    print(f"\nContributing Factors:")
    for factor in result['contributing_factors']:
        print(f"  - {factor['factor']}: {factor['value']} (+{factor['penalty']} pts)")
    print(f"\nSummary: {result['summary']}")
