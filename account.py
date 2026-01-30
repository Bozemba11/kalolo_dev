import streamlit as st
from src.models.goal import CreditInfo

def render_account_page():
    """Render account/profile page"""
    
    st.header("👤 Account Profile")
    
    # User Profile Section
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.image("https://via.placeholder.com/150x150/667eea/ffffff?text=User", width=150)
        if st.button("Change Photo"):
            st.info("Photo upload feature coming soon!")
    
    with col2:
        st.subheader("Profile Information")
        
        # Editable profile fields
        name = st.text_input("Full Name", value="John Doe")
        email = st.text_input("Email", value="john@example.com")
        phone = st.text_input("Phone", value="+1 234 567 8900")
        
        if st.button("Update Profile"):
            st.success("Profile updated successfully!")
    
    st.divider()
    
    # Financial Profile
    st.subheader("💳 Financial Profile")
    
    col1, col2, col3 = st.columns(3)
    
    credit_info = CreditInfo()
    
    with col1:
        st.metric("Credit Score", credit_info.score, help=f"Grade: {credit_info.credit_grade}")
    
    with col2:
        st.metric("Credit Utilization", f"{credit_info.utilization:.1%}")
    
    with col3:
        monthly_budget = st.number_input("Monthly Budget ($)", value=2000.0, step=100.0)
        if st.button("Update Budget"):
            st.success(f"Monthly budget set to ${monthly_budget:.2f}")
    
    st.divider()
    
    # Account Settings
    st.subheader("⚙️ Account Settings")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.checkbox("Email Notifications", value=True)
        st.checkbox("SMS Alerts", value=False)
        st.selectbox("Currency", ["USD", "EUR", "GBP", "KES"])
    
    with col2:
        st.selectbox("Language", ["English", "Swahili", "French"])
        st.selectbox("Theme", ["Light", "Dark", "Auto"])
        st.checkbox("Data Export Reminders", value=True)
    
    st.divider()
    
    # Danger Zone
    st.subheader("⚠️ Danger Zone")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("🗑️ Clear All Data", type="secondary"):
            if st.checkbox("I understand this will delete all my data"):
                st.error("Data clearing feature - contact support")
    
    with col2:
        if st.button("❌ Delete Account", type="secondary"):
            st.error("Account deletion - contact support")