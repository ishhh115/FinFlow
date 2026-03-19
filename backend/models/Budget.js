import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['Food', 'Transport', 'Entertainment',
               'Shopping', 'Health', 'Utilities', 'Other']
    },
    limit: {
        type: Number,
        required: [true, 'Please provide a budget limit'],
        min: [0, 'Budget limit cannot be negative']
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

budgetSchema.index({ userId: 1, month: 1, year: 1 });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;