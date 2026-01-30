import pandas as pd
import os
from src.models.expense import Expense

class ExpenseRepository:
    def __init__(self, csv_path="data/expenses.csv"):
        self.csv_path = csv_path
        self._ensure_data_dir()
    
    def _ensure_data_dir(self):
        os.makedirs(os.path.dirname(self.csv_path), exist_ok=True)
    
    def save_expense(self, expense: Expense):
        df = pd.DataFrame([{
            'date': expense.date,
            'amount': expense.amount,
            'category': expense.category,
            'description': expense.description
        }])
        
        if os.path.exists(self.csv_path):
            df.to_csv(self.csv_path, mode='a', header=False, index=False)
        else:
            df.to_csv(self.csv_path, index=False)
    
    def get_all_expenses(self):
        if os.path.exists(self.csv_path):
            return pd.read_csv(self.csv_path, parse_dates=['date'])
        return pd.DataFrame(columns=['date', 'amount', 'category', 'description'])