import express from 'express';
import { getExchangeRates, convertCurrency } from '../controllers/currencyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/rates', getExchangeRates);
router.get('/convert', convertCurrency);

export default router;