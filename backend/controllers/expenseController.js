import Expense from '../models/Expense.js';

export const addExpense = async (req, res, next) => {
    try {
        const { amount, description, category, date, currency, note } = req.body;

        const expense = await Expense.create({
            userId: req.user._id,
            amount,
            description,
            category,
            date: date || Date.now(),
            currency: currency || req.user.currency,
            note
        });

        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

export const getExpenses = async (req, res, next) => {
    try {
        const { category, startDate, endDate, search, sort } = req.query;

        let query = { userId: req.user._id };

        if (category) query.category = category;

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        if (search) {
            query.description = { $regex: search, $options: 'i' };
        }

        let sortOption = { date: -1 };
        if (sort === 'amount') sortOption = { amount: -1 };
        if (sort === 'category') sortOption = { category: 1 };

        const expenses = await Expense.find(query).sort(sortOption);

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        res.status(200).json({
            success: true,
            count: expenses.length,
            total,
            data: expenses
        });
    } catch (error) {
        next(error);
    }
};

export const getExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

export const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        const { amount, description, category, date, currency, note } = req.body;

        if (amount) expense.amount = amount;
        if (description) expense.description = description;
        if (category) expense.category = category;
        if (date) expense.date = date;
        if (currency) expense.currency = currency;
        if (note) expense.note = note;

        await expense.save();

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

export const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        await expense.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};