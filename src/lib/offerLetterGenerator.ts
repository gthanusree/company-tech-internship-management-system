import { jsPDF } from 'jspdf';
import { Application } from '../types/index.ts';

export function generateOfferLetterPdf(application: Application): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(15, 23, 42); // Navy #0f172a
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(37, 99, 235); // Royal Blue #2563eb
  doc.rect(0, 28, pageWidth, 2.5, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('COMPANY TECH', margin, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('TALENT DEVELOPMENT & INTERNSHIP OPERATIONS', margin, 23);

  // Top Right Reference ID
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  const refText = `REF: CT-OFFER-${application.applicationId}`;
  doc.text(refText, pageWidth - margin - doc.getTextWidth(refText), 17);

  const issueDate = application.decisionAt 
    ? new Date(application.decisionAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const dateText = `Date: ${issueDate}`;
  doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), 23);

  let currentY = 42;

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('INTERNSHIP OFFER LETTER', margin, currentY);

  currentY += 8;

  // Candidate Details Card
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  // Column 1
  doc.text('CANDIDATE NAME:', margin + 6, currentY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(application.fullName, margin + 6, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('COLLEGE / INSTITUTION:', margin + 6, currentY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const collegeDisplay = application.college.length > 38 ? application.college.substring(0, 35) + '...' : application.college;
  doc.text(collegeDisplay, margin + 6, currentY + 28);

  // Column 2
  const col2X = margin + 92;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('APPLICATION ID:', col2X, currentY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(application.applicationId, col2X, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('REGISTERED EMAIL:', col2X, currentY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(application.email, col2X, currentY + 28);

  currentY += 40;

  // Formal Salutation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Dear ${application.fullName},`, margin, currentY);

  currentY += 7;

  // Opening Paragraph
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const p1 = `We are pleased to inform you that you have been selected for the position of ${application.role} Intern at Company Tech. Following a thorough review of your application and credentials, our team is excited to welcome you to our student talent cohort.`;
  const splitP1 = doc.splitTextToSize(p1, contentWidth);
  doc.text(splitP1, margin, currentY);
  currentY += splitP1.length * 5.2 + 4;

  // Terms & Particulars Table
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, contentWidth, 38, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 38, 2, 2, 'D');

  const terms = [
    { label: 'Role & Department:', value: `${application.role} (Engineering & Technology)` },
    { label: 'Internship Duration:', value: application.internshipDuration || '2 months' },
    { label: 'Joining Date:', value: application.joiningDate || 'Immediate / Configured upon acceptance' },
    { label: 'Working Arrangement:', value: 'Remote / Flexible Project-Driven Schedule' },
  ];

  let tableRowY = currentY + 7;
  terms.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.label, margin + 6, tableRowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.value, margin + 65, tableRowY);
    tableRowY += 7.5;
  });

  currentY += 46;

  // Scope & Expectations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Learning Objectives & Guidelines:', margin, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.setTextColor(71, 85, 105);

  const bullets = [
    'You will be paired with designated technical mentors to work on practical tasks and real-world system modules.',
    'You are expected to participate in scheduled sprint reviews, code demos, and milestone deliverables.',
    'All intellectual property, proprietary code, and materials shared during your internship remain the property of Company Tech.',
    'Upon satisfactory completion of the internship duration, you will receive an official Internship Completion Certificate & Experience Credential.',
  ];

  bullets.forEach((bullet) => {
    doc.setFillColor(37, 99, 235);
    doc.circle(margin + 2, currentY - 1.2, 1, 'F');
    const splitBullet = doc.splitTextToSize(bullet, contentWidth - 8);
    doc.text(splitBullet, margin + 7, currentY);
    currentY += splitBullet.length * 4.6 + 2;
  });

  currentY += 6;

  // Closing note
  const closingText = 'We look forward to an enriching learning journey together. Welcome aboard to Company Tech!';
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(closingText, margin, currentY);

  currentY += 14;

  // Signature Block (Strict requirement: "HR Support and Co-Founder")
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY + 12, margin + 65, currentY + 12);

  // Digital Signature Representation
  doc.setFont('courier', 'bolditalic');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138); // Blue
  doc.text('Company Tech Admin', margin + 2, currentY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('HR Support and Co-Founder', margin, currentY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Company Tech — Talent & Operations', margin, currentY + 22);

  // Verification Seal on bottom right
  const sealX = pageWidth - margin - 55;
  doc.setDrawColor(37, 99, 235);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(sealX, currentY - 2, 55, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text('OFFICIAL VERIFICATION', sealX + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Status: APPROVED & SIGNED', sealX + 4, currentY + 12);
  doc.text(`ID: ${application.applicationId}`, sealX + 4, currentY + 17);
  doc.text('Company Tech Secure System', sealX + 4, currentY + 22);

  // Bottom Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const footerText = 'Company Tech — Automated Internship Management Prototype • Confidential & Official';
  doc.text(footerText, pageWidth / 2 - doc.getTextWidth(footerText) / 2, pageHeight - 5);

  return doc;
}

export function downloadOfferLetterPdf(application: Application): void {
  const doc = generateOfferLetterPdf(application);
  const sanitizedName = application.fullName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Company-Tech-Offer-Letter-${sanitizedName}-${application.applicationId}.pdf`);
}

export function getOfferLetterDataUrl(application: Application): string {
  const doc = generateOfferLetterPdf(application);
  return doc.output('datauristring');
}

export function getOfferLetterBase64(application: Application): string {
  const doc = generateOfferLetterPdf(application);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(doc.output('arraybuffer')).toString('base64');
  }
  const dataUri = doc.output('datauristring');
  return dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
}
