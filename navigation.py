import streamlit as st

def render_navigation_sidebar():
    """Render navigation sidebar with main sections"""
    
    with st.sidebar:
        st.title("💰 Fedha Yako")
        st.markdown("---")
        
        # Navigation Menu
        page = st.selectbox(
            "Navigate to:",
            ["🏠 Dashboard", "👤 Account", "📊 Analytics", "🎯 Goals", "📚 Learning", "⚙️ Settings"],
            key="navigation"
        )
        
        st.markdown("---")
        
        # Quick Actions
        st.subheader("⚡ Quick Actions")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("➕ Add Expense", use_container_width=True):
                st.session_state.show_expense_form = True
        
        with col2:
            if st.button("📥 Export Data", use_container_width=True):
                st.session_state.show_export = True
        
        st.markdown("---")
        
        # Quick Stats
        from src.services.expense_service import ExpenseService
        service = ExpenseService()
        df = service.get_all_expenses()
        
        if not df.empty:
            st.subheader("📈 Quick Stats")
            total = df['amount'].sum()
            count = len(df)
            avg = df['amount'].mean()
            
            st.metric("Total Spent", f"${total:.2f}")
            st.metric("Transactions", count)
            st.metric("Average", f"${avg:.2f}")
        
        return page