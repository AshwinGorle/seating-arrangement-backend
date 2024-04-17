import moment from 'moment';
import PDFDocument from 'pdfkit';
import exceljs from 'exceljs';
import { PassThrough } from 'stream';
import MemberModel from '../../models/MemberModel.js';
import PaymentModel from '../../models/PaymentModel.js';

// Function to generate fee report in JSON format
export async function generateFeeReportJSON(req, res) {
    try {
        const { organizationId } = req.params;
        
        // Get current date
        const currentDate = moment();

        // Calculate start dates for different periods
        const startDates = [
            currentDate.startOf('month'), // This month
            currentDate.subtract(1, 'months').startOf('month'), // Last month
            currentDate.subtract(2, 'months').startOf('month') // 2 months ago
        ];

        // Initialize report object
        const report = {};

        // Fetch members who have not paid fees for each period
        const periodNames = ['Current Month', 'Last Month', '2 Months Ago'];
        for (let i = 0; i < startDates.length; i++) {
            const startDate = startDates[i];
            const members = await MemberModel.find({
                organization: organizationId,
                'payments.createdAt': { $not: { $gte: startDate.toDate() } }
            });

            report[periodNames[i]] = members;
        }

        res.json(report);
    } catch (error) {
        console.error('Error generating fee report in JSON format:', error);
        res.status(500).json({ message: 'An error occurred while generating fee report in JSON format.' });
    }
}

// Function to generate fee report in PDF format

// Function to generate fee report in PDF format
export async function generateFeeReportPDF(req, res) {
    try {
        const { organizationId } = req.params;
        
        // Get fee report data in JSON format
        const feeReportData = await generateFeeReportData(organizationId);

        // Create PDF document
        const doc = new PDFDocument();
        const stream = new PassThrough();
        doc.pipe(stream);

        // Add title
        doc.fontSize(24).text('Fee Report', { align: 'center' }).moveDown();

        // Add fee report data
        Object.entries(feeReportData).forEach(([period, members]) => {
            doc.fontSize(16).text(`Period:- ${period}`, { underline: true }).moveDown();
            members.forEach(member => {
                doc.fontSize(12).text(`${member.name} (${member.email})`).moveDown(0.5);
            });
            doc.moveDown(1); // Add space between periods
        });

        doc.end();
        stream.pipe(res);
    } catch (error) {
        console.error('Error generating fee report in PDF format:', error);
        res.status(500).json({ message: 'An error occurred while generating fee report in PDF format.' });
    }
}


// Function to generate fee report in Excel format
export async function generateFeeReportExcel(req, res) {
    try {
        const { organizationId } = req.params;
        
        // Get fee report data in JSON format
        const feeReportData = await generateFeeReportData(organizationId);

        // Create Excel workbook
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Fee Report');

        // Add fee report data to worksheet
        worksheet.columns = [{ header: 'Member', key: 'member' }];

        Object.entries(feeReportData).forEach(([period, members]) => {
            worksheet.addRow([`Period ${period}`]);
            members.forEach(member => {
                worksheet.addRow([`${member.name} (${member.email})`]);
            });
            worksheet.addRow([]); // Add empty row between periods
        });

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers
        res.setHeader('Content-Disposition', 'attachment; filename="fee_report.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating fee report in Excel format:', error);
        res.status(500).json({ message: 'An error occurred while generating fee report in Excel format.' });
    }
}

// Function to generate fee report data
async function generateFeeReportData(organizationId) {
    try {
        // Get current date
        const currentDate = moment();

        // Calculate start dates for different periods
        const startDates = [
            currentDate.startOf('month'), // This month
            currentDate.subtract(1, 'months').startOf('month'), // Last month
            currentDate.subtract(2, 'months').startOf('month') // 2 months ago
        ];

        // Initialize report object
        const report = {};

        // Fetch members who have not paid fees for each period
        const periodNames = ['Current Month', 'Last 2 Months', 'Last 3 Months'];
        for (let i = 0; i < startDates.length; i++) {
            const startDate = startDates[i];
            const members = await MemberModel.find({
                organization: organizationId,
                'payments.createdAt': { $not: { $gte: startDate.toDate() } }
            });

            report[periodNames[i]] = members;
        }

        return report;
    } catch (error) {
        console.error('Error generating fee report data:', error);
        throw error;
    }
}
