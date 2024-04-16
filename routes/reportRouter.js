import express from 'express';
import { generateWeeklyReport, generateWeeklyPDFReport, generateWeeklyExcelReport } from '../controllers/reportController.js';

const router = express.Router();

// Route to generate weekly report in JSON format
router.get('/weekly', generateWeeklyReport);

// Route to generate weekly report in PDF format
router.get('/weekly/pdf', generateWeeklyPDFReport);

router.get('/weekly/excel', generateWeeklyExcelReport);
export default router;
