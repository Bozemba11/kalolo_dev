BudgetTracker.prototype.renderDashboard = function() {
    const dashboardHTML = `
        <div id="dashboard-content">
            <div class="metrics-row">
                ${this.renderCreditMetrics()}
            </div>
            <div class="dashboard-grid">
                <div class="card">
                    <h3>📊 Recent Expenses</h3>
                    <div id="recent-expenses"></div>
                </div>
                <div class="card">
                    <h3>📈 Category Breakdown</h3>
                    <div id="category-chart"></div>
                </div>
                <div class="card">
                    <h3>🎯 Goal Progress</h3>
                    <div id="goal-progress"></div>
                </div>
                <div class="card">
                    <h3>💡 Financial Advice</h3>
                    <div id="financial-advice"></div>
                </div>
            </div>
        </div>
        <div id="education-content" style="display: none;">
            ${this.renderEducationContent()}
        </div>
    `;
    
    document.getElementById('dashboard-content').innerHTML = dashboardHTML;
    this.renderRecentExpenses();
    this.renderCategoryChart();
    this.renderGoalProgress();
    this.renderFinancialAdvice();
    this.updateCreditGauge();
};

BudgetTracker.prototype.renderCreditMetrics = function() {
    const grade = this.getCreditGrade(this.creditInfo.score);
    return `
        <div class="metric-card">
            <div class="credit-gauge">
                <svg class="progress-ring" width="120" height="120">
                    <circle class="progress-ring-circle" />
                    <circle class="progress-ring-progress" id="credit-progress" />
                </svg>
                <div class="credit-score">${this.creditInfo.score}</div>
            </div>
            <div class="metric-label">Credit Score (${grade})</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${(this.creditInfo.utilization * 100).toFixed(1)}%</div>
            <div class="metric-label">Credit Utilization</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$${this.getTotalSpending().toFixed(2)}</div>
            <div class="metric-label">Total Spending</div>
        </div>
    `;
};

BudgetTracker.prototype.updateCreditGauge = function() {
    const circle = document.getElementById('credit-progress');
    if (circle) {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const progress = (this.creditInfo.score - 300) / (850 - 300);
        const offset = circumference - (progress * circumference);
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
        
        // Color based on score
        if (this.creditInfo.score >= 740) {
            circle.style.stroke = '#10b981'; // Green
        } else if (this.creditInfo.score >= 670) {
            circle.style.stroke = '#f59e0b'; // Yellow
        } else {
            circle.style.stroke = '#ef4444'; // Red
        }
    }
};

BudgetTracker.prototype.getCreditGrade = function(score) {
    if (score >= 800) return "Excellent";
    if (score >= 740) return "Very Good";
    if (score >= 670) return "Good";
    if (score >= 580) return "Fair";
    return "Poor";
};

BudgetTracker.prototype.getTotalSpending = function() {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
};

BudgetTracker.prototype.renderRecentExpenses = function() {
    const recent = this.expenses.slice(-5).reverse();
    
    if (recent.length === 0) {
        document.getElementById('recent-expenses').innerHTML = '<div class="alert alert-info">No expenses yet. Add one to get started!</div>';
        return;
    }
    
    const tableHTML = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border);">
                        <th style="text-align: left; padding: 0.75rem; font-weight: 600;">Amount</th>
                        <th style="text-align: left; padding: 0.75rem; font-weight: 600;">Category</th>
                        <th style="text-align: left; padding: 0.75rem; font-weight: 600;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${recent.map(expense => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 0.75rem; font-weight: 500;">$${expense.amount.toFixed(2)}</td>
                            <td style="padding: 0.75rem;">${this.getCategoryIcon(expense.category)} ${expense.category}</td>
                            <td style="padding: 0.75rem; color: var(--text-secondary);">${new Date(expense.date).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('recent-expenses').innerHTML = tableHTML;
};

BudgetTracker.prototype.getCategoryIcon = function(category) {
    const icons = {
        food: '🍔',
        transportation: '🚗',
        entertainment: '🎬',
        utilities: '⚡',
        healthcare: '🏥',
        shopping: '🛍️',
        other: '📦'
    };
    return icons[category] || '📦';
};

BudgetTracker.prototype.renderCategoryChart = function() {
    const categories = {};
    this.expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    
    if (Object.keys(categories).length === 0) {
        document.getElementById('category-chart').innerHTML = '<div class="alert alert-info">No spending data to display</div>';
        return;
    }
    
    const maxAmount = Math.max(...Object.values(categories));
    const chartHTML = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .map(([category, amount]) => `
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 500;">${this.getCategoryIcon(category)} ${category}</span>
                    <span style="font-weight: 600; color: var(--primary-color);">$${amount.toFixed(2)}</span>
                </div>
                <div style="background: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); height: 100%; width: ${(amount / maxAmount) * 100}%; border-radius: 4px; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `).join('');
    
    document.getElementById('category-chart').innerHTML = chartHTML;
};

BudgetTracker.prototype.renderGoalProgress = function() {
    if (this.goals.length === 0) {
        document.getElementById('goal-progress').innerHTML = '<div class="alert alert-info">No goals set yet. Create one in the sidebar!</div>';
        return;
    }
    
    const goalsHTML = this.goals.map(goal => {
        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
        const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
        
        return `
            <div style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid var(--border); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary);">${goal.name}</h4>
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">${progress.toFixed(1)}%</span>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-fill" style="width: ${progress}%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-secondary);">
                    <span>$${goal.currentAmount.toFixed(2)} / $${goal.targetAmount.toFixed(2)}</span>
                    <span>$${remaining.toFixed(2)} remaining</span>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('goal-progress').innerHTML = goalsHTML;
};

BudgetTracker.prototype.renderCurrentGoals = function() {
    const goalsContainer = document.getElementById('current-goals');
    if (!goalsContainer) return;
    
    if (this.goals.length === 0) {
        goalsContainer.innerHTML = '';
        return;
    }
    
    const goalsHTML = `
        <h4 style="margin: 1rem 0 0.5rem 0;">Current Goals</h4>
        ${this.goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return `
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: var(--background); border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span style="font-weight: 500; font-size: 0.875rem;">${goal.name}</span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">${progress.toFixed(1)}%</span>
                    </div>
                    <div class="goal-progress" style="height: 4px;">
                        <div class="goal-progress-fill" style="width: ${progress}%; height: 4px;"></div>
                    </div>
                </div>
            `;
        }).join('')}
    `;
    
    goalsContainer.innerHTML = goalsHTML;
};

BudgetTracker.prototype.renderFinancialAdvice = function() {
    const totalSpending = this.getTotalSpending();
    const avgDaily = this.expenses.length > 0 ? totalSpending / this.expenses.length : 0;
    
    let advice = "Start tracking your expenses to get personalized advice!";
    let alertType = "info";
    
    if (this.expenses.length > 0) {
        if (avgDaily > 50) {
            advice = "💡 Consider reducing daily spending. Small cuts can lead to big savings!";
            alertType = "warning";
        } else if (avgDaily < 20) {
            advice = "🎉 Great job keeping expenses low! Consider investing the savings.";
            alertType = "success";
        } else {
            advice = "✅ Your spending looks balanced. Keep tracking to maintain control!";
            alertType = "success";
        }
    }
    
    document.getElementById('financial-advice').innerHTML = `<div class="alert alert-${alertType}">${advice}</div>`;
};

BudgetTracker.prototype.renderEducationContent = function() {
    return `
        <div class="card">
            <h3>💡 Daily Financial Tip</h3>
            <div class="alert alert-info">
                <span id="daily-tip">Loading tip...</span>
            </div>
        </div>
        <div class="dashboard-grid" style="margin-top: 1rem;">
            <div class="card">
                <h3>📊 Credit Impact Calculator</h3>
                <div class="form-group">
                    <label>Utilization Change</label>
                    <input type="range" id="util-slider" min="-0.5" max="0.5" step="0.01" value="0">
                    <div id="credit-impact"></div>
                </div>
            </div>
            <div class="card">
                <h3>📖 Learning Topics</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button class="btn" onclick="app.showTopic('budgeting')">Budgeting Basics</button>
                    <button class="btn" onclick="app.showTopic('credit')">Credit Management</button>
                    <button class="btn" onclick="app.showTopic('investing')">Investment Principles</button>
                    <button class="btn" onclick="app.showTopic('emergency')">Emergency Funds</button>
                </div>
            </div>
        </div>
    `;
};

BudgetTracker.prototype.showTopic = function(topic) {
    const topics = {
        budgeting: "Learn the fundamentals of creating and maintaining a budget that works for your lifestyle.",
        credit: "Understand how credit scores work and proven strategies to improve them over time.",
        investing: "Basic investment strategies for beginners, including risk management and diversification.",
        emergency: "Why you need an emergency fund and step-by-step guide to building one."
    };
    
    this.showNotification(topics[topic] || "Topic information coming soon!", 'info');
};