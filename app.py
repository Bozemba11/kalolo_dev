import streamlit as st
from src.config import PAGE_TITLE, PAGE_ICON
from src.services.expense_service import ExpenseService
from src.ui.navigation import render_navigation_sidebar
from src.ui.dashboard import render_dashboard
from src.ui.account import render_account_page
from src.ui.analytics import render_analytics_dashboard, render_expense_summary_cards
from src.ui.goals import render_goals_page
from src.ui.education import render_education_center
from src.ui.sidebar import render_sidebar
from src.design_system.colors import get_color, SEMANTIC_COLORS

# Semantic Color System CSS
st.markdown(f"""
<style>
    :root {{
        /* Text Colors */
        --text-primary: {get_color('text.primary', dark_mode=True)};
        --text-secondary: {get_color('text.secondary', dark_mode=True)};
        --text-muted: {get_color('text.muted', dark_mode=True)};
        --text-inverse: {get_color('text.inverse', dark_mode=True)};
        
        /* Background Colors */
        --bg-primary: {get_color('background.primary', dark_mode=True)};
        --bg-secondary: {get_color('background.secondary', dark_mode=True)};
        --bg-tertiary: {get_color('background.tertiary', dark_mode=True)};
        
        /* Interactive Colors */
        --interactive-primary: {get_color('interactive.primary.default')};
        --interactive-primary-hover: {get_color('interactive.primary.hover')};
        --interactive-success: {get_color('interactive.success.default')};
        --interactive-warning: {get_color('interactive.warning.default')};
        --interactive-danger: {get_color('interactive.danger.default')};
        
        /* Financial Colors */
        --financial-positive: {get_color('financial.positive')};
        --financial-negative: {get_color('financial.negative')};
        --financial-neutral: {get_color('financial.neutral')};
        --financial-pending: {get_color('financial.pending')};
    }}
    
    .stApp {{
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }}
    
    .stSidebar {{
        background-color: var(--bg-secondary);
    }}
    
    .stSelectbox > div > div {{
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        border-color: var(--bg-tertiary);
    }}
    
    .stMetric {{
        background-color: var(--bg-secondary);
        padding: 1rem;
        border-radius: 0.75rem;
        border: 1px solid var(--bg-tertiary);
    }}
    
    .stButton > button {{
        background-color: var(--interactive-success);
        color: var(--text-inverse);
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: background-color 0.2s ease;
    }}
    
    .stButton > button:hover {{
        background-color: var(--interactive-primary-hover);
    }}
    
    .stDataFrame {{
        background-color: var(--bg-secondary);
    }}
    
    h1, h2, h3 {{
        color: var(--text-primary);
    }}
    
    /* Financial Status Colors */
    .positive {{ color: var(--financial-positive); }}
    .negative {{ color: var(--financial-negative); }}
    .neutral {{ color: var(--financial-neutral); }}
    .pending {{ color: var(--financial-pending); }}
    
    /* Status Indicators */
    .status-success {{ 
        background-color: rgba(34, 197, 94, 0.1);
        color: var(--interactive-success);
        border: 1px solid rgba(34, 197, 94, 0.2);
    }}
    
    .status-warning {{ 
        background-color: rgba(245, 158, 11, 0.1);
        color: var(--interactive-warning);
        border: 1px solid rgba(245, 158, 11, 0.2);
    }}
    
    .status-danger {{ 
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--interactive-danger);
        border: 1px solid rgba(239, 68, 68, 0.2);
    }}
</style>
""", unsafe_allow_html=True)

st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide")

service = ExpenseService()

# Navigation Sidebar with semantic colors
selected_page = render_navigation_sidebar()

# Show expense form modal if triggered
if st.session_state.get('show_expense_form', False):
    with st.container():
        render_sidebar(service)
    st.session_state.show_expense_form = False

# Page Routing
if selected_page == "🏠 Dashboard":
    render_dashboard(service)
    
elif selected_page == "👤 Account":
    render_account_page()
    
elif selected_page == "📊 Analytics":
    st.header("📊 Advanced Analytics")
    df = service.get_all_expenses()
    render_expense_summary_cards(df)
    st.divider()
    render_analytics_dashboard(df)
    
elif selected_page == "🎯 Goals":
    render_goals_page()
    
elif selected_page == "📚 Learning":
    render_education_center()
    
elif selected_page == "⚙️ Settings":
    st.header("⚙️ Settings")
    st.info("Settings page - Coming soon!")
    
    # Quick settings with semantic colors
    st.subheader("Quick Settings")
    col1, col2 = st.columns(2)
    
    with col1:
        st.selectbox("Default Currency", ["USD", "EUR", "KES"])
        st.selectbox("Date Format", ["MM/DD/YYYY", "DD/MM/YYYY"])
    
    with col2:
        st.checkbox("Dark Mode", value=True)
        st.checkbox("Email Notifications", value=True)