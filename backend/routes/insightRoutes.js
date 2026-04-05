import express from 'express';
import { getInsights, askAi } from '../controllers/insightController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getInsights);
router.post('/ask', askAi);

export default router;