import streamlit as st
import streamlit.components.v1 as components
import os

def render_frontend_dashboard():
    """Render the enhanced HTML/CSS/JS frontend"""
    
    frontend_path = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend')
    html_file = os.path.join(frontend_path, 'index.html')
    
    if os.path.exists(html_file):
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Add components CSS
        components_css_path = os.path.join(frontend_path, 'css', 'components.css')
        if os.path.exists(components_css_path):
            with open(components_css_path, 'r', encoding='utf-8') as f:
                components_css = f.read()
            html_content = html_content.replace('</head>', f'<style>{components_css}</style></head>')
        
        components.html(html_content, height=900, scrolling=True)
    else:
        st.error("Frontend files not found. Please ensure the frontend directory exists.")

def render_enhanced_expense_form():
    """Render an enhanced expense form with voice support"""
    
    form_html = """
    <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-family: 'Inter', sans-serif;">
        <h3 style="color: #667eea; margin-bottom: 24px; font-size: 1.25rem; font-weight: 600;">💰 Add New Expense</h3>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">🎤 Voice Input</label>
            <textarea id="voice-input" placeholder="Say: 'I spent $25 on food for lunch'" 
                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 60px;"></textarea>
            <button type="button" onclick="parseVoice()" 
                style="margin-top: 8px; background: #667eea; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">
                Parse Voice
            </button>
        </div>
        
        <form id="expense-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Amount ($)</label>
                <input type="number" id="amount" step="0.01" required
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease;">
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Category</label>
                <select id="category" required
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background: white;">
                    <option value="food">🍔 Food</option>
                    <option value="transportation">🚗 Transportation</option>
                    <option value="entertainment">🎬 Entertainment</option>
                    <option value="utilities">⚡ Utilities</option>
                    <option value="healthcare">🏥 Healthcare</option>
                    <option value="shopping">🛍️ Shopping</option>
                    <option value="other">📦 Other</option>
                </select>
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Description</label>
                <input type="text" id="description" placeholder="Optional description"
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
            </div>
            
            <button type="button" onclick="addExpense()" 
                style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; transition: all 0.3s ease; margin-top: 8px;">
                ✨ Add Expense
            </button>
        </form>
        
        <div id="notification" style="margin-top: 16px; padding: 12px; border-radius: 6px; display: none;"></div>
    </div>
    
    <script>
        function parseVoice() {
            const text = document.getElementById('voice-input').value.toLowerCase();
            if (!text) return;
            
            const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
            const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
            
            const categories = ['food', 'transportation', 'entertainment', 'utilities', 'healthcare', 'shopping'];
            const category = categories.find(cat => text.includes(cat)) || 'other';
            
            document.getElementById('amount').value = amount;
            document.getElementById('category').value = category;
            document.getElementById('description').value = text.replace(/\$?\d+(?:\.\d{2})?/, '').trim();
            
            showNotification('Voice input parsed successfully!', 'success');
        }
        
        function addExpense() {
            const amount = document.getElementById('amount').value;
            const category = document.getElementById('category').value;
            const description = document.getElementById('description').value;
            
            if (amount && category) {
                window.parent.postMessage({
                    type: 'expense_added',
                    data: { amount: parseFloat(amount), category: category, description: description }
                }, '*');
                
                document.getElementById('expense-form').reset();
                document.getElementById('voice-input').value = '';
                showNotification(`Added $${parseFloat(amount).toFixed(2)} expense for ${category}!`, 'success');
            } else {
                showNotification('Please fill in required fields', 'error');
            }
        }
        
        function showNotification(message, type) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.style.display = 'block';
            notification.style.background = type === 'success' ? '#d1fae5' : '#fee2e2';
            notification.style.color = type === 'success' ? '#065f46' : '#991b1b';
            notification.style.border = `1px solid ${type === 'success' ? '#a7f3d0' : '#fecaca'}`;
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
        
        // Add focus effects
        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('focus', function() {
                this.style.borderColor = '#667eea';
                this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            });
            
            element.addEventListener('blur', function() {
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
            });
        });
    </script>
    """
    
    components.html(form_html, height=500)