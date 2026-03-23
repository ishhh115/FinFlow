import express from 'express';
import {
    addExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    exportExpenses
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/export', exportExpenses);
router.post('/', addExpense);
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;