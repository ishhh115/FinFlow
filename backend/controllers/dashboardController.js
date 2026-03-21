import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

export const getDashboard = async (req, res, next) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);
        const startOfLastMonth = new Date(year, month - 2, 1);
        const endOfLastMonth = new Date(year, month - 1, 0);

        // Total spent this month
        const thisMonthExpenses = await Expense.find({
            userId: req.user._id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const totalThisMonth = thisMonthExpenses.reduce(
            (sum, exp) => sum + exp.amount, 0
        );

        // Total spent last month
        const lastMonthExpenses = await Expense.find({
            userId: req.user._id,
            date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        const totalLastMonth = lastMonthExpenses.reduce(
            (sum, exp) => sum + exp.amount, 0
        );

        // Spending by category (pie chart)
        const categorySpending = await Expense.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Biggest category
        const biggestCategory = categorySpending[0] || null;

        // Monthly spending for last 6 months (bar chart)
        const sixMonthsAgo = new Date(year, month - 7, 1);
        const monthlySpending = await Expense.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: sixMonthsAgo, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Budget status
        const budgets = await Budget.find({
            userId: req.user._id,
            month,
            year
        });

        const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
        const budgetPercentage = totalBudget > 0
            ? Math.round((totalThisMonth / totalBudget) * 100)
            : 0;

        // Recent expenses
        const recentExpenses = await Expense.find({
            userId: req.user._id
        }).sort({ date: -1 }).limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalThisMonth,
                totalLastMonth,
                difference: totalThisMonth - totalLastMonth,
                biggestCategory,
                budgetPercentage,
                totalBudget,
                categorySpending,
                monthlySpending,
                recentExpenses
            }
        });
    } catch (error) {
        next(error);
    }
};