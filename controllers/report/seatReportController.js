import PDFDocument from 'pdfkit';
import SeatModel from '../../models/SeatModel.js';
import OrganizationModel from '../../models/OrganizationModel.js';
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

export async function generateSeatStatusReportPDF(req, res) {
  try {
    const { organizationId } = req.params;
    const vacantSeatReport = await generateSeatReport(organizationId, 'vacant');
    const occupiedSeatReport = await generateSeatReport(organizationId, 'occupied');
    const doc = generatePDF(vacantSeatReport, occupiedSeatReport);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating seat status report in PDF format:', error);
    res.status(500).json({ message: 'An error occurred while generating seat status report in PDF format.' });
  }
}

async function generateSeatReport(organizationId, status) {
  const organization = await OrganizationModel.findById(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }

  const morningCount = await SeatModel.countDocuments({ organization: organizationId, [`schedule.morning.occupant.${status === 'occupied' ? '$ne' : '$eq'}`]: null });
  const noonCount = await SeatModel.countDocuments({ organization: organizationId, [`schedule.noon.occupant.${status === 'occupied' ? '$ne' : '$eq'}`]: null });
  const eveningCount = await SeatModel.countDocuments({ organization: organizationId, [`schedule.evening.occupant.${status === 'occupied' ? '$ne' : '$eq'}`]: null });

  return { organization: organization.name, morning: morningCount, noon: noonCount, evening: eveningCount };
}


function generatePDF(vacantSeatReport, occupiedSeatReport) {
  const doc = new PDFDocument();

  doc.fontSize(18).text('Seat Status Report', { align: 'center', underline: true }).moveDown();
  
  // Check if vacantSeatReport and occupiedSeatReport are valid objects
  if (vacantSeatReport && typeof vacantSeatReport === 'object') {
    doc.fontSize(16).text('Vacant Seats:', { underline: true }).moveDown();
    Object.entries(vacantSeatReport).forEach(([timeSlot, count]) => {
      doc.fontSize(14).text(`${timeSlot}: ${count}`).moveDown();
    });
  }
  
  doc.moveDown(1);

  // Check if occupiedSeatReport is a valid object
  if (occupiedSeatReport && typeof occupiedSeatReport === 'object') {
    doc.fontSize(16).text('Occupied Seats:', { underline: true }).moveDown();
    Object.entries(occupiedSeatReport).forEach(([timeSlot, count]) => {
      doc.fontSize(14).text(`${timeSlot}: ${count}`).moveDown();
    });
  }

  return doc;
}

