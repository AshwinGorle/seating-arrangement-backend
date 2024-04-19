import moment from 'moment';
import PDFDocument from 'pdfkit';
import exceljs from 'exceljs';
import { PassThrough } from 'stream';
import MemberModel from '../../models/MemberModel.js';
import OrganizationModel from '../../models/OrganizationModel.js';
import PaymentModel from '../../models/PaymentModel.js';
import puppeteer from 'puppeteer';

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

// Function to generate fee report in Excel format
export async function generateFeeReportExcel(req, res) {
    try {
        const { organizationId } = req.params;
        
        // Get fee report data in JSON format
        const feeReportData = await generateFeeReportData(organizationId);

        // Create Excel workbook
        const workbook = new exceljs.Workbook();

        // Add worksheets for each period
        Object.entries(feeReportData).forEach(([period, members]) => {
            const worksheet = workbook.addWorksheet(period);

            // Add headers
            worksheet.columns = [
                { header: 'Member', key: 'member', width: 20, style: { font: { bold: true } } },
                { header: 'Email', key: 'email', width: 30, style: { font: { bold: true } } },
                { header: 'Phone', key: 'phone', width: 15, style: { font: { bold: true } } },
                { header: 'Address', key: 'address', width: 40, style: { font: { bold: true } } },
                // Add more columns as needed
            ];

            // Add member details
            members.forEach(member => {
                worksheet.addRow([
                    member.name,
                    member.email,
                    member.phone,
                    member.address,
                    // Add more member details as needed
                ]);
            });

            // Autosize columns
            worksheet.columns.forEach(column => {
                column.width = Math.max(column.width, 15);
            });

            // Set header row style to bold
            worksheet.getRow(1).eachCell(cell => {
                cell.font = { bold: true };
            });
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


// export async function generateFeeReportPDF(req, res) {
//     try {
//         const { organizationId } = req.params;
        
//         // Get fee report data in JSON format
//         const feeReportData = await generateFeeReportData(organizationId);

//         // Create PDF document
//         const doc = new PDFDocument();
//         const stream = new PassThrough();
//         doc.pipe(stream);

//         // Add title
//         doc.fontSize(24).text('Fee Report', { align: 'center' }).moveDown();

//         // Add fee report data
//         Object.entries(feeReportData).forEach(([period, members]) => {
//             doc.fontSize(16).text(`Period:- ${period}`, { underline: true }).moveDown();
//             members.forEach(member => {
//                 doc.fontSize(12).text(`${member.name} (${member.email})`).moveDown(0.5);
//             });
//             doc.moveDown(1); // Add space between periods
//         });

//         doc.end();
//         stream.pipe(res);
//     } catch (error) {
//         console.error('Error generating fee report in PDF format:', error);
//         res.status(500).json({ message: 'An error occurred while generating fee report in PDF format.' });
//     }
// }


// Function to generate the fee report PDF
export async function generateFeeReportPDF(req, res) {
    try {
      // Extract organizationId from request parameters
      const { organizationId } = req.params;
      
      // Generate fee report data
      const feeReportData = await generateFeeReportData(organizationId);
      const organization = await OrganizationModel.findById(organizationId);
      // Generate PDF buffer
      const pdfBuffer = await generatePDF(feeReportData,organization);
      
      // Set response headers to indicate PDF content
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="fee_report_${Date.now()}.pdf"`);
      
      // Send the PDF buffer as response
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating fee report PDF:', error);
      res.status(500).json({ message: 'An error occurred while generating the fee report PDF.' });
    }
  }
  
  // Function to generate PDF using Puppeteer
  async function generatePDF(feeReportData,organization) {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Inject HTML content with CSS styles
    await page.setContent(getHTMLContent(feeReportData,organization));
    
    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true // Include background colors and styles
    });
    
    // Close the browser
    await browser.close();
    
    return pdfBuffer;
  }
  
  // Function to construct HTML content
  function getHTMLContent(feeReportData,organization) {
    // Construct HTML content with fee report data
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fee Report</title>
            <style>
            /* Add your CSS styles here */
            *{
                margin: 0;
            }
            body {
                font-family: Arial, sans-serif;
                
                background-color: #f2f2f2;
            }

            .report-title {
                font-size: 40px;
                font-weight: bold;
                text-align: center;
                margin: 20px;
                text-decoration: underline;
            }

            .period-title {
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #000000; /* Black */
                background-color: skyblue;
                padding: 20px;
                border-radius: 5px;
            }

            .member-details {
                font-size: 12px;
                margin-bottom: 5px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }

            th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }

            th {
                background-color: #f2f2f2;
                font-weight: bold;
                color: #000000; /* Black */
            }

            .highlight {
                background-color: bisque;
            }
            .organization-details {
                display: flex;
                margin: 0;
                justify-content: center;
                flex-direction: column;
                align-items: center;
                width: 100%;
                background-color: #3b5998;
                padding-bottom: 10px;
                border-bottom: 2px solid black;
                }
                .organization-name {
                font-size: 45px;
                color: #fff;
                font-weight: bold;
                text-transform: uppercase;
                }
                .organization-address {
                color: #f5f5f5;
                text-transform: lowercase;
                }
            </style>
        </head>
        <body>
        <div class="organization-details">
        <div class="organization-name">${organization.name}</div>
        <div class="organization-address">${organization.address}</div>
        </div>  
            <div class="report-title">Fee Report</div>
            <!-- Add detailed information about the fee report here -->
            <!-- Use feeReportData to dynamically generate content -->
            ${Object.entries(feeReportData).map(([period, members], index) => `
                <div class="period-title">${period}</div>
                <table>
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <!-- Add more columns as needed -->
                        </tr>
                    </thead>
                    <tbody>
                        ${members.map((member, memberIndex) => `
                            <tr class="${memberIndex % 2 === 0 ? 'highlight' : ''}">
                                <td>${member.name}</td>
                                <td>${member.email}</td>
                                <td>${member.phone}</td>
                                <td>${member.address}</td>
                                <!-- Add more member details as needed -->
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `).join('')}
        </body>
        </html>
    `;
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
