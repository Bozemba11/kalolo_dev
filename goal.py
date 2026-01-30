from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Goal:
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[datetime] = None
    category: str = "general"
    
    @property
    def progress_percentage(self) -> float:
        if self.target_amount == 0:
            return 0
        return min((self.current_amount / self.target_amount) * 100, 100)
    
    @property
    def remaining_amount(self) -> float:
        return max(self.target_amount - self.current_amount, 0)

@dataclass
class CreditInfo:
    score: int = 650
    utilization: float = 0.3
    payment_history: float = 0.95
    
    @property
    def credit_grade(self) -> str:
        if self.score >= 800:
            return "Excellent"
        elif self.score >= 740:
            return "Very Good"
        elif self.score >= 670:
            return "Good"
        elif self.score >= 580:
            return "Fair"
        else:
            return "Poor"