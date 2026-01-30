from src.models.goal import CreditInfo
import random

class LiteracyService:
    def __init__(self):
        self.tips = [
            "Track every expense, no matter how small",
            "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
            "Pay credit cards in full each month",
            "Build an emergency fund of 3-6 months expenses",
            "Invest early to benefit from compound interest"
        ]
    
    def get_daily_tip(self) -> str:
        return random.choice(self.tips)
    
    def calculate_credit_impact(self, credit_info: CreditInfo, utilization_change: float) -> dict:
        new_utilization = max(0, min(1, credit_info.utilization + utilization_change))
        
        # Simple credit score impact calculation
        score_change = 0
        if utilization_change < 0:  # Reducing utilization
            score_change = abs(utilization_change) * 50
        else:  # Increasing utilization
            score_change = -utilization_change * 30
        
        new_score = max(300, min(850, credit_info.score + score_change))
        
        return {
            "new_score": int(new_score),
            "score_change": int(score_change),
            "new_utilization": new_utilization
        }
    
    def get_budget_advice(self, expenses_df) -> str:
        if expenses_df.empty:
            return "Start tracking your expenses to get personalized advice!"
        
        total_spending = expenses_df['amount'].sum()
        avg_daily = total_spending / len(expenses_df) if len(expenses_df) > 0 else 0
        
        if avg_daily > 50:
            return "Consider reducing daily spending. Small cuts can lead to big savings!"
        elif avg_daily < 20:
            return "Great job keeping expenses low! Consider investing the savings."
        else:
            return "Your spending looks balanced. Keep tracking to maintain control!"