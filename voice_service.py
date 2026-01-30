import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime

class VoiceService:
    """Advanced voice-to-expense parser with multi-language and context-aware extraction"""
    
    def __init__(self):
        # Enhanced category keywords with aliases
        self.category_keywords = {
            "Food": [
                "food", "meal", "lunch", "dinner", "breakfast", "brunch",
                "groceries", "grocery", "restaurant", "cafe", "coffee",
                "snack", "eating", "ate", "drink", "pizza", "burger"
            ],
            "Transport": [
                "transport", "transportation", "bus", "taxi", "fare",
                "uber", "lyft", "grab", "train", "subway", "metro",
                "gas", "fuel", "petrol", "parking", "ride", "trip"
            ],
            "Subscriptions": [
                "subscription", "netflix", "spotify", "youtube", "prime",
                "membership", "plan", "service", "streaming", "software"
            ],
            "Rent": [
                "rent", "housing", "apartment", "mortgage", "lease",
                "landlord", "accommodation"
            ],
            "Misc": [
                "entertainment", "movie", "cinema", "music", "game", "gaming",
                "concert", "show", "utilities", "electricity", "water",
                "internet", "wifi", "healthcare", "doctor", "hospital",
                "medicine", "pharmacy", "health", "medical", "shopping",
                "clothes", "clothing", "shoes", "mall", "store", "amazon"
            ]
        }
        
        # Filler words to remove from description
        self.filler_words = {
            "spent", "paid", "bought", "purchased", "got", "ordered",
            "for", "on", "at", "in", "a", "an", "the", "some",
            "my", "i", "we", "today", "yesterday", "just", "about"
        }
        
        # Number words mapping (for voice transcription)
        self.word_to_number = {
            "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4,
            "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9,
            "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13,
            "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17,
            "eighteen": 18, "nineteen": 19, "twenty": 20, "thirty": 30,
            "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70,
            "eighty": 80, "ninety": 90, "hundred": 100, "thousand": 1000
        }
        
        # Currency symbols and keywords
        self.currency_keywords = [
            "dollars?", "bucks?", "usd", "shillings?", "tsh", "tzs",
            "euro?", "eur", "pounds?", "gbp", "¥", "£", "€"
        ]
    
    # ========================================================================
    # AMOUNT EXTRACTION (Enhanced)
    # ========================================================================
    
    def extract_amount(self, text: str) -> float:
        """
        Extract monetary amount from text with support for:
        - Numeric: 50, 50.5, 50.50
        - Currency symbols: $50, £50
        - Shorthand: 8k, 1.5k, 2m
        - Word format: twenty dollars, five hundred
        """
        text = text.lower().replace(",", "")
        
        # Priority 1: Shorthand format (8k, 1.5m)
        amount = self._extract_shorthand_amount(text)
        if amount > 0:
            return amount
        
        # Priority 2: Currency symbol format ($50, £50)
        amount = self._extract_currency_symbol_amount(text)
        if amount > 0:
            return amount
        
        # Priority 3: Numeric with currency word (50 dollars, 20.5 shillings)
        amount = self._extract_numeric_with_currency(text)
        if amount > 0:
            return amount
        
        # Priority 4: Plain numbers
        amount = self._extract_plain_number(text)
        if amount > 0:
            return amount
        
        # Priority 5: Word format (twenty dollars, five hundred)
        amount = self._extract_word_amount(text)
        if amount > 0:
            return amount
        
        return 0.0
    
    def _extract_shorthand_amount(self, text: str) -> float:
        """Extract amounts like 8k, 1.5k, 2m, 500k"""
        patterns = [
            (r'(\d+(?:\.\d+)?)\s*k\b', 1000),      # 8k, 1.5k
            (r'(\d+(?:\.\d+)?)\s*m\b', 1000000),   # 2m, 1.5m
        ]
        
        for pattern, multiplier in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1)) * multiplier
        
        return 0.0
    
    def _extract_currency_symbol_amount(self, text: str) -> float:
        """Extract amounts with currency symbols: $50, £20.5, €100"""
        pattern = r'[$£€¥]\s*(\d+(?:\.\d{1,2})?)'
        match = re.search(pattern, text)
        if match:
            return float(match.group(1))
        return 0.0
    
    def _extract_numeric_with_currency(self, text: str) -> float:
        """Extract: 50 dollars, 20.5 shillings, 100 tsh"""
        currency_pattern = '|'.join(self.currency_keywords)
        pattern = rf'(\d+(?:\.\d{{1,2}})?)\s*(?:{currency_pattern})\b'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
        return 0.0
    
    def _extract_plain_number(self, text: str) -> float:
        """Extract plain decimal numbers: 50, 20.5, 100.00"""
        match = re.search(r'\b(\d+(?:\.\d{1,2})?)\b', text)
        if match:
            return float(match.group(1))
        return 0.0
    
    def _extract_word_amount(self, text: str) -> float:
        """
        Extract word-based amounts: 'twenty dollars', 'five hundred'
        Supports: twenty-five, one hundred fifty
        """
        words = text.split()
        total = 0
        current = 0
        
        for word in words:
            word = word.strip('.,!?;')
            
            if word in self.word_to_number:
                num = self.word_to_number[word]
                
                if num == 100:
                    current = (current or 1) * 100
                elif num == 1000:
                    current = (current or 1) * 1000
                else:
                    current += num
            
            # Check if next word is currency
            elif word in ['dollars', 'dollar', 'bucks', 'shillings']:
                total = current
                break
        
        return float(total) if total > 0 else 0.0
    
    # ========================================================================
    # CATEGORY EXTRACTION (Enhanced with confidence scoring)
    # ========================================================================
    
    def extract_category(self, text: str) -> str:
        """
        Extract category with confidence scoring.
        Returns the category with the highest keyword match count.
        """
        text = text.lower()
        category_scores = {}
        
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                category_scores[category] = score
        
        if not category_scores:
            return "Misc"
        
        # Return category with highest score
        best_category = max(category_scores, key=category_scores.get)
        return best_category
    
    # ========================================================================
    # DESCRIPTION EXTRACTION (Enhanced)
    # ========================================================================
    
    def extract_description(self, text: str, amount: float) -> str:
        """
        Clean and extract meaningful description.
        Removes amounts, currency, and filler words.
        """
        original_text = text
        text = text.lower()
        
        # Remove amount patterns
        text = re.sub(r'\d+(?:\.\d+)?\s*[km]?\b', '', text)
        text = re.sub(r'[$£€¥]\s*\d+(?:\.\d+)?', '', text)
        
        # Remove currency keywords
        currency_pattern = '|'.join(self.currency_keywords)
        text = re.sub(rf'\b(?:{currency_pattern})\b', '', text, flags=re.IGNORECASE)
        
        # Split into words and remove fillers
        words = text.split()
        cleaned_words = [
            word.strip('.,!?;') 
            for word in words 
            if word.strip('.,!?;') and word not in self.filler_words
        ]
        
        description = " ".join(cleaned_words).strip()
        
        # Fallback: if description is empty or too short, use original
        if not description or len(description) < 3:
            # Try to extract noun phrases from original
            description = self._extract_key_phrases(original_text)
        
        return description or "Voice expense"
    
    def _extract_key_phrases(self, text: str) -> str:
        """Extract key noun phrases as fallback description"""
        # Remove common patterns but keep meaningful words
        text = re.sub(r'\d+(?:\.\d+)?[km]?', '', text)
        text = re.sub(r'[$£€¥]\d+', '', text)
        
        words = text.split()
        # Keep words longer than 3 characters that aren't filler
        key_words = [
            w.strip('.,!?;') 
            for w in words 
            if len(w) > 3 and w.lower() not in self.filler_words
        ]
        
        return " ".join(key_words[:5])  # Max 5 words
    
    # ========================================================================
    # MAIN PARSER (Enhanced with validation)
    # ========================================================================
    
    def parse_voice_input(self, text: str) -> Dict[str, any]:
        """
        Main parser that extracts amount, category, and description.
        Returns dict with parsed data and validation status.
        """
        if not text or not text.strip():
            return {
                "success": False,
                "amount": 0.0,
                "category": "Misc",
                "description": "",
                "error": "Empty input"
            }
        
        # Clean input
        text = text.strip()
        
        # Extract components
        amount = self.extract_amount(text)
        category = self.extract_category(text)
        description = self.extract_description(text, amount)
        
        # Validation
        is_valid = amount > 0 and len(description) > 0
        
        return {
            "success": is_valid,
            "amount": amount,
            "category": category,
            "description": description,
            "original_text": text,
            "error": None if is_valid else "Could not parse amount or description"
        }
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    def get_suggestions(self, text: str) -> List[str]:
        """
        Provide helpful suggestions if parsing fails.
        Returns list of example phrases.
        """
        suggestions = [
            "Try: 'Spent 50 dollars on groceries'",
            "Try: 'Paid 20.5 for lunch'",
            "Try: '8k for rent'",
            "Try: 'Bought coffee for 5 bucks'",
            "Try: 'Uber ride 15 dollars'"
        ]
        return suggestions
    
    def validate_result(self, result: Dict) -> Tuple[bool, str]:
        """
        Validate parsed result and return (is_valid, message)
        """
        if not result['success']:
            return False, result.get('error', 'Unknown error')
        
        if result['amount'] <= 0:
            return False, "Amount must be greater than zero"
        
        if result['amount'] > 1000000:
            return False, "Amount seems too large. Please verify."
        
        if len(result['description']) < 2:
            return False, "Description too short"
        
        re