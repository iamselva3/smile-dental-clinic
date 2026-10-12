import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { CLINIC_CONFIG } from '../config';

/**
 * Generates an A4 official appointment slip PDF matching the "Warm, Clean, Confident" brand.
 * @param {Object} booking - Booking data
 * @returns {Promise<{doc: jsPDF, blob: Blob, base64: string, refCode: string, download: Function}>}
 */
export async function generateSlipPdf(booking) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const refCode = booking.ref_code || `SDC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Generate QR Code data URL
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(refCode, {
      margin: 1,
      width: 180,
      color: {
        dark: '#0E5A5A',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code for PDF', err);
  }

  const leftMargin = 20;
  const rightMargin = 190;
  const contentWidth = rightMargin - leftMargin;

  // Background tint: warm ivory
  doc.setFillColor(251, 248, 243);
  doc.rect(0, 0, 210, 297, 'F');

  // Main white card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(leftMargin - 5, 15, contentWidth + 10, 267, 4, 4, 'F');

  // Top header bar: Deep teal
  doc.setFillColor(14, 90, 90); // #0E5A5A
  doc.roundedRect(leftMargin - 5, 15, contentWidth + 10, 32, 4, 4, 'F');

  // Clinic title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(CLINIC_CONFIG.name.toUpperCase(), leftMargin, 28);

  // Tagline & location
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(232, 243, 239); // Pale jasmine
  doc.text(`${CLINIC_CONFIG.tagline.toUpperCase()} • ${CLINIC_CONFIG.locationName.toUpperCase()}`, leftMargin, 35);
  doc.text(`Direct Desk: ${CLINIC_CONFIG.phone}  |  Emergency: ${CLINIC_CONFIG.emergencyPhone}`, leftMargin, 41);

  // Reference Code Banner (Marigold accent)
  doc.setFillColor(254, 246, 235); // #FEF6EB
  doc.roundedRect(leftMargin, 54, contentWidth, 22, 3, 3, 'F');
  doc.setDrawColor(242, 169, 59); // Marigold
  doc.setLineWidth(0.6);
  doc.roundedRect(leftMargin, 54, contentWidth, 22, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 90, 90);
  doc.text('OFFICIAL CLINICAL APPOINTMENT VOUCHER', leftMargin + 6, 62);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(224, 150, 40); // Turmeric
  doc.text(refCode, leftMargin + 6, 71);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(91, 103, 112);
  doc.text(`ISSUED: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, rightMargin - 45, 71);

  // Details Table
  let y = 88;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(14, 90, 90);
  doc.text('PATIENT & OPERATORY SPECIFICATIONS', leftMargin, y);

  doc.setDrawColor(233, 227, 216); // #E9E3D8
  doc.setLineWidth(0.4);
  doc.line(leftMargin, y + 2, rightMargin, y + 2);

  y += 10;
  const fields = [
    { label: 'PATIENT NAME', value: (booking.patient_name || 'N/A').toUpperCase() },
    { label: 'CONTACT NUMBER', value: booking.phone || 'N/A' },
    { label: 'EMAIL (RECORDS)', value: booking.email || 'N/A' },
    { label: 'TREATMENT', value: booking.treatment || 'Consultation & Diagnostics' },
    { label: 'ATTENDING DOCTOR', value: booking.doctor || 'Senior Dental Consultant' },
    { label: 'APPOINTMENT DATE', value: booking.date || 'TBD' },
    { label: 'SCHEDULED TIME', value: booking.time_slot || '10:00 AM' },
    { label: 'LEDGER STATUS', value: (booking.status || 'CONFIRMED').toUpperCase() }
  ];

  fields.forEach(field => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(91, 103, 112);
    doc.text(field.label, leftMargin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 42, 46);
    doc.text(String(field.value), leftMargin + 50, y);

    doc.setDrawColor(240, 236, 228);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, y + 2, rightMargin - 45, y + 2);

    y += 9;
  });

  // QR Code on right side
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', rightMargin - 42, 92, 38, 38);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(91, 103, 112);
      doc.text('SCAN TO VERIFY SLIP', rightMargin - 37, 134);
    } catch (e) {
      console.warn('QR code embed error', e);
    }
  }

  // Pre-Consultation Instructions
  y = 168;
  doc.setFillColor(232, 243, 239); // Pale jasmine
  doc.roundedRect(leftMargin, y, contentWidth, 32, 3, 3, 'F');
  doc.setDrawColor(14, 90, 90);
  doc.setLineWidth(0.8);
  doc.line(leftMargin, y, leftMargin, y + 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 90, 90);
  doc.text('IMPORTANT PRE-APPOINTMENT INFORMATION:', leftMargin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 55, 60);
  doc.text('1. Please arrive 10 minutes early for complimentary herbal mouth rinse and initial digital vitals.', leftMargin + 6, y + 14);
  doc.text('2. Please bring any past X-rays or ongoing medical prescriptions for comprehensive evaluation.', leftMargin + 6, y + 20);
  doc.text('3. In case of unexpected delay or rescheduling, kindly message us on WhatsApp: +91 98401 23456.', leftMargin + 6, y + 26);

  // Clinic Address & Landmarks
  y = 212;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(14, 90, 90);
  doc.text('LOCATION & CLINICAL HOURS', leftMargin, y);

  doc.setDrawColor(233, 227, 216);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y + 2, rightMargin, y + 2);

  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(91, 103, 112);
  doc.text('CLINIC ADDRESS:', leftMargin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 42, 46);
  doc.text(`${CLINIC_CONFIG.address.line1}, ${CLINIC_CONFIG.address.line2}`, leftMargin + 35, y);
  y += 5.5;

  doc.text(`${CLINIC_CONFIG.address.city}, ${CLINIC_CONFIG.address.state} - ${CLINIC_CONFIG.address.pincode} (${CLINIC_CONFIG.address.landmark})`, leftMargin + 35, y);
  y += 6.5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 103, 112);
  doc.text('HOURS:', leftMargin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 42, 46);
  doc.text(`${CLINIC_CONFIG.timings.weekdays} | ${CLINIC_CONFIG.timings.sunday}`, leftMargin + 35, y);
  y += 6.5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 103, 112);
  doc.text('EMERGENCY:', leftMargin, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(224, 150, 40);
  doc.text(`${CLINIC_CONFIG.emergencyPhone} (24/7 Acute Toothache Support)`, leftMargin + 35, y);

  // Signature line
  y += 18;
  doc.setDrawColor(180, 190, 195);
  doc.setLineWidth(0.3);
  doc.line(rightMargin - 55, y, rightMargin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(91, 103, 112);
  doc.text('AUTHORISED RECEPTION DESK', rightMargin - 52, y + 4.5);

  // Footer signoff
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(130, 145, 155);
  doc.text('Smile Dental Clinic — Honest, family-centred dental care in South India.', leftMargin, 275);

  const pdfOutput = doc.output('datauristring');
  const base64Data = pdfOutput.split(',')[1];
  const blob = doc.output('blob');

  return {
    doc,
    blob,
    base64: base64Data,
    refCode,
    download: (filename = `SmileDental_Appointment_${refCode}.pdf`) => {
      doc.save(filename);
    }
  };
}
