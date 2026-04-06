/**
 * Calculates current spending velocity (spend per day)
 * @param {number} totalSpent - The total numerical amount spent
 * @param {Date} currentDate - Optional Date object default to now
 * @returns {number} Velocity value per day
 */
export const calculateSpendingVelocity = (totalSpent, currentDate = new Date()) => {
    if (totalSpent <= 0) return 0;
    
    // We treat the first day as 1 to avoid division by zero
    const daysPassed = Math.max(1, currentDate.getDate());
    return totalSpent / daysPassed;
};

/**
 * Predicts total month spend based on current velocity
 * @param {number} velocity - Current daily velocity
 * @param {Date} currentDate - Optional Date object default to now
 * @returns {number} Projected spend
 */
export const calculateMonthlyProjection = (velocity, currentDate = new Date()) => {
    if (velocity <= 0) return 0;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-12 range
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    
    return velocity * totalDaysInMonth;
};

/**
 * Calculates the percentage of budget limit used per category
 * @param {Array} expenses - Array of active expenses
 * @param {Array} budgets - Array of active budgets
 * @returns {Record<string, {spent: number, limit: number, percentage: number, status: string}>}
 */
export const calculateCategoryUsage = (expenses = [], budgets = []) => {
    const categorySpent = {};
    
    // Aggregate expenses total per category
    expenses.forEach(exp => {
        if (!exp || !exp.category || typeof exp.amount !== 'number') return;
        categorySpent[exp.category] = (categorySpent[exp.category] || 0) + exp.amount;
    });

    const categoryUsage = {};

    // Map aggregated spend against defined budgets
    budgets.forEach(budget => {
        if (!budget || !budget.category || typeof budget.limit !== 'number') return;
        
        const spent = categorySpent[budget.category] || 0;
        const limit = budget.limit;
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        
        categoryUsage[budget.category] = {
            spent,
            limit,
            percentage,
            status: percentage >= 100 ? 'OVERSPENT' : (percentage >= 70 ? 'WARNING' : 'SAFE')
        };
    });

    return categoryUsage;
};

/**
 * Generates an insight report summarizing spending behavior
 * @param {Array} expenses - Array of active expenses
 * @param {Array} budgets - Array of active budgets
 * @param {Date} currentDate - Optional Date object
 * @returns {{behavior: string, risk: string, suggestions: string[]}}
 */
export const generateInsights = (expenses = [], budgets = [], currentDate = new Date()) => {
    if (!expenses.length && !budgets.length) {
        return {
            behavior: "No financial footprint found.",
            risk: "LOW",
            suggestions: ["Add your monthly budgets and log daily expenses to activate AI insights."]
        };
    }

    const totalSpent = expenses.reduce((sum, current) => sum + (current.amount || 0), 0);
    const totalBudget = budgets.reduce((sum, current) => sum + (current.limit || 0), 0);
    
    const velocity = calculateSpendingVelocity(totalSpent, currentDate);
    const projectedSpend = calculateMonthlyProjection(velocity, currentDate);
    const usage = calculateCategoryUsage(expenses, budgets);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const daysPassed = Math.max(1, Math.min(currentDate.getDate(), totalDaysInMonth));
    const daysRemaining = Math.max(1, totalDaysInMonth - daysPassed);

    const suggestions = [];
    let behaviorScore = 0;
    
    // Identify risks in individual isolated categories
    for (const [category, data] of Object.entries(usage)) {
        if (data.status === 'OVERSPENT') {
            suggestions.push(`High Alert: Limit ${category.toLowerCase()} spending to ₹0/day for the rest of the month.`);
            behaviorScore += 3;
        } else if (data.status === 'WARNING') {
            const dailyCategoryLimit = Math.max(0, (data.limit - data.spent) / daysRemaining);
            suggestions.push(`Caution: Limit ${category.toLowerCase()} spending to ₹${Math.floor(dailyCategoryLimit)}/day for the rest of the month.`);
            behaviorScore += 1;
        }
    }

    // Evaluate Global Monthly Status Patterns
    if (totalBudget > 0) {
        if (projectedSpend > totalBudget) {
            behaviorScore += 4;
            const globalDailyLimit = Math.max(0, (totalBudget - totalSpent) / daysRemaining);
            suggestions.push(`Pacing Alert: Limit overall daily spending to ₹${Math.floor(globalDailyLimit)}/day to stay within your total budget of ₹${totalBudget}.`);
        } else if (projectedSpend < (totalBudget * 0.8)) {
            suggestions.push(`Great job pacing! If you maintain this streak, you'll finish the month substantially under budget in surplus.`);
        }
    }
    
    if (expenses.length > 0 && budgets.length === 0) {
        suggestions.push(`You're tracking your expenses optimally but haven't set any budgets! Configure limits to uncover your true financial boundaries.`);
    }

    // Baseline Behavioral Fallbacks
    let riskLevel = "LOW";
    let behaviorDesc = "Disciplined steady spending pattern.";

    if (behaviorScore >= 6) {
        riskLevel = "HIGH";
        behaviorDesc = "Aggressive consumption detected. Immediate lifestyle cash-flow adjustments required.";
    } else if (behaviorScore >= 3) {
        riskLevel = "MEDIUM";
        behaviorDesc = "Rapid spending detected. Rebalance your finances before month end.";
    }

    if (expenses.length === 0) {
        return {
            behavior: "No expenses tracked recently.",
            risk: "LOW",
            suggestions: Object.keys(usage).length > 0 
                ? ["Start logging daily expenses against your active budgets to calculate limits."] 
                : ["Start logging expenses to generate detailed behavioral insights."]
        };
    }

    return {
        behavior: behaviorDesc,
        risk: riskLevel,
        suggestions: suggestions.length > 0 ? suggestions : ["Your finances are perfectly optimized within safe thresholds right now."]
    };
};
