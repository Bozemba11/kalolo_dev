import streamlit as st
from src.config import PAGE_TITLE, PAGE_ICON
from src.services.expense_service import ExpenseService
from src.ui.sidebar import render_sidebar
from src.ui.dashboard import render_dashboard

# 1. Setup the browser page settings
st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide")

# 2. Start the backend service
service = ExpenseService()

# 3. Draw the UI
render_sidebar(service)
render_dashboard(service)