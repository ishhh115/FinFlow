import express from 'express';
import upload from '../config/multer.js';
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
router.post('/upload-receipt', (req, res, next) => {
    upload.single('receipt')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload an image'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                filePath: `/uploads/receipts/${req.file.filename}`,
                fileName: req.file.filename
            }
        });
    });
});

router.post('/', addExpense);
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;