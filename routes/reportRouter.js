import express from 'express';
import { generateWeeklyReport, generateWeeklyPDFReportPuppeteer, generateWeeklyExcelReport } from '../controllers/report/weeklyReportController.js';
import { generateSeatStatusReportJSON, generateSeatStatusReportPDF} from '../controllers/report/seatReportController.js';
import { generateFeeReportJSON, generateFeeReportPDF,generateFeeReportExcel } from '../controllers/report/feeReportController.js';
const router = express.Router();

// Route to generate weekly report in JSON format
router.get('/weekly/:organizationId', generateWeeklyReport);

// Route to generate weekly report in PDF format
router.get('/weekly-pdf/:organizationId', generateWeeklyPDFReportPuppeteer);

// Route to generate weekly report in Excel format
router.get('/weekly-excel/:organizationId', generateWeeklyExcelReport);

router.get('/seat-status/:organizationId', generateSeatStatusReportJSON);
router.get('/seat-status-pdf/:organizationId', generateSeatStatusReportPDF);

router.get('/fee-report/:organizationId', generateFeeReportJSON);
router.get('/fee-report-pdf/:organizationId', generateFeeReportPDF);
router.get('/fee-report-excel/:organizationId', generateFeeReportExcel);


export default router;
