import express from 'express';
import { 
  generateDailySalesReport, 
  generateMonthlyReport, 
  getPeakHoursAnalysis,
  getMenuPerformanceMetrics 
} from '../controllers/report.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.get('/daily', verifyRole(['admin']), generateDailySalesReport);
router.get('/monthly', verifyRole(['admin']), generateMonthlyReport);
router.get('/peak-hours', verifyRole(['admin']), getPeakHoursAnalysis);
router.get('/menu-metrics', verifyRole(['admin']), getMenuPerformanceMetrics);

export default router;
