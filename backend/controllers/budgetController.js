import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

export const setBudget = async (req, res, next) => {
    try {
        const { category, limit, month, year } = req.body;

        let budget = await Budget.findOne({
            userId: req.user._id,
            category,
            month,
            year
        });

        if (budget) {
            budget.limit = limit;
            await budget.save();
        } else {
            budget = await Budget.create({
                userId: req.user._id,
                category,
                limit,
                month,
                year
            });
        }

        res.status(200).json({
            success: true,
            data: budget
        });
    } catch (error) {
        next(error);
    }
};

export const getBudgets = async (req, res, next) => {
    try {
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const budgets = await Budget.find({
            userId: req.user._id,
            month,
            year
        });

        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                const expenses = await Expense.find({
                    userId: req.user._id,
                    category: budget.category,
                    date: { $gte: startDate, $lte: endDate }
                });

                const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                const percentage = Math.round((spent / budget.limit) * 100);

                return {
                    ...budget.toObject(),
                    spent,
                    percentage,
                    remaining: budget.limit - spent,
                    status: percentage >= 100 ? 'exceeded' :
                            percentage >= 90 ? 'danger' :
                            percentage >= 60 ? 'warning' : 'good'
                };
            })
        );

        res.status(200).json({
            success: true,
            data: budgetsWithSpending
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                error: 'Budget not found'
            });
        }

        await budget.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Budget deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};