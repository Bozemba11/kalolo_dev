import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')

from src.ml.data_processor import DataProcessor
from src.config import MODEL_FILE, MIN_TRAINING_SAMPLES, EXPENSE_CATEGORIES

class BudgetPredictor:
    """
    Advanced ML-based budget predictor with:
    - Robust feature engineering
    - Model persistence and versioning
    - Cross-validation and performance metrics
    - Category-wise and total budget predictions
    - Confidence intervals
    """
    
    def __init__(self, model_path: str = MODEL_FILE):
        """
        Initialize predictor with configurable model path.
        
        Args:
            model_path: Path to save/load the trained model
        """
        self.model_path = model_path
        self.processor = DataProcessor()
        self.is_trained = False
        self.training_metrics = {}
        self.feature_importance = {}
        self.last_trained_date = None
        
        # Enhanced model with better hyperparameters
        self.model = RandomForestRegressor(
            n_estimators=200,           # More trees for better accuracy
            max_depth=15,               # Prevent overfitting
            min_samples_split=5,        # Minimum samples to split node
            min_samples_leaf=2,         # Minimum samples in leaf
            max_features='sqrt',        # Feature sampling strategy
            random_state=42,
            n_jobs=-1,                  # Use all CPU cores
            verbose=0
        )
        
        # Try to load existing model
        self._load_model()
    
    # ========================================================================
    # MODEL PERSISTENCE
    # ========================================================================
    
    def _load_model(self) -> bool:
        """Load pre-trained model from disk if exists"""
        if not os.path.exists(self.model_path):
            return False
        
        try:
            model_data = joblib.load(self.model_path)
            
            # Support both old and new format
            if isinstance(model_data, dict):
                self.model = model_data.get('model', self.model)
                self.is_trained = model_data.get('is_trained', False)
                self.training_metrics = model_data.get('metrics', {})
                self.feature_importance = model_data.get('feature_importance', {})
                self.last_trained_date = model_data.get('last_trained', None)
            else:
                # Old format: just the model
                self.model = model_data
                self.is_trained = True
            
            print(f"✅ Model loaded from {self.model_path}")
            return True
            
        except Exception as e:
            print(f"⚠️ Error loading model: {e}")
            return False
    
    def _save_model(self) -> bool:
        """Save trained model with metadata to disk"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            
            # Save model with metadata
            model_data = {
                'model': self.model,
                'is_trained': self.is_trained,
                'metrics': self.training_metrics,
                'feature_importance': self.feature_importance,
                'last_trained': datetime.now().isoformat(),
                'version': '2.0'
            }
            
            joblib.dump(model_data, self.model_path)
            print(f"✅ Model saved to {self.model_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving model: {e}")
            return False
    
    # ========================================================================
    # TRAINING WITH VALIDATION
    # ========================================================================
    
    def train(self, df: pd.DataFrame, validate: bool = True) -> bool:
        """
        Train the model with comprehensive validation.
        
        Args:
            df: DataFrame with expense history
            validate: Whether to perform cross-validation
            
        Returns:
            True if training successful, False otherwise
        """
        # Validation checks
        if df is None or df.empty:
            print("❌ Cannot train: DataFrame is empty")
            return False
        
        if len(df) < MIN_TRAINING_SAMPLES:
            print(f"❌ Need at least {MIN_TRAINING_SAMPLES} samples. Current: {len(df)}")
            return False
        
        try:
            # Prepare features
            features = self.processor.prepare_features(df)
            
            if features is None or features.empty:
                print("❌ Feature preparation failed")
                return False
            
            # Define feature columns and target
            feature_cols = [
                'month', 'day', 'day_of_week', 'is_weekend',
                'category_encoded', 'week_of_month'
            ]
            
            # Check if all required features exist
            missing_features = [f for f in feature_cols if f not in features.columns]
            if missing_features:
                print(f"❌ Missing features: {missing_features}")
                return False
            
            X = features[feature_cols]
            y = features['amount']
            
            # Remove any NaN values
            mask = ~(X.isna().any(axis=1) | y.isna())
            X = X[mask]
            y = y[mask]
            
            if len(X) < MIN_TRAINING_SAMPLES:
                print(f"❌ After cleaning, only {len(X)} valid samples remain")
                return False
            
            # Train the model
            self.model.fit(X, y)
            self.is_trained = True
            self.last_trained_date = datetime.now()
            
            # Calculate feature importance
            self._calculate_feature_importance(feature_cols)
            
            # Validation metrics
            if validate:
                self._validate_model(X, y)
            
            # Save model
            self._save_model()
            
            print(f"✅ Model trained successfully on {len(X)} samples")
            print(f"📊 R² Score: {self.training_metrics.get('r2_score', 0):.3f}")
            print(f"📊 MAE: ${self.training_metrics.get('mae', 0):.2f}")
            
            return True
            
        except Exception as e:
            print(f"❌ Training error: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _calculate_feature_importance(self, feature_names: List[str]) -> None:
        """Calculate and store feature importance scores"""
        if not self.is_trained:
            return
        
        importances = self.model.feature_importances_
        self.feature_importance = {
            name: float(importance) 
            for name, importance in zip(feature_names, importances)
        }
        
        # Sort by importance
        self.feature_importance = dict(
            sorted(self.feature_importance.items(), 
                   key=lambda x: x[1], 
                   reverse=True)
        )
    
    def _validate_model(self, X: pd.DataFrame, y: pd.Series) -> None:
        """Perform cross-validation and calculate metrics"""
        try:
            # Split data for testing
            if len(X) >= 10:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )
                
                # Retrain on training set
                temp_model = RandomForestRegressor(**self.model.get_params())
                temp_model.fit(X_train, y_train)
                
                # Predictions
                y_pred = temp_model.predict(X_test)
                
                # Calculate metrics
                mae = mean_absolute_error(y_test, y_pred)
                r2 = r2_score(y_test, y_pred)
                
                self.training_metrics['mae'] = float(mae)
                self.training_metrics['r2_score'] = float(r2)
            
            # Cross-validation (if enough data)
            if len(X) >= 20:
                cv_scores = cross_val_score(
                    self.model, X, y, 
                    cv=min(5, len(X) // 4),  # Adaptive CV folds
                    scoring='r2'
                )
                self.training_metrics['cv_mean_r2'] = float(cv_scores.mean())
                self.training_metrics['cv_std_r2'] = float(cv_scores.std())
            
        except Exception as e:
            print(f"⚠️ Validation warning: {e}")
    
    # ========================================================================
    # PREDICTION METHODS
    # ========================================================================
    
    def predict_monthly_budget(
        self, 
        df: pd.DataFrame, 
        by_category: bool = False
    ) -> Dict[str, float]:
        """
        Predict next month's budget.
        
        Args:
            df: Historical expense data
            by_category: If True, return category-wise predictions
            
        Returns:
            Dictionary with predictions
        """
        if not self.is_trained:
            print("⚠️ Model not trained yet")
            return self._fallback_prediction(df)
        
        if df is None or df.empty:
            print("⚠️ No data provided")
            return {"total": 0.0}
        
        try:
            if by_category:
                return self._predict_by_category(df)
            else:
                return self._predict_total(df)
                
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return self._fallback_prediction(df)
    
    def _predict_total(self, df: pd.DataFrame) -> Dict[str, float]:
        """Predict total monthly budget using ML model"""
        # Generate next 30 days
        start_date = datetime.now() + timedelta(days=1)
        future_dates = [start_date + timedelta(days=i) for i in range(30)]
        
        predictions = []
        
        for date in future_dates:
            for category in EXPENSE_CATEGORIES:
                # Create feature vector
                features = self._create_prediction_features(date, category)
                pred = self.model.predict([features])[0]
                predictions.append(max(0, pred))  # No negative predictions
        
        total = sum(predictions)
        daily_avg = total / 30
        
        return {
            "total": float(total),
            "daily_average": float(daily_avg),
            "confidence": self.training_metrics.get('r2_score', 0.5)
        }
    
    def _predict_by_category(self, df: pd.DataFrame) -> Dict[str, float]:
        """Predict budget broken down by category"""
        start_date = datetime.now() + timedelta(days=1)
        future_dates = [start_date + timedelta(days=i) for i in range(30)]
        
        category_predictions = {cat: [] for cat in EXPENSE_CATEGORIES}
        
        for date in future_dates:
            for category in EXPENSE_CATEGORIES:
                features = self._create_prediction_features(date, category)
                pred = self.model.predict([features])[0]
                category_predictions[category].append(max(0, pred))
        
        # Sum predictions for each category
        result = {
            cat: float(sum(preds)) 
            for cat, preds in category_predictions.items()
        }
        
        result['total'] = sum(result.values())
        result['confidence'] = self.training_metrics.get('r2_score', 0.5)
        
        return result
    
    def _create_prediction_features(
        self, 
        date: datetime, 
        category: str
    ) -> List[float]:
        """Create feature vector for a specific date and category"""
        category_encoded = EXPENSE_CATEGORIES.index(category) if category in EXPENSE_CATEGORIES else 0
        
        return [
            date.month,                           # month
            date.day,                             # day
            date.weekday(),                       # day_of_week (0=Monday)
            1 if date.weekday() >= 5 else 0,     # is_weekend
            category_encoded,                     # category_encoded
            (date.day - 1) // 7 + 1              # week_of_month (1-5)
        ]
    
    def _fallback_prediction(self, df: pd.DataFrame) -> Dict[str, float]:
        """Simple average-based prediction when ML model unavailable"""
        if df is None or df.empty:
            return {"total": 0.0, "daily_average": 0.0, "method": "fallback"}
        
        # Calculate historical daily average
        daily_avg = df['Amount'].mean()
        monthly_total = daily_avg * 30
        
        return {
            "total": float(monthly_total),
            "daily_average": float(daily_avg),
            "method": "historical_average",
            "confidence": 0.3  # Low confidence for fallback
        }
    
    # ========================================================================
    # ANALYSIS & INSIGHTS
    # ========================================================================
    
    def get_spending_insights(self, df: pd.DataFrame) -> Dict:
        """Generate insights about spending patterns"""
        if df is None or df.empty:
            return {}
        
        features = self.processor.prepare_features(df)
        
        if features is None or features.empty:
            return {}
        
        insights = {
            "total_expenses": len(df),
            "date_range": {
                "start": str(df['Date'].min()),
                "end": str(df['Date'].max())
            },
            "spending_by_category": df.groupby('Category')['Amount'].sum().to_dict(),
            "average_expense": float(df['Amount'].mean()),
            "median_expense": float(df['Amount'].median()),
            "max_expense": float(df['Amount'].max()),
            "weekend_vs_weekday": self._weekend_weekday_comparison(features),
            "monthly_trend": self._monthly_trend(features)
        }
        
        if self.feature_importance:
            insights["top_predictive_features"] = dict(
                list(self.feature_importance.items())[:3]
            )
        
        return insights
    
    def _weekend_weekday_comparison(self, features: pd.DataFrame) -> Dict:
        """Compare weekend vs weekday spending"""
        try:
            weekend_avg = features[features['is_weekend'] == 1]['amount'].mean()
            weekday_avg = features[features['is_weekend'] == 0]['amount'].mean()
            
            return {
                "weekend_average": float(weekend_avg) if not pd.isna(weekend_avg) else 0.0,
                "weekday_average": float(weekday_avg) if not pd.isna(weekday_avg) else 0.0,
                "difference_pct": float(
                    ((weekend_avg - weekday_avg) / weekday_avg * 100) 
                    if weekday_avg > 0 else 0.0
                )
            }
        except:
            return {}
    
    def _monthly_trend(self, features: pd.DataFrame) -> Dict:
        """Analyze monthly spending trend"""
        try:
            monthly = features.groupby('month')['amount'].sum().to_dict()
            return {int(k): float(v) for k, v in monthly.items()}
        except:
            return {}
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    def get_model_info(self) -> Dict:
        """Get information about the current model state"""
        return {
            "is_trained": self.is_trained,
            "last_trained": self.last_trained_date.isoformat() if self.last_trained_date else None,
            "model_path": self.model_path,
            "n_estimators": self.model.n_estimators,
            "metrics": self.training_metrics,
            "feature_importance": self.feature_importance
        }
    
    def should_retrain(self, days_since_last: int = 7) -> bool:
        """Check if model should be retrained based on age"""
        if not self.is_trained or not self.last_trained_date:
            return True
        
        days_old = (datetime.now() - self.last_trained_date).days
        return days_old >= days_since_last
    
    def reset_model(self) -> None:
        """Reset model to untrained state"""
        self.model = RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            random_state=42,
            n_jobs=-1
        )
        self.is_trained = False
        self.training_metrics = {}
        self.feature_importance = {}
        self.last_trained_date = None
        
        # Delete saved model file
        if os.path.exists(self.model_path):
            os.remove(self.model_path)
            print(f"✅ Model reset and file deleted: {self.model_path}")