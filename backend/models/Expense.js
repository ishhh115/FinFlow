import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
        min: [0, 'Amount cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['Food', 'Transport', 'Entertainment', 
               'Shopping', 'Health', 'Utilities', 'Other']
    },
    date: {
        type: Date,
        default: Date.now
    },
    currency: {
        type: String,
        default: 'INR'
    },
    note: {
        type: String,
        trim: true
    },
    receiptImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

expenseSchema.index({ userId: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;