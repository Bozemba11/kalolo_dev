from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Expense:
    amount: float
    category: str
    description: Optional[str] = ""
    date: datetime = None
    
    def __post_init__(self):
        if self.date is None:
            self.date = datetime.now()