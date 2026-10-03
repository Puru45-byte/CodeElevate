import "server-only";
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, degrees } from "pdf-lib";
import QRCode from "qrcode";

/** All data needed to render the certificate PDF */
export interface CertificatePDFData {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  urlSlug: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  issuedAt: string; // ISO date
  signatoryName: string;
  signatoryTitle: string;
  organization: string;
  siteUrl: string;
}

/** Returns a Uint8Array of the generated PDF bytes */
export async function generateCertificatePDF(
  data: CertificatePDFData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // A4 Landscape: 841.89 x 595.28 points
  const PAGE_W = 841.89;
  const PAGE_H = 595.28;
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  // ─── Fonts ───
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // ─── Colors ───
  const blue = rgb(0.15, 0.35, 0.7); // Deep blue
  const lightBlue = rgb(0.22, 0.45, 0.78);
  const darkBlue = rgb(0.08, 0.2, 0.5);
  const gold = rgb(0.72, 0.57, 0.2);
  const darkText = rgb(0.15, 0.15, 0.15);
  const grayText = rgb(0.35, 0.35, 0.35);
  const white = rgb(1, 1, 1);

  // ─── Background fill ───
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: rgb(0.98, 0.98, 1),
  });

  // ─── Ornate Border (Triple-line frame) ───
  const borderOuterMargin = 20;
  const borderMidMargin = 28;
  const borderInnerMargin = 34;

  // Outer border
  drawBorderRect(page, borderOuterMargin, PAGE_W, PAGE_H, 3, blue);
  // Middle border
  drawBorderRect(page, borderMidMargin, PAGE_W, PAGE_H, 1.5, lightBlue);
  // Inner border
  drawBorderRect(page, borderInnerMargin, PAGE_W, PAGE_H, 0.8, gold);

  // ─── Corner decorative elements ───
  const cornerSize = 12;
  const corners = [
    { x: borderOuterMargin + 5, y: PAGE_H - borderOuterMargin - 5 },
    { x: PAGE_W - borderOuterMargin - 5, y: PAGE_H - borderOuterMargin - 5 },
    { x: borderOuterMargin + 5, y: borderOuterMargin + 5 },
    { x: PAGE_W - borderOuterMargin - 5, y: borderOuterMargin + 5 },
  ];
  for (const c of corners) {
    page.drawRectangle({
      x: c.x - cornerSize / 2,
      y: c.y - cornerSize / 2,
      width: cornerSize,
      height: cornerSize,
      color: gold,
      rotate: degrees(45),
    });
  }

  // ─── Horizontal decorative lines ───
  const lineY_top = PAGE_H - 120;
  const lineY_bottom = 130;
  page.drawLine({
    start: { x: 80, y: lineY_top },
    end: { x: PAGE_W - 80, y: lineY_top },
    thickness: 0.5,
    color: gold,
  });
  page.drawLine({
    start: { x: 80, y: lineY_bottom },
    end: { x: PAGE_W - 80, y: lineY_bottom },
    thickness: 0.5,
    color: gold,
  });

  // ─── "CodeElevate" Logo / Name at top ───
  const logoText = "CodeElevate";
  drawCenteredText(page, logoText, PAGE_H - 80, fontBold, 16, darkBlue, PAGE_W);

  // ─── Small tagline ───
  drawCenteredText(
    page,
    "Practical Internship & Career Acceleration Platform",
    PAGE_H - 98,
    fontItalic,
    8,
    grayText,
    PAGE_W
  );

  // ─── "CERTIFICATE OF COMPLETION" heading ───
  drawCenteredText(
    page,
    "CERTIFICATE OF COMPLETION",
    PAGE_H - 155,
    fontBold,
    28,
    blue,
    PAGE_W
  );

  // ─── "This is to certify that" ───
  drawCenteredText(
    page,
    "This is to certify that",
    PAGE_H - 195,
    fontItalic,
    12,
    grayText,
    PAGE_W
  );

  // ─── Student Name (large serif) ───
  drawCenteredText(
    page,
    data.studentName,
    PAGE_H - 235,
    fontSerif,
    32,
    darkText,
    PAGE_W
  );

  // ─── Underline below name ───
  const nameWidth = fontSerif.widthOfTextAtSize(data.studentName, 32);
  const nameX = (PAGE_W - nameWidth) / 2;
  page.drawLine({
    start: { x: nameX - 10, y: PAGE_H - 242 },
    end: { x: nameX + nameWidth + 10, y: PAGE_H - 242 },
    thickness: 0.8,
    color: gold,
  });

  // ─── "has successfully completed" ───
  drawCenteredText(
    page,
    "has successfully completed",
    PAGE_H - 270,
    fontItalic,
    12,
    grayText,
    PAGE_W
  );

  // ─── Course name ───
  drawCenteredText(
    page,
    `${data.courseName} Internship`,
    PAGE_H - 300,
    fontBold,
    18,
    darkBlue,
    PAGE_W
  );

  // ─── "Duration: 1 Month" ───
  drawCenteredText(
    page,
    "Duration: 1 Month (Remote)",
    PAGE_H - 325,
    fontRegular,
    10,
    grayText,
    PAGE_W
  );

  // ─── Dates Row ───
  const formattedStart = formatCertDate(data.startDate);
  const formattedEnd = formatCertDate(data.endDate);
  const formattedIssued = formatCertDate(data.issuedAt);
  const datesRow = `Start Date: ${formattedStart}    |    End Date: ${formattedEnd}    |    Issue Date: ${formattedIssued}`;
  drawCenteredText(page, datesRow, PAGE_H - 345, fontRegular, 8.5, grayText, PAGE_W);

  // ─── Certificate ID ───
  drawCenteredText(
    page,
    `Certificate ID: ${data.certificateNumber}`,
    PAGE_H - 365,
    fontRegular,
    9,
    darkText,
    PAGE_W
  );

  // ─── QR Code (bottom right) ───
  const verificationUrl = `${data.siteUrl}/verify/${data.urlSlug}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 100,
    margin: 1,
    color: { dark: "#1a3b7a", light: "#f9f9ff" },
  });
  const qrBase64 = qrDataUrl.split(",")[1];
  const qrImageBytes = Uint8Array.from(atob(qrBase64), (c) =>
    c.charCodeAt(0)
  );
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  const qrSize = 75;
  page.drawImage(qrImage, {
    x: PAGE_W - 60 - qrSize,
    y: 42,
    width: qrSize,
    height: qrSize,
  });

  // ─── "Scan to Verify" label under QR ───
  drawCenteredTextAt(
    page,
    "Scan to Verify",
    35,
    fontRegular,
    6.5,
    grayText,
    PAGE_W - 60 - qrSize / 2
  );

  // ─── Signatory (bottom left area) ───
  const sigX = 100;
  const sigBaseY = 80;

  // Signature line
  page.drawLine({
    start: { x: sigX, y: sigBaseY + 20 },
    end: { x: sigX + 150, y: sigBaseY + 20 },
    thickness: 0.8,
    color: darkText,
  });

  page.drawText(data.signatoryName, {
    x: sigX,
    y: sigBaseY + 5,
    size: 10,
    font: fontBold,
    color: darkText,
  });

  page.drawText(data.signatoryTitle, {
    x: sigX,
    y: sigBaseY - 8,
    size: 7.5,
    font: fontRegular,
    color: grayText,
  });

  page.drawText(data.organization, {
    x: sigX,
    y: sigBaseY - 20,
    size: 7.5,
    font: fontRegular,
    color: grayText,
  });

  // ─── Bottom center: verification URL text ───
  drawCenteredText(
    page,
    `Verify at: ${verificationUrl}`,
    50,
    fontRegular,
    7,
    grayText,
    PAGE_W
  );

  // ─── Finalize ───
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// ─── Helper functions ───

function drawBorderRect(
  page: PDFPage,
  margin: number,
  pageW: number,
  pageH: number,
  thickness: number,
  color: ReturnType<typeof rgb>
) {
  page.drawRectangle({
    x: margin,
    y: margin,
    width: pageW - 2 * margin,
    height: pageH - 2 * margin,
    borderColor: color,
    borderWidth: thickness,
  });
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  pageWidth: number
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (pageWidth - textWidth) / 2,
    y,
    size,
    font,
    color,
  });
}

function drawCenteredTextAt(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  centerX: number
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX - textWidth / 2,
    y,
    size,
    font,
    color,
  });
}

function formatCertDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}
