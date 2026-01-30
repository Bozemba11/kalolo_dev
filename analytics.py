import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Attractive color palette with extended colors for custom categories
CATEGORY_COLORS = {
    'food': '#FF6B9D',
    'transportation': '#00D4AA', 
    'entertainment': '#6C5CE7',
    'utilities': '#00CEC9',
    'healthcare': '#FDCB6E',
    'shopping': '#E17055',
    'other': '#A29BFE'
}

CUSTOM_COLORS = ['#FF9F43', '#10AC84', '#5F27CD', '#00D2D3', '#FF6348', '#C44569', '#40407A', '#2C2C54', '#FD79A8', '#FDCB6E']

def render_analytics_dashboard(df):
    """Render enhanced analytics dashboard with attractive colors"""
    
    if df.empty:
        st.info("📊 No data available for analytics. Start adding expenses!")
        return
    
    # Prepare data
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.strftime('%Y-%m')
    df['day_name'] = df['date'].dt.day_name()
    
    # Analytics Tabs
    tab1, tab2, tab3 = st.tabs(["📊 Overview", "📈 Trends", "📋 Detailed Reports"])
    
    with tab1:
        # Key Metrics Row with attractive colors
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            total_expenses = df['amount'].sum()
            st.metric("💰 Total Expenses", f"${total_expenses:.2f}")
        
        with col2:
            avg_expense = df['amount'].mean()
            st.metric("📊 Average Expense", f"${avg_expense:.2f}")
        
        with col3:
            expense_count = len(df)
            st.metric("🔢 Total Transactions", expense_count)
        
        with col4:
            top_category = df.groupby('category')['amount'].sum().idxmax()
            st.metric("🎯 Top Category", top_category.title())
        
        # Charts Row
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("💰 Spending by Category")
            category_totals = df.groupby('category')['amount'].sum().sort_values(ascending=True)
            
            fig = px.bar(
                x=category_totals.values,
                y=category_totals.index,
                orientation='h',
                title="Category Spending Analysis",
                labels={'x': 'Amount ($)', 'y': 'Category'},
                color=category_totals.index,
                color_discrete_map={**CATEGORY_COLORS, **{cat: CUSTOM_COLORS[i % len(CUSTOM_COLORS)] 
                                   for i, cat in enumerate([c for c in category_totals.index if c not in CATEGORY_COLORS])}}
            )
            fig.update_layout(height=400, showlegend=False, plot_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig, use_container_width=True)
            
            # Category CSV Export
            category_df = pd.DataFrame({
                'Category': category_totals.index,
                'Amount': category_totals.values,
                'Percentage': (category_totals.values / category_totals.sum() * 100).round(1)
            })
            
            csv_categories = category_df.to_csv(index=False)
            st.download_button(
                "📥 Download Category Data",
                csv_categories,
                "category_analysis.csv",
                "text/csv"
            )
        
        with col2:
            st.subheader("📅 Recent Activity")
            recent = df.sort_values('date', ascending=False).head(10)
            
            # Format for display
            display_df = recent[['date', 'category', 'amount', 'description']].copy()
            display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
            display_df['amount'] = display_df['amount'].apply(lambda x: f"${x:.2f}")
            
            st.dataframe(display_df, use_container_width=True, hide_index=True)
            
            # Recent Activity CSV Export
            csv_recent = recent.to_csv(index=False)
            st.download_button(
                "📥 Download Recent Activity",
                csv_recent,
                "recent_expenses.csv",
                "text/csv"
            )
    
    with tab2:
        st.subheader("📈 Spending Trends")
        
        # Monthly Trend with gradient
        monthly_spending = df.groupby('month')['amount'].sum().reset_index()
        
        fig = px.area(
            monthly_spending,
            x='month',
            y='amount',
            title='Monthly Spending Trend',
            color_discrete_sequence=['#667eea']
        )
        fig.update_layout(height=400, plot_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig, use_container_width=True)
        
        # Day of Week Analysis
        col1, col2 = st.columns(2)
        
        with col1:
            daily_avg = df.groupby('day_name')['amount'].mean().reindex([
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
            ])
            
            fig = px.bar(
                x=daily_avg.index,
                y=daily_avg.values,
                title='Average Spending by Day of Week',
                color=daily_avg.values,
                color_continuous_scale='sunset'
            )
            fig.update_layout(plot_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Category Distribution Pie Chart
            fig = px.pie(
                values=category_totals.values,
                names=category_totals.index,
                title='Spending Distribution',
                color_discrete_map=CATEGORY_COLORS,
                hole=0.4
            )
            fig.update_traces(textposition='inside', textinfo='percent+label')
            st.plotly_chart(fig, use_container_width=True)
    
    with tab3:
        st.subheader("📋 Detailed Reports")
        
        # Filters
        col1, col2, col3 = st.columns(3)
        
        with col1:
            selected_categories = st.multiselect(
                "Filter by Category",
                options=df['category'].unique(),
                default=df['category'].unique()
            )
        
        with col2:
            min_amount = st.number_input("Minimum Amount", value=0.0, step=0.01)
        
        with col3:
            max_amount = st.number_input("Maximum Amount", value=float(df['amount'].max()), step=0.01)
        
        # Apply filters
        filtered_df = df[
            (df['category'].isin(selected_categories)) &
            (df['amount'] >= min_amount) &
            (df['amount'] <= max_amount)
        ].copy()
        
        # Display filtered data
        if not filtered_df.empty:
            st.write(f"**Showing {len(filtered_df)} transactions**")
            
            # Format for display
            display_filtered = filtered_df[['date', 'category', 'amount', 'description']].copy()
            display_filtered['date'] = display_filtered['date'].dt.strftime('%Y-%m-%d %H:%M')
            display_filtered['amount'] = display_filtered['amount'].apply(lambda x: f"${x:.2f}")
            
            st.dataframe(display_filtered, use_container_width=True, hide_index=True)
            
            # Summary stats with colors
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("💸 Filtered Total", f"${filtered_df['amount'].sum():.2f}")
            with col2:
                st.metric("📊 Filtered Average", f"${filtered_df['amount'].mean():.2f}")
            with col3:
                st.metric("🔢 Transaction Count", len(filtered_df))
            
            # Export filtered data
            csv_filtered = filtered_df.to_csv(index=False)
            st.download_button(
                "📥 Download Filtered Data",
                csv_filtered,
                "filtered_expenses.csv",
                "text/csv",
                use_container_width=True
            )
        else:
            st.warning("No transactions match the selected filters.")

def render_expense_summary_cards(df):
    """Render summary cards with attractive styling"""
    
    if df.empty:
        return
    
    # Calculate metrics
    total_spending = df['amount'].sum()
    avg_daily = df['amount'].mean()
    transaction_count = len(df)
    top_category = df.groupby('category')['amount'].sum().idxmax()
    
    # Create attractive metric cards
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            label="💰 Total Spending",
            value=f"${total_spending:.2f}",
            delta=f"{transaction_count} transactions"
        )
    
    with col2:
        st.metric(
            label="📊 Average Transaction",
            value=f"${avg_daily:.2f}",
            delta="per transaction"
        )
    
    with col3:
        category_count = df['category'].nunique()
        st.metric(
            label="🏷️ Categories Used",
            value=category_count,
            delta=f"out of 7 available"
        )
    
    with col4:
        top_amount = df.groupby('category')['amount'].sum().max()
        st.metric(
            label="🎯 Top Category",
            value=top_category.title(),
            delta=f"${top_amount:.2f}"
        )