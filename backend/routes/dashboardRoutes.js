import express from 'express';
import { getDashboard, getSpendingStreak } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';




const router = express.Router();

router.use(protect);
router.get('/', getDashboard);
router.get('/streak', getSpendingStreak);

export default router;