import streamlit as st
from src.services.expense_service import ExpenseService
from src.services.literacy_service import LiteracyService
from src.models.goal import CreditInfo
from src.ui.components import render_category_chart, render_expense_table
import pandas as pd
import io

def render_dashboard(service: ExpenseService):
    st.title("💰 Fedha Yako")
    
    df = service.get_all_expenses()
    literacy_service = LiteracyService()
    
    # Credit Score Gauge
    credit_info = CreditInfo()
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Credit Score", credit_info.score, help=f"Grade: {credit_info.credit_grade}")
    with col2:
        st.metric("Credit Utilization", f"{credit_info.utilization:.1%}")
    with col3:
        if not df.empty:
            total_spending = df['amount'].sum()
            st.metric("Total Spending", f"${total_spending:.2f}")
        else:
            st.metric("Total Spending", "$0.00")
    
    # Financial Advice
    advice = literacy_service.get_budget_advice(df)
    st.info(advice)
    
    # Analytics Dashboard on Home
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 Recent Activity")
        recent_expenses = service.get_recent_expenses(df)
        
        if not recent_expenses.empty:
            # Display table
            st.dataframe(recent_expenses[['date', 'amount', 'category', 'description']], use_container_width=True)
            
            # CSV Export for Recent Activity
            csv_recent = recent_expenses.to_csv(index=False)
            st.download_button(
                label="📋 Download Recent Activity CSV",
                data=csv_recent,
                file_name="recent_expenses.csv",
                mime="text/csv"
            )
        else:
            st.info("No expenses logged yet. Add one using the sidebar!")
    
    with col2:
        st.subheader("📊 Spending by Category")
        
        if not df.empty:
            category_totals = service.get_category_totals(df)
            
            # Enhanced bar chart with attractive colors
            import plotly.express as px
            
            # Dynamic color mapping for custom categories
            base_colors = {
                'food': "#FFE96B",
                'transportation': "#50EBCC", 
                'entertainment': "#3827C0",
                'utilities': '#00CEC9',
                'healthcare': "#5231E9",
                'shopping': '#E17055',
                'other': "#EE175F"
            }
            
            # Generate colors for custom categories
            custom_colors = ['#FF9F43', '#10AC84', '#5F27CD', '#00D2D3', '#FF6348', '#C44569', '#40407A']
            color_map = base_colors.copy()
            
            custom_idx = 0
            for cat in category_totals.index:
                if cat not in color_map:
                    color_map[cat] = custom_colors[custom_idx % len(custom_colors)]
                    custom_idx += 1
            
            fig = px.bar(
                x=category_totals.index,
                y=category_totals.values,
                title="Category Spending",
                color=category_totals.index,
                color_discrete_map=color_map
            )
            fig.update_layout(showlegend=False, plot_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig, use_container_width=True)
            
            # Show category breakdown table
            category_df = pd.DataFrame({
                'Category': category_totals.index,
                'Amount': category_totals.values,
                'Percentage': (category_totals.values / category_totals.sum() * 100).round(1)
            })
            
            st.dataframe(category_df, use_container_width=True)
            
            # CSV Export for Category Analysis
            csv_categories = category_df.to_csv(index=False)
            st.download_button(
                label="📋 Download Category Analysis CSV",
                data=csv_categories,
                file_name="category_spending.csv",
                mime="text/csv"
            )
        else:
            st.info("No data to display")
    
    # Quick Analytics Summary
    if not df.empty:
        st.divider()
        st.subheader("📈 Quick Analytics")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            total_spending = df['amount'].sum()
            st.metric("💰 Total Spending", f"${total_spending:.2f}")
        
        with col2:
            avg_expense = df['amount'].mean()
            st.metric("📉 Average Expense", f"${avg_expense:.2f}")
        
        with col3:
            expense_count = len(df)
            st.metric("🔢 Total Transactions", expense_count)
        
        with col4:
            categories_used = df['category'].nunique()
            st.metric("🏷️ Categories Used", categories_used)
    
    # Full Data Export
    if not df.empty:
        st.divider()
        col1, col2, col3 = st.columns(3)
        
        with col2:
            # Complete dataset export
            csv_all = df.to_csv(index=False)
            st.download_button(
                label="📦 Download Complete Dataset CSV",
                data=csv_all,
                file_name="all_expenses.csv",
                mime="text/csv",
                use_container_width=True
            )