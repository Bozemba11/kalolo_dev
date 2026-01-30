import streamlit as st
from src.services.expense_service import ExpenseService
from src.services.voice_service import VoiceService
from src.models.goal import Goal
from datetime import datetime, timedelta

def render_sidebar(service: ExpenseService):
    voice_service = VoiceService()
    
    with st.sidebar:
        # Expense Form
        st.header("Add New Expense")
        
        
        
        # Manual input
        amount = st.number_input("Amount ", 
                               value=getattr(st.session_state, 'voice_amount', 0.01),
                               min_value=0.01, step=0.01)
        
        # Category selection with custom option
        default_categories = ["food", "transportation", "entertainment", "utilities", "healthcare", "shopping"]
        
        # Get existing custom categories from session state
        if 'custom_categories' not in st.session_state:
            st.session_state.custom_categories = []
        
        all_categories = default_categories + st.session_state.custom_categories
        
        # Add new category section
        with st.expander("➕ Add New Category"):
            new_category = st.text_input("Enter new category name:")
            if st.button("Add Category") and new_category:
                if new_category.lower() not in [cat.lower() for cat in all_categories]:
                    st.session_state.custom_categories.append(new_category.lower())
                    st.success(f"Added new category: {new_category}")
                    st.rerun()
                else:
                    st.error("Category already exists!")
        
        # Category selection
        category = st.selectbox("Category", all_categories)
        description = st.text_input("Description", 
                                  value=getattr(st.session_state, 'voice_description', ""))
        
        if st.button("Add Expense"):
            service.add_expense(amount, category, description)
            st.success(f"Added ${amount:.2f} expense for {category}")
            st.rerun()
        
        st.divider()
        
        # Goal Setting Section
        st.header("🎯 Set Financial Goal")
        
        goal_name = st.text_input("Goal Name", placeholder="Emergency Fund")
        goal_amount = st.number_input("Target Amount ($)", min_value=1.0, step=10.0)
        goal_deadline = st.date_input("Target Date", 
                                    value=datetime.now() + timedelta(days=365))
        
        if st.button("Set Goal") and goal_name and goal_amount:
            goal = Goal(
                name=goal_name,
                target_amount=goal_amount,
                deadline=datetime.combine(goal_deadline, datetime.min.time())
            )
            
            # Store goal in session state (in real app, save to database)
            if 'goals' not in st.session_state:
                st.session_state.goals = []
            st.session_state.goals.append(goal)
            
            st.success(f"Goal '{goal_name}' set for ${goal_amount:.2f}!")
        
        # Display current goals
        if 'goals' in st.session_state and st.session_state.goals:
            st.subheader("Current Goals")
            for goal in st.session_state.goals:
                with st.expander(f"{goal.name} - {goal.progress_percentage:.1f}%"):
                    st.progress(goal.progress_percentage / 100)
                    st.write(f"Target: ${goal.target_amount:.2f}")
                    st.write(f"Remaining: ${goal.remaining_amount:.2f}")