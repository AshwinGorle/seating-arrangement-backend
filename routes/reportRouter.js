import express from 'express';
import { generateWeeklyReport, generateWeeklyPDFReport, generateWeeklyExcelReport } from '../controllers/reportController.js';

const router = express.Router();

// Route to generate weekly report in JSON format
router.get('/weekly/:organizationId', generateWeeklyReport);

// Route to generate weekly report in PDF format
router.get('/weekly-pdf/:organizationId', generateWeeklyPDFReport);

// Route to generate weekly report in Excel format
router.get('/weekly-excel/:organizationId', generateWeeklyExcelReport);
export default router;
