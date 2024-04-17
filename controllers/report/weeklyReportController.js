import moment from 'moment';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import exceljs from 'exceljs';
import MemberModel from '../../models/MemberModel.js'; 
import PaymentModel from '../../models/PaymentModel.js'; 
import OrganizationModel from '../../models/OrganizationModel.js';
import puppeteer from 'puppeteer';

// Function to generate the weekly report
export async function generateWeeklyReport(req, res) {
  const { organizationId } = req.params; // Extract organization ID from request parameters
  try {
    const reportData = await generateReportData(organizationId); // Pass organization ID to the data generation function

    // Respond with JSON data
    res.json(reportData);
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ message: 'An error occurred while generating the weekly report.' });
  }
}

// Function to generate the weekly PDF report

// export async function generateWeeklyPDFReport(req, res) {
//   const { organizationId } = req.params; // Extract organization ID from request parameters
//   try {
//     const reportData = await generateReportData(organizationId); // Pass organization ID to the data generation function

//     // Create a PassThrough stream
//     const stream = new PassThrough();

//     // Generate PDF
//     const doc = new PDFDocument();
//     doc.pipe(stream); // Pipe the PDF to the PassThrough stream

//     // Set PDF metadata
//     doc.info.Title = 'Weekly Report';
    
//         // // Add organization details
//         // if (reportData.organization) {
//         //   doc.fontSize(25).text(`----${reportData.organization.name}----`, {align:'center',underline:true}).moveDown(0);
//         //   doc.fontSize(13).text(`${reportData.organization.address}`,{align:'center'}).moveDown(1.4);
//         //   // Add more organization details as needed
//         // }

//         // Define a function to add organization details as the header
//         const addOrganizationDetailsHeader = () => {
//           // Add organization details
//           if (reportData.organization) {
//             // Add header text
//             doc.fontSize(25).text(`----${reportData.organization.name}----`, { align: 'center', underline: true  }).moveDown(0);
//             doc.fontSize(13).text(`${reportData.organization.address}`, { align: 'center' }).moveDown(1.4);
//           }
//         };

// // Listen for the 'pageAdded' event and add the header to each page
// doc.on('pageAdded', () => {
//   doc.switchToPage(doc.bufferedPageRange().count); // Switch to the newly added page
//   addOrganizationDetailsHeader(); // Add organization details as the header
// });

// // Add the organization details header to the first page
// addOrganizationDetailsHeader();


//     // Add report title
//     doc.fontSize(23).text('Weekly Report', { align: 'center', underline: true }).moveDown();

//     doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke();
//     doc.on('pageAdded', () => {
//       doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke();
//     });

//     // Add report data
//     doc.fontSize(16).text(`Total Members Joining This Week: ${reportData.totalMembersJoiningThisWeek}`).moveDown();
//     doc.fontSize(16).text(`Total Members Leaving This Week: ${reportData.totalMembersLeavingThisWeek}`).moveDown();
//     doc.fontSize(16).text(`Total Payments Received This Week: ${reportData.totalPaymentsReceivedThisWeek}`).moveDown();
//     doc.fontSize(16).text(`Total Overdue Payments This Week: ${reportData.totalOverduePaymentsThisWeek}`).moveDown();
    
//     doc.moveDown(1);


//     // Add members leaving this week
//     if (reportData.membersLeavingThisWeek.length > 0) {
//       doc.fontSize(18).text('Members Leaving This Week:', { underline: true }).moveDown();
//       reportData.membersLeavingThisWeek.forEach(member => {
//         doc.fontSize(14).text(`${member.name}, ${member.email}`).moveDown();
//       });
//     } else {
//       doc.fontSize(18).text('Members Leaving This Week:', { underline: true }).moveDown();
//       doc.fontSize(14).text('No members leaving this week.').moveDown();
//     }

//     doc.moveDown(1);

//     // Add members joining this week
//     if (reportData.membersJoiningThisWeek.length > 0) {
//       doc.fontSize(18).text('Members Joining This Week:', { underline: true }).moveDown();
//       reportData.membersJoiningThisWeek.forEach(member => {
//         doc.fontSize(14).text(`${member.name}, ${member.email}`).moveDown();
//       });
//     } else {
//       doc.fontSize(18).text('Members Joining This Week:', { underline: true }).moveDown();
//       doc.fontSize(14).text('No members joining this week.').moveDown();
//     }

//     doc.end(); // End PDF generation

//     // Set response headers
//     res.setHeader('Content-Disposition', 'attachment; filename="weekly_report.pdf"');
//     res.setHeader('Content-Type', 'application/pdf');

//     // Pipe the PDF stream to the response
//     stream.pipe(res);
//   } catch (error) {
//     console.error('Error generating weekly PDF report:', error);
//     res.status(500).json({ message: 'An error occurred while generating the weekly PDF report.' });
//   }
// }



export async function generateWeeklyPDFReportPuppeteer(req, res) {
  const { organizationId } = req.params;

  try {
    const reportData = await generateReportData(organizationId);
    // console.log(reportData);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html></html>
      <head>
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
      text-align: center;
      text-decoration: underline;
      margin-top: 20px;
      margin-bottom: 20px;
      color: #333;
      }
      .section-title {
      font-size: 30px;
      margin-bottom: 10px;
      color: #555;
      }
      .data {
      
      color: #777;
      }
      .member-list {
      
      color: #777;
      }
      .member-list ul {
      list-style-type: none;
      padding-left: 0;
      }
      .member-list li {
      margin-bottom: 10px;
      }
      table {
      width: 100%;
      border-collapse: collapse;
      }
      th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
      }
      /* Add more styles as needed */
      .page {
      border: 1px solid #ccc;
      padding: 20px;
      margin-bottom: 20px;
      }
      .summary-section {
      padding: 10px;
      margin-bottom: 20px;
      }
      .leaving-section {
      
      padding: 10px;
      margin-bottom: 20px;
      }
      .joining-section {
      
      padding: 10px;
      margin-bottom: 20px;
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
      .summary-table {
      width: 100%;
      border-collapse: collapse;
      }
      .summary-table th {
      background-color: #b3d9ff;
      }
      .summary-table td:nth-child(even) {
      background-color: #e6f2ff;
      }
      .summary-table td:nth-child(odd) {
      background-color: #f2f2f2;
      }
      .summary-table tr:nth-child(even) {
      background-color: #e6f2ff;
      }
      .summary-table tr:nth-child(odd) {
      background-color: #ffffff;
      }
      </style>
      </head>
      <body>
      <div class="organization-details">
      <div class="organization-name">${reportData.organization.name}</div>
      <div class="organization-address">${reportData.organization.address}</div>
      </div>  
      </div>
      <div class="report-title">Weekly Report</div>
      
      <div class="summary-section">
      <div class="section-title">Summary:</div>
      <table class="summary-table">
      
      <tr>
      <td>Total Members Joining This Week:</td>
      <td>${reportData.totalMembersJoiningThisWeek}</td>
      </tr>
      <tr>
      <td>Total Members Leaving This Week:</td>
      <td>${reportData.totalMembersLeavingThisWeek}</td>
      </tr>
      <tr>
      <td>Total Payments Received This Week:</td>
      <td>${reportData.totalPaymentsReceivedThisWeek}</td>
      </tr>
      <tr>
      <td>Total Overdue Payments This Week:</td>
      <td>${reportData.totalOverduePaymentsThisWeek}</td>
      </tr>
      </table>
      </div>
      
      <div class="leaving-section">
      <div class="section-title">Members Leaving This Week:</div>
      <div class="member-list">
      <table>
      <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Phone</th>
      </tr>
      ${reportData.membersLeavingThisWeek.map((member, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#e6f2ff' : '#ffffff'};">
      <td>${member.name}</td>
      <td>${member.email}</td>
      <td>${member.phone}</td>
      </tr>
      `).join('')}
      </table>
      </div>
      </div>
      
      <div class="joining-section">
      <div class="section-title">Members Joining This Week:</div>
      <div class="member-list">
      <table>
      <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Phone</th>
      </tr>
      ${reportData.membersJoiningThisWeek.map((member, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#e6f2ff' : '#ffffff'};">
      <td>${member.name}</td>
      <td>${member.email}</td>
      <td>${member.phone}</td>
      </tr>
      `).join('')}
      </table>
      </div>
      </div>
      </body>
      </html>
    `);

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true,});

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=weekly_report-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating weekly PDF report:', error);
    res.status(500).json({ message: 'An error occurred while generating the weekly PDF report.' });
  }
}



// Function to generate the weekly Excel report
export async function generateWeeklyExcelReport(req, res) {
  const { organizationId } = req.params; // Extract organization ID from request parameters
  try {
    const reportData = await generateReportData(organizationId); // Pass organization ID to the data generation function

    // Create a new workbook
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Weekly Report');

    // Add organization details to the worksheet
    if (reportData.organization) {
      worksheet.addRow(['Organization Name:', reportData.organization.name]);
      worksheet.addRow(['Organization Address:', reportData.organization.address]);
      // Add more organization details as needed
      worksheet.addRow([]); // Add an empty row for separation
    }

    // Add report headers
    worksheet.addRow(['Weekly Report']).font = { bold: true, size: 16 };
    worksheet.addRow([]);

    // Add report data
    worksheet.addRow(['Total Members Joining This Week', reportData.totalMembersJoiningThisWeek]);
    worksheet.addRow(['Total Members Leaving This Week', reportData.totalMembersLeavingThisWeek]);
    worksheet.addRow(['Total Payments Received This Week', reportData.totalPaymentsReceivedThisWeek]);
    worksheet.addRow(['Total Overdue Payments This Week', reportData.totalOverduePaymentsThisWeek]);

    // Add members leaving this week
    worksheet.addRow([]);
    worksheet.addRow(['Members Leaving This Week']).font = { bold: true };
    reportData.membersLeavingThisWeek.forEach(member => {
      worksheet.addRow([member.name, member.email]);
    });

    // Add members joining this week
    worksheet.addRow([]);
    worksheet.addRow(['Members Joining This Week']).font = { bold: true };
    reportData.membersJoiningThisWeek.forEach(member => {
      worksheet.addRow([member.name, member.email]);
    });

    // Auto-size columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const length = cell.value ? String(cell.value).length : 0;
        if (length > maxLength) {
          maxLength = length;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers for Excel file
    res.setHeader('Content-Disposition', 'attachment; filename="weekly_report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating weekly Excel report:', error);
    res.status(500).json({ message: 'An error occurred while generating the weekly Excel report.' });
  }
}


// Function to generate report data
async function generateReportData(organizationId) {
  // Fetch organization details
  const organization = await OrganizationModel.findById(organizationId);

  const today = moment();
  const startOfWeek = moment().startOf('week');
  const endOfWeek = moment().endOf('week');

  // Query members joining this week for the given organization
  const membersJoiningThisWeek = await MemberModel.find({
    organization: organizationId,
    createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
  });

  // console.log(startOfWeek.toDate(), endOfWeek.toDate());

  // Query members leaving this week for the given organization
  const membersLeavingThisWeek = await MemberModel.find({
    organization: organizationId,
    updatedAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() },
    membershipStatus: 'expired'
  });

  // Query payments received this week for the given organization
  const paymentsReceivedThisWeek = await PaymentModel.find({
    organization: organizationId,
    createdAt: { $gte: startOfWeek.toDate(), $lte: today.toDate() }
  });

  // Query overdue payments this week for the given organization
  const overduePaymentsThisWeek = await PaymentModel.find({
    organization: organizationId,
    createdAt: { $lt: startOfWeek.toDate() },
    isReceived: false
  });

  return {
    organization,
    totalMembersJoiningThisWeek: membersJoiningThisWeek.length,
    totalMembersLeavingThisWeek: membersLeavingThisWeek.length,
    totalPaymentsReceivedThisWeek: paymentsReceivedThisWeek.reduce((total, payment) => total + payment.amount, 0),
    totalOverduePaymentsThisWeek: overduePaymentsThisWeek.length,
    membersLeavingThisWeek: membersLeavingThisWeek.map(member => ({
      name: member.name,
      email: member.email,
      phone: member.phone,
    })),
    membersJoiningThisWeek: membersJoiningThisWeek.map(member => ({
      name: member.name,
      email: member.email,
      phone: member.phone,
    }))
  };
}
