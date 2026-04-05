import { GoogleGenerativeAI } from '@google/generative-ai';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

export const getInsights = async (req, res, next) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        const expenses = await Expense.find({
            userId: req.user._id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        if (expenses.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    insight: "No expenses found for this month. Start adding expenses to get personalized AI insights!"
                }
            });
        }

        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const categoryTotals = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        const expenseSummary = Object.entries(categoryTotals)
            .map(([cat, amount]) => `${cat}: ₹${amount}`)
            .join(', ');

        const prompt = `
            You are a personal finance advisor. Analyze this spending data and give friendly, personalized advice.
            
            User: ${req.user.name}
            Month: ${now.toLocaleString('default', { month: 'long' })} ${year}
            Total spent: ₹${totalSpent}
            Spending by category: ${expenseSummary}
            Number of transactions: ${expenses.length}
            
            Please provide:
            1. A brief analysis of their spending patterns (2-3 sentences)
            2. Their biggest spending concern
            3. Two specific actionable tips to save money
            4. An encouraging closing message
            
            Keep it friendly, specific, and under 200 words.
        `;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const insight = result.response.text();

        res.status(200).json({
            success: true,
            data: {
                insight,
                summary: {
                    totalSpent,
                    categoryTotals,
                    transactionCount: expenses.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const askAi = async (req, res, next) => {
    try {
        const { query, pageContext } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Parallelize fetching relevant financial data
        const [expenses, budgets] = await Promise.all([
            Expense.find({ userId: req.user._id, date: { 
                $gte: new Date(currentYear, currentMonth - 1, 1),
                $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59)
            }}).sort({ date: -1 }),
            Budget.find({ userId: req.user._id, month: currentMonth, year: currentYear })
        ]);

        if (expenses.length === 0 && budgets.length === 0) {
            return res.status(200).json({ 
                success: true, 
                answer: "I don't see any expense or budget data yet! To give you the best personalized financial insights, please add some expenses or set up a budget first. I'll be here when you're ready!" 
            });
        }

        // Summary Calculations
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const categoryTotals = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        const expenseData = expenses.length > 0
            ? expenses.slice(0, 50).map(exp => `- ₹${exp.amount} on ${exp.category} (${exp.title})`).join('\n')
            : "No transactions recorded yet.";

        const budgetData = budgets.length > 0
            ? budgets.map(b => `- ${b.category}: Limit ₹${b.limit} (Spent: ₹${categoryTotals[b.category] || 0})`).join('\n')
            : "No active budgets.";

        const summaryString = `Total Spent This Month: ₹${totalSpent} across ${expenses.length} transactions. Highest category: ${Object.keys(categoryTotals).length ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b) : 'None'}.`;

        let contextPrompt = "";
        if (pageContext === 'dashboard') {
            contextPrompt = "User is on the Dashboard. Emphasize their current spending limits and summary. Be highly numeric.";
        } else if (pageContext === 'insights') {
            contextPrompt = "User is on the Insights page. Analyze their behavioral spending habits, pinpoint inefficiencies, and give constructive criticism mapping to their budgets.";
        } else {
            contextPrompt = "Provide precise, actionable financial advice.";
        }

        const prompt = `
            You are FinFlow AI, a premium personal finance assistant talking to ${req.user.name}.
            
            [USER'S REAL FINANCIAL DATA]
            **Summary**: ${summaryString}
            **Budgets**:
            ${budgetData}
            **Recent Expenses**:
            ${expenseData}
            
            **Context**: ${contextPrompt}
            **User's query**: "${query}"
            
            Based EXACTLY on the financial data provided above, answer the user. Ground your response heavily in their actual numbers. Use a friendly, modern fintech tone. Format it smoothly using markdown. Limit to around 100-150 words. If their query is totally unrelated to finance, gently guide them back to discussing their financials and budget data.
        `;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const answer = result.response.text();

        res.status(200).json({ success: true, answer });
    } catch (error) {
        next(error);
    }
};