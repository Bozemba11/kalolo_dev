class BudgetTracker {
    constructor() {
        this.expenses = [];
        this.goals = [];
        this.creditInfo = { score: 650, utilization: 0.3, paymentHistory: 0.95 };
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.renderExpenseForm();
        this.renderGoalForm();
        this.renderDashboard();
        this.renderEducationCenter();
        this.loadData();
        this.startDailyTipRotation();
    }

    setupNavigation() {
        const navHTML = `
            <div class="nav-tabs">
                <button class="nav-tab active" onclick="app.switchTab('dashboard')">
                    📊 Dashboard
                </button>
                <button class="nav-tab" onclick="app.switchTab('education')">
                    📚 Learning Center
                </button>
            </div>
        `;
        document.querySelector('.dashboard').insertAdjacentHTML('afterbegin', navHTML);
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update nav buttons
        document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Show/hide content
        document.getElementById('dashboard-content').style.display = tab === 'dashboard' ? 'block' : 'none';
        document.getElementById('education-content').style.display = tab === 'education' ? 'block' : 'none';
    }

    renderExpenseForm() {
        const formHTML = `
            <div class="expense-form">
                <h3>💰 Add New Expense</h3>
                <form id="expense-form">
                    <div class="form-group">
                        <label>Voice Input</label>
                        <textarea id="voice-input" placeholder="Say: 'I spent $25 on food for lunch'" rows="2"></textarea>
                        <button type="button" onclick="app.parseVoiceInput()" class="btn" style="margin-top: 0.5rem;">
                            🎤 Parse Voice
                        </button>
                    </div>
                    <div class="form-group">
                        <label>Amount ($)</label>
                        <input type="number" id="amount" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="category" required>
                            <option value="food">🍔 Food</option>
                            <option value="transportation">🚗 Transportation</option>
                            <option value="entertainment">🎬 Entertainment</option>
                            <option value="utilities">⚡ Utilities</option>
                            <option value="healthcare">🏥 Healthcare</option>
                            <option value="shopping">🛍️ Shopping</option>
                            <option value="other">📦 Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" id="description" placeholder="Optional description">
                    </div>
                    <button type="submit" class="btn">Add Expense</button>
                </form>
            </div>
        `;
        document.getElementById('expense-form').innerHTML = formHTML;
        
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });
    }

    renderGoalForm() {
        const goalFormHTML = `
            <div class="expense-form" style="margin-top: 1rem;">
                <h3>🎯 Set Financial Goal</h3>
                <form id="goal-form">
                    <div class="form-group">
                        <label>Goal Name</label>
                        <input type="text" id="goal-name" placeholder="Emergency Fund" required>
                    </div>
                    <div class="form-group">
                        <label>Target Amount ($)</label>
                        <input type="number" id="goal-amount" step="10" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Target Date</label>
                        <input type="date" id="goal-date" required>
                    </div>
                    <button type="submit" class="btn btn-success">Set Goal</button>
                </form>
                <div id="current-goals"></div>
            </div>
        `;
        document.getElementById('expense-form').insertAdjacentHTML('afterend', goalFormHTML);
        
        document.getElementById('goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGoal();
        });
    }

    parseVoiceInput() {
        const text = document.getElementById('voice-input').value.toLowerCase();
        if (!text) return;

        // Simple voice parsing
        const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

        const categories = ['food', 'transportation', 'entertainment', 'utilities', 'healthcare', 'shopping'];
        const category = categories.find(cat => text.includes(cat)) || 'other';

        document.getElementById('amount').value = amount;
        document.getElementById('category').value = category;
        document.getElementById('description').value = text.replace(/\$?\d+(?:\.\d{2})?/, '').trim();
    }

    addExpense() {
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        
        const expense = {
            id: Date.now(),
            amount,
            category,
            description,
            date: new Date().toISOString()
        };
        
        this.expenses.push(expense);
        this.saveData();
        this.renderDashboard();
        this.showNotification(`Added $${amount.toFixed(2)} expense for ${category}`, 'success');
        document.getElementById('expense-form').reset();
    }

    addGoal() {
        const name = document.getElementById('goal-name').value;
        const amount = parseFloat(document.getElementById('goal-amount').value);
        const date = document.getElementById('goal-date').value;
        
        const goal = {
            id: Date.now(),
            name,
            targetAmount: amount,
            currentAmount: 0,
            deadline: date,
            createdAt: new Date().toISOString()
        };
        
        this.goals.push(goal);
        this.saveData();
        this.renderCurrentGoals();
        this.showNotification(`Goal "${name}" set for $${amount.toFixed(2)}!`, 'success');
        document.getElementById('goal-form').reset();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1000';
        notification.style.minWidth = '300px';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveData() {
        localStorage.setItem('budgetTracker', JSON.stringify({
            expenses: this.expenses,
            goals: this.goals,
            creditInfo: this.creditInfo
        }));
    }

    loadData() {
        const saved = localStorage.getItem('budgetTracker');
        if (saved) {
            const data = JSON.parse(saved);
            this.expenses = data.expenses || [];
            this.goals = data.goals || [];
            this.creditInfo = data.creditInfo || this.creditInfo;
            this.renderDashboard();
            this.renderCurrentGoals();
        }
    }

    startDailyTipRotation() {
        const tips = [
            "Track every expense, no matter how small 💡",
            "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings 📊",
            "Pay credit cards in full each month 💳",
            "Build an emergency fund of 3-6 months expenses 🛡️",
            "Invest early to benefit from compound interest 📈"
        ];
        
        let currentTip = 0;
        const rotateTip = () => {
            const tipElement = document.getElementById('daily-tip');
            if (tipElement) {
                tipElement.textContent = tips[currentTip];
                currentTip = (currentTip + 1) % tips.length;
            }
        };
        
        rotateTip();
        setInterval(rotateTip, 10000); // Change tip every 10 seconds
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BudgetTracker();
});