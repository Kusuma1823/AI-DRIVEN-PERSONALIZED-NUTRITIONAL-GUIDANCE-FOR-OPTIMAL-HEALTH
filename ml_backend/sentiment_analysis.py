"""
Sentiment Analysis Module
Analyzes sentiment of user posts related to healthy lifestyle discussions
"""

from collections import Counter
import re
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)


class SentimentAnalyzer:
    """
    Simple Sentiment Analysis using keyword matching
    
    Algorithm: Lexicon-Based Sentiment Analysis
    - Uses predefined lists of positive, negative, and neutral words
    - Counts occurrences of each sentiment word
    - Analyzes sentence structure (negations, intensifiers)
    - Returns sentiment label: Positive, Neutral, or Negative
    """
    
    def __init__(self):
        """Initialize sentiment lexicons"""
        
        # Positive words for health discussions
        self.positive_words = {
            'healthy', 'great', 'excellent', 'good', 'amazing', 'wonderful',
            'fantastic', 'awesome', 'love', 'favorite', 'best', 'happy',
            'proud', 'motivated', 'energetic', 'fit', 'strong', 'slim',
            'lost weight', 'improved', 'better', 'positive', 'success',
            'achieved', 'accomplished', 'beneficial', 'nutritious', 'organic',
            'fresh', 'delicious', 'enjoyed', 'satisfied', 'grateful',
            'thankful', 'blessed', 'positive', 'thrilled', 'excited',
            'inspired', 'encouraging', 'supportive', 'helpful', 'nice'
        }
        
        # Negative words for health discussions
        self.negative_words = {
            'unhealthy', 'bad', 'terrible', 'horrible', 'awful', 'disgusting',
            'hate', 'dislike', 'worst', 'sick', 'tired', 'fat', 'ugly',
            'sad', 'depressed', 'failed', 'weak', 'pain', 'struggle',
            'difficult', 'hard', 'boring', 'tasteless', 'unhappy',
            'frustrated', 'angry', 'upset', 'worried', 'anxious',
            'stressed', 'exhausted', 'cannot', "can't", 'impossible',
            'avoid', 'regret', 'mistake', 'problem', 'issue', 'concern',
            'warning', 'danger', 'risk', 'dangerous', 'toxic', 'poison'
        }
        
        # Intensifiers
        self.intensifiers = {
            'very', 'really', 'so', 'extremely', 'incredibly', 'absolutely',
            'totally', 'completely', 'definitely', 'surely', 'certainly',
            'quite', 'rather', 'pretty', 'somewhat', 'fairly'
        }
        
        # Negations
        self.negations = {'not', 'no', 'never', "don't", "doesn't", "didn't", "won't", "can't"}
    
    def analyze_sentiment(self, text):
        """
        Analyze sentiment of text
        
        Args:
            text: User-generated text about health/food
        
        Returns:
            Dictionary with sentiment classification and confidence
        """
        
        # Preprocess text
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        positive_score = 0
        negative_score = 0
        neutral_score = 0
        
        positive_matches = []
        negative_matches = []
        
        # Analyze sentiment
        i = 0
        while i < len(words):
            word = words[i]
            
            # Check for negation
            is_negated = i > 0 and words[i-1] in self.negations
            
            # Check for intensifier
            intensity = 1
            if i > 0 and words[i-1] in self.intensifiers:
                intensity = 1.5
            
            if word in self.positive_words:
                score = intensity * (1.5 if is_negated else 1)
                if is_negated:
                    negative_score += score
                    negative_matches.append(f"{word} (negated intensifier)")
                else:
                    positive_score += score
                    positive_matches.append(word)
            
            elif word in self.negative_words:
                score = intensity * (1.5 if is_negated else 1)
                if is_negated:
                    positive_score += score
                    positive_matches.append(f"{word} (negated)")
                else:
                    negative_score += score
                    negative_matches.append(word)
            
            i += 1
        
        # Determine sentiment
        if positive_score > negative_score:
            sentiment = 'Positive'
            confidence = min(positive_score / max(positive_score + negative_score, 1), 1.0)
        elif negative_score > positive_score:
            sentiment = 'Negative'
            confidence = min(negative_score / max(positive_score + negative_score, 1), 1.0)
        else:
            sentiment = 'Neutral'
            confidence = 1.0 if (positive_score + negative_score) == 0 else 0.5
        
        return {
            'text': text,
            'sentiment': sentiment,
            'confidence': round(confidence, 2),
            'positive_score': round(positive_score, 2),
            'negative_score': round(negative_score, 2),
            'positive_words_found': positive_matches[:10],
            'negative_words_found': negative_matches[:10],
            'summary': self._get_summary(sentiment, confidence, positive_score, negative_score)
        }
    
    def _get_summary(self, sentiment, confidence, pos_score, neg_score):
        """Generate summary message"""
        if sentiment == 'Positive':
            return f"This post expresses positive sentiment ({confidence:.0%} confidence) about healthy lifestyle"
        elif sentiment == 'Negative':
            return f"This post expresses negative sentiment ({confidence:.0%} confidence) about healthy lifestyle"
        else:
            return f"This post expresses neutral sentiment about health topics"
    
    def analyze_batch(self, texts):
        """
        Analyze sentiment for multiple texts
        
        Args:
            texts: List of text strings
        
        Returns:
            List of sentiment analysis results
        """
        results = []
        for text in texts:
            results.append(self.analyze_sentiment(text))
        
        return {
            'total_posts': len(texts),
            'positive_count': sum(1 for r in results if r['sentiment'] == 'Positive'),
            'negative_count': sum(1 for r in results if r['sentiment'] == 'Negative'),
            'neutral_count': sum(1 for r in results if r['sentiment'] == 'Neutral'),
            'average_confidence': round(sum(r['confidence'] for r in results) / len(results), 2),
            'results': results
        }


if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    
    # Test samples
    test_posts = [
        "I'm so excited about my healthy lifestyle journey! Started eating organic and feeling amazing!",
        "This diet is terrible and I hate it. Nothing tastes good and I'm always hungry.",
        "I exercise regularly and try to eat healthy food most of the time.",
        "Regular soda is absolutely disgusting. I switched to green tea and never felt better!",
        "Another failed attempt at losing weight. I hate my body and this is impossible."
    ]
    
    print("Individual Sentiment Analysis:")
    for post in test_posts:
        result = analyzer.analyze_sentiment(post)
        print(f"\nPost: {post[:50]}...")
        print(f"Sentiment: {result['sentiment']} ({result['confidence']:.0%} confidence)")
        print(f"Summary: {result['summary']}")
    
    print("\n\nBatch Analysis:")
    batch_result = analyzer.analyze_batch(test_posts)
    print(f"Total Posts: {batch_result['total_posts']}")
    print(f"Positive: {batch_result['positive_count']} | Negative: {batch_result['negative_count']} | Neutral: {batch_result['neutral_count']}")
    print(f"Average Confidence: {batch_result['average_confidence']:.0%}")
