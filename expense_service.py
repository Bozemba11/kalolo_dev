import pandas as pd
from src.models.expense import Expense
from src.repositories.expense_repository import ExpenseRepository

class ExpenseService:
    def __init__(self):
        self.repository = ExpenseRepository()
    
    def add_expense(self, amount, category, description=""):
        expense = Expense(amount=amount, category=category, description=description)
        self.repository.save_expense(expense)
    
    def get_all_expenses(self):
        return self.repository.get_all_expenses()
    
    def get_recent_expenses(self, df, limit=5):
        if df.empty:
            return df
        return df.sort_values('date', ascending=False).head(limit)
    
    def get_category_totals(self, df):
        if df.empty:
            return pd.Series()
        return df.groupby('category')['amount'].sum()