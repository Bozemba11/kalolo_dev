import streamlit as st
from src.services.literacy_service import LiteracyService
from src.models.goal import CreditInfo

def render_education_center():
    st.header("📚 Learning Center")
    
    literacy_service = LiteracyService()
    
    # Daily Tip Section
    st.subheader("💡 Daily Financial Tip")
    tip = literacy_service.get_daily_tip()
    st.info(tip)
    
    # Credit Score Calculator
    st.subheader("📊 Credit Impact Calculator")
    
    col1, col2 = st.columns(2)
    
    with col1:
        current_score = st.number_input("Current Credit Score", min_value=300, max_value=850, value=650)
        current_utilization = st.slider("Current Credit Utilization", 0.0, 1.0, 0.3, 0.01)
    
    with col2:
        utilization_change = st.slider("Utilization Change", -0.5, 0.5, 0.0, 0.01)
        
        if utilization_change != 0:
            credit_info = CreditInfo(score=current_score, utilization=current_utilization)
            impact = literacy_service.calculate_credit_impact(credit_info, utilization_change)
            
            st.metric(
                "New Credit Score", 
                impact["new_score"], 
                delta=impact["score_change"]
            )
    
    # Financial Education Topics
    st.subheader("📖 Learn More")
    
    topics = {
        "Budgeting Basics": "Learn the fundamentals of creating and maintaining a budget",
        "Credit Management": "Understand how credit scores work and how to improve them",
        "Investment Principles": "Basic investment strategies for beginners",
        "Emergency Funds": "Why you need an emergency fund and how to build one"
    }
    
    for topic, description in topics.items():
        with st.expander(topic):
            st.write(description)
            st.button(f"Learn about {topic}", key=topic)