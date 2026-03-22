"""
Ingredient Risk Analyzer Module
Uses NLP techniques to analyze ingredients and identify healthy/unhealthy components
"""

import re
from collections import defaultdict
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)


class IngredientAnalyzer:
    """
    Analyzes ingredients using NLP techniques
    
    Algorithm: Keyword Matching + Pattern Recognition
    - Tokenizes ingredient text
    - Compares against predefined healthy and unhealthy ingredient lists
    - Classifies each ingredient
    - Provides risk explanations
    """
    
    def __init__(self):
        """Initialize with healthy and unhealthy ingredient lists"""
        
        # Healthy ingredients
        self.healthy_ingredients = {
            'oats': 'High in fiber, helps regulate blood sugar',
            'almonds': 'Rich in vitamin E and healthy fats',
            'walnuts': 'Omega-3 fatty acids for heart health',
            'flaxseed': 'High fiber and omega-3s',
            'chia seeds': 'Complete protein and fiber',
            'honey': 'Natural sweetener with antioxidants',
            'olive oil': 'Heart-healthy monounsaturated fats',
            'berries': 'Rich in antioxidants and vitamins',
            'spinach': 'Iron and calcium rich leafy green',
            'broccoli': 'Vitamin C and cruciferous cancer-fighting compounds',
            'milk': 'Calcium and vitamin D for bone health',
            'yogurt': 'Probiotics for digestive health',
            'eggs': 'Complete protein and choline for brain health',
            'salmon': 'Omega-3 fatty acids for heart health',
            'whole grain': 'Full spectrum of B vitamins and fiber',
            'beans': 'Protein and fiber for satiety',
            'nuts': 'Healthy fats and minerals',
            'avocado': 'Heart-healthy monounsaturated fats',
            'apple': 'Fiber and vitamin C',
            'carrot': 'Beta-carotene for eye health',
            'chicken': 'Lean protein source',
            'green tea': 'Antioxidants for overall health',
            'lemon': 'Vitamin C and digestive aid',
            'garlic': 'Immune-boosting compounds',
            'ginger': 'Anti-inflammatory properties',
            'cinnamon': 'May help regulate blood sugar',
            'turmeric': 'Curcumin with anti-inflammatory effects'
        }
        
        # Unhealthy ingredients
        self.unhealthy_ingredients = {
            'high fructose corn syrup': {
                'risk': 'Linked to obesity, diabetes, and fatty liver disease',
                'severity': 'High'
            },
            'trans fat': {
                'risk': 'Raises bad cholesterol, increases heart disease risk',
                'severity': 'Critical'
            },
            'palm oil': {
                'risk': 'Saturated fat increases cholesterol and inflammation',
                'severity': 'Medium'
            },
            'artificial color': {
                'risk': 'May cause hyperactivity in children, potential carcinogen',
                'severity': 'Medium'
            },
            'artificial flavor': {
                'risk': 'Chemical compounds with unknown long-term effects',
                'severity': 'Low'
            },
            'sodium benzoate': {
                'risk': 'Preservative that may damage gut bacteria',
                'severity': 'Low'
            },
            'msg': {
                'risk': 'May cause headaches and sensitivity in susceptible people',
                'severity': 'Medium'
            },
            'monosodium glutamate': {
                'risk': 'May cause headaches and sensitivity in susceptible people',
                'severity': 'Medium'
            },
            'bht': {
                'risk': 'Preservative with potential carcinogenic effects',
                'severity': 'Medium'
            },
            'bha': {
                'risk': 'Preservative with potential carcinogenic effects',
                'severity': 'Medium'
            },
            'sodium nitrite': {
                'risk': 'Preservative linked to colorectal cancer risk',
                'severity': 'Medium'
            },
            'hydrogenated': {
                'risk': 'Contains trans fats, raises cholesterol',
                'severity': 'High'
            },
            'aspartame': {
                'risk': 'Artificial sweetener with controversial studies on safety',
                'severity': 'Low'
            },
            'saccharin': {
                'risk': 'Artificial sweetener potentially linked to cancer',
                'severity': 'Medium'
            },
            'yellow 5': {
                'risk': 'Artificial dye may cause allergic reactions',
                'severity': 'Low'
            },
            'red 40': {
                'risk': 'Artificial dye may cause hyperactivity in children',
                'severity': 'Low'
            },
            'blue 1': {
                'risk': 'Artificial dye with potential allergic effects',
                'severity': 'Low'
            },
            'soy lecithin': {
                'risk': 'Often genetically modified, potential allergen',
                'severity': 'Low'
            },
            'sugar': {
                'risk': 'Excess causes diabetes, obesity, and dental problems',
                'severity': 'Medium'
            },
            'salt': {
                'risk': 'Excess increases blood pressure and heart disease risk',
                'severity': 'Medium'
            }
        }
    
    def analyze_ingredients(self, ingredient_text):
        """
        Analyze ingredient text and classify ingredients
        
        Args:
            ingredient_text: Comma or comma-separated string of ingredients
        
        Returns:
            Dictionary with classified ingredients and analysis
        """
        
        # Clean and split ingredients
        if isinstance(ingredient_text, str):
            ingredients = [ing.strip().lower() for ing in ingredient_text.split(',')]
        else:
            ingredients = []
        
        healthy_found = []
        unhealthy_found = []
        unknown = []
        
        # Analyze each ingredient
        for ingredient in ingredients:
            if not ingredient or ingredient == 'unknown':
                continue
            
            # Check against healthy list
            is_healthy = False
            for healthy_ing, benefit in self.healthy_ingredients.items():
                if healthy_ing in ingredient:
                    healthy_found.append({
                        'name': ingredient,
                        'normalized': healthy_ing,
                        'benefit': benefit
                    })
                    is_healthy = True
                    break
            
            if is_healthy:
                continue
            
            # Check against unhealthy list
            is_unhealthy = False
            for unhealthy_ing, info in self.unhealthy_ingredients.items():
                if unhealthy_ing in ingredient:
                    unhealthy_found.append({
                        'name': ingredient,
                        'risk': info['risk'],
                        'severity': info['severity']
                    })
                    is_unhealthy = True
                    break
            
            # If not classified, add to unknown
            if not is_unhealthy and not is_healthy:
                unknown.append(ingredient)
        
        return {
            'all_ingredients': ingredients,
            'healthy_count': len(healthy_found),
            'unhealthy_count': len(unhealthy_found),
            'unknown_count': len(unknown),
            'healthy_ingredients': healthy_found,
            'unhealthy_ingredients': unhealthy_found,
            'unknown_ingredients': unknown,
            'risk_level': self._calculate_risk_level(unhealthy_found),
            'summary': self._generate_summary(healthy_found, unhealthy_found, unknown)
        }
    
    def _calculate_risk_level(self, unhealthy_ingredients):
        """Calculate overall risk level"""
        if not unhealthy_ingredients:
            return 'Safe'
        
        critical = sum(1 for ing in unhealthy_ingredients if ing['severity'] == 'Critical')
        high = sum(1 for ing in unhealthy_ingredients if ing['severity'] == 'High')
        medium = sum(1 for ing in unhealthy_ingredients if ing['severity'] == 'Medium')
        
        if critical > 0:
            return 'Critical'
        elif high > 0:
            return 'High'
        elif medium >= 2:
            return 'Medium'
        elif medium == 1:
            return 'Low'
        else:
            return 'Safe'
    
    def _generate_summary(self, healthy, unhealthy, unknown):
        """Generate human-readable summary"""
        parts = []
        
        if unhealthy:
            severity_count = defaultdict(int)
            for ing in unhealthy:
                severity_count[ing['severity']] += 1
            
            critical = severity_count.get('Critical', 0)
            high = severity_count.get('High', 0)
            medium = severity_count.get('Medium', 0)
            
            if critical > 0:
                parts.append(f"{critical} CRITICAL unhealthy ingredients")
            if high > 0:
                parts.append(f"{high} HIGH risk ingredients")
            if medium > 0:
                parts.append(f"{medium} MEDIUM risk ingredients")
        
        if healthy:
            parts.append(f"Contains {len(healthy)} beneficial ingredients")
        
        return ". ".join(parts) if parts else "No ingredients identified"


if __name__ == "__main__":
    analyzer = IngredientAnalyzer()
    
    # Test analysis
    test_ingredients = "Sugar, High Fructose Corn Syrup, Wheat Flour, Red 40, Milk, Honey, Oats, Almonds"
    
    result = analyzer.analyze_ingredients(test_ingredients)
    
    print(f"\nIngredient Analysis:")
    print(f"Total Ingredients: {len(result['all_ingredients'])}")
    print(f"Healthy: {result['healthy_count']} | Unhealthy: {result['unhealthy_count']} | Unknown: {result['unknown_count']}")
    print(f"Risk Level: {result['risk_level']}")
    
    print(f"\nHealthy Ingredients:")
    for ing in result['healthy_ingredients']:
        print(f"  ✓ {ing['name']}: {ing['benefit']}")
    
    print(f"\nUnhealthy Ingredients:")
    for ing in result['unhealthy_ingredients']:
        print(f"  ✗ {ing['name']} ({ing['severity']}): {ing['risk']}")
    
    print(f"\nSummary: {result['summary']}")
