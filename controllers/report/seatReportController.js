import PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import SeatModel from '../../models/SeatModel.js';
import OrganizationModel from '../../models/OrganizationModel.js';
import moment from 'moment';
export async function generateSeatStatusReportJSON(req, res) {
  try {
    const { organizationId } = req.params;
    const vacantSeatReport = await generateSeatReport(organizationId, 'vacant');
    const occupiedSeatReport = await generateSeatReport(organizationId, 'occupied');
    res.json({ organization: vacantSeatReport.organization, vacant: vacantSeatReport, occupied: occupiedSeatReport });
  } catch (error) {
    console.error('Error generating seat status report in JSON format:', error);
    res.status(500).json({ message: 'An error occurred while generating seat status report in JSON format.' });
  }
}

// export async function generateSeatStatusReportPDF(req, res) {
//   try {
//     const { organizationId } = req.params;
//     const vacantSeatReport = await generateSeatReport(organizationId, 'vacant');
//     const occupiedSeatReport = await generateSeatReport(organizationId, 'occupied');
//     const doc = generatePDF(vacantSeatReport, occupiedSeatReport);
//     doc.pipe(res);
//     doc.end();
//   } catch (error) {
//     console.error('Error generating seat status report in PDF format:', error);
//     res.status(500).json({ message: 'An error occurred while generating seat status report in PDF format.' });
//   }
// }


// function generatePDF(vacantSeatReport, occupiedSeatReport) {
//   const doc = new PDFDocument();

//   doc.fontSize(18).text('Seat Status Report', { align: 'center', underline: true }).moveDown();
  
//   // Check if vacantSeatReport and occupiedSeatReport are valid objects
//   if (vacantSeatReport && typeof vacantSeatReport === 'object') {
//     doc.fontSize(16).text('Vacant Seats:', { underline: true }).moveDown();
//     Object.entries(vacantSeatReport).forEach(([timeSlot, count]) => {
//       doc.fontSize(14).text(`${timeSlot}: ${count}`).moveDown();
//     });
//   }
  
//   doc.moveDown(1);

//   // Check if occupiedSeatReport is a valid object
//   if (occupiedSeatReport && typeof occupiedSeatReport === 'object') {
//     doc.fontSize(16).text('Occupied Seats:', { underline: true }).moveDown();
//     Object.entries(occupiedSeatReport).forEach(([timeSlot, count]) => {
//       doc.fontSize(14).text(`${timeSlot}: ${count}`).moveDown();
//     });
//   }

//   return doc;
// }

async function generateSeatReport(organizationId, status) {
  const organization = await OrganizationModel.findById(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }

  const morningCount = await SeatModel.countDocuments({ organization: organizationId, [`schedule.morning.occupant.${status === 'occupied' ? '$ne' : '$eq'}`]: null });
  const noonCount = await SeatModel.countDocuments({ organization: organizationId, [`schedule.noon.occupant.${status === 'occupied' ? '$ne' : '$eq'}`]: null });
  const eveningCount = await SeatModel.countDocuments({ organization: organizationId, [`schedule.evening.occupant.${status === 'occupied' ? '$ne' : '$eq'}`]: null });

  return { morning: morningCount, noon: noonCount, evening: eveningCount };
}




export async function generateSeatStatusReportPDF(req, res) {
  try {
    const { organizationId } = req.params;
    const organization = await OrganizationModel.findById(organizationId);
    const vacantSeatReport = await generateSeatReport(organizationId, 'vacant');
    const occupiedSeatReport = await generateSeatReport(organizationId, 'occupied');
    
    const pdfBuffer = await generatePDF(vacantSeatReport, occupiedSeatReport,organization);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=seat-status-report-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating seat status report in PDF format:', error);
    res.status(500).json({ message: 'An error occurred while generating seat status report in PDF format.' });
  }
}

async function generatePDF(vacantSeatReport, occupiedSeatReport,organization) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(`
      <!DOCTYPE html>
      <html>
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
      .section {
        padding: 10px;
        margin-bottom: 20px;
        background-color: #ffffff;
        border-radius: 5px;
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
      .seat-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .seat-table th {
        background-color: #f2f2f2;
        padding: 10px;
        text-align: left;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
      }
      .seat-table td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
      }
      .seat-table .even {
        background-color: #f9f9f9;
      }
      .seat-table .odd {
        background-color: #fff;
      }
      </style>
      </head>
      <body>
      <div class="organization-details">
      <div class="organization-name">${organization.name}</div>
      <div class="organization-address">${organization.address}</div>
      </div>  
      <div class="report-title">Seat Status Report</div>
      
    <div class="section"></div>
      <div class="section-title">Vacant Seats:</div>
      <table class="seat-table">
        <thead>
          <tr>
            <th>Time Slot</th>
            <th>Count</th>
            </tr>
          </tbody>
        </thead>
        <tbody>
          ${Object.entries(vacantSeatReport).map(([timeSlot, count], index) => `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
              <td>${timeSlot}</td>
              <td>${count}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Occupied Seats:</div>
      <table class="seat-table">
        <thead>
          <tr>
            <th>Time Slot</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(occupiedSeatReport).map(([timeSlot, count], index) => `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
              <td>${timeSlot}</td>
              <td>${count}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    </body>
    </html>
  `);

  const pdfBuffer = await page.pdf({ format: 'A4',printBackground: true});

  await browser.close();

  return pdfBuffer;
}
