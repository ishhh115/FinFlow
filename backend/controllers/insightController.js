import { GoogleGenerativeAI } from '@google/generative-ai';
import Expense from '../models/Expense.js';

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