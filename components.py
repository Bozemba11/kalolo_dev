import streamlit as st

def render_category_chart(category_totals):
    if category_totals.empty:
        st.info("No data to display")
        return
    
    st.bar_chart(category_totals)

def render_expense_table(df):
    if df.empty:
        st.info("No expenses logged yet")
        return
    
    st.dataframe(df, use_container_width=True)