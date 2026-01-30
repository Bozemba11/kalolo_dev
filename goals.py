import streamlit as st
from src.models.goal import Goal
from datetime import datetime, timedelta

def render_goals_page():
    """Render goals management page"""
    
    st.header("🎯 Financial Goals")
    
    # Add New Goal Section
    with st.expander("➕ Add New Goal", expanded=False):
        col1, col2 = st.columns(2)
        
        with col1:
            goal_name = st.text_input("Goal Name", placeholder="Emergency Fund")
            goal_amount = st.number_input("Target Amount ($)", min_value=1.0, step=10.0)
        
        with col2:
            goal_category = st.selectbox("Goal Type", [
                "Emergency Fund", "Vacation", "Car Purchase", 
                "Home Down Payment", "Education", "Retirement", "Other"
            ])
            goal_deadline = st.date_input("Target Date", 
                                        value=datetime.now() + timedelta(days=365))
        
        goal_description = st.text_area("Description (Optional)", 
                                       placeholder="Describe your goal...")
        
        if st.button("🎯 Create Goal") and goal_name and goal_amount:
            goal = Goal(
                name=goal_name,
                target_amount=goal_amount,
                deadline=datetime.combine(goal_deadline, datetime.min.time()),
                category=goal_category
            )
            
            # Store goal in session state
            if 'goals' not in st.session_state:
                st.session_state.goals = []
            st.session_state.goals.append(goal)
            
            st.success(f"Goal '{goal_name}' created successfully!")
            st.rerun()
    
    st.divider()
    
    # Display Current Goals
    if 'goals' in st.session_state and st.session_state.goals:
        st.subheader("📋 Your Goals")
        
        for i, goal in enumerate(st.session_state.goals):
            with st.container():
                col1, col2, col3 = st.columns([2, 1, 1])
                
                with col1:
                    st.write(f"**{goal.name}**")
                    progress = goal.progress_percentage
                    st.progress(progress / 100)
                    st.write(f"${goal.current_amount:.2f} / ${goal.target_amount:.2f} ({progress:.1f}%)")
                
                with col2:
                    st.write("**Add Progress**")
                    add_amount = st.number_input(f"Amount ($)", min_value=0.01, step=1.0, key=f"add_{i}")
                    if st.button("➕ Add", key=f"btn_{i}"):
                        st.session_state.goals[i].current_amount += add_amount
                        st.success(f"Added ${add_amount:.2f} to {goal.name}!")
                        st.rerun()
                
                with col3:
                    st.write("**Status**")
                    if progress >= 100:
                        st.success("🎉 Completed!")
                    elif progress >= 75:
                        st.info("🔥 Almost there!")
                    elif progress >= 50:
                        st.warning("📈 Good progress")
                    else:
                        st.error("🚀 Just started")
                    
                    if st.button("🗑️", key=f"del_{i}", help="Delete goal"):
                        st.session_state.goals.pop(i)
                        st.rerun()
                
                st.divider()
    
    else:
        st.info("🎯 No goals set yet. Create your first financial goal above!")
        
        # Goal suggestions
        st.subheader("💡 Goal Suggestions")
        
        suggestions = [
            {"name": "Emergency Fund", "amount": 5000, "desc": "3-6 months of expenses"},
            {"name": "Vacation Fund", "amount": 2000, "desc": "Dream vacation savings"},
            {"name": "New Car", "amount": 15000, "desc": "Down payment for a car"},
            {"name": "Education Fund", "amount": 10000, "desc": "Skill development or courses"}
        ]
        
        cols = st.columns(2)
        for i, suggestion in enumerate(suggestions):
            with cols[i % 2]:
                with st.container():
                    st.write(f"**{suggestion['name']}**")
                    st.write(f"Target: ${suggestion['amount']:,}")
                    st.write(suggestion['desc'])
                    if st.button(f"Use This Goal", key=f"suggest_{i}"):
                        st.session_state.suggested_goal = suggestion
                        st.rerun()