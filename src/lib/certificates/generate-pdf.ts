import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

/** All data needed to render the certificate PDF */
export interface CertificatePDFData {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  urlSlug: string;
  startDate: string; // ISO or formatted date
  endDate: string; // ISO or formatted date
  issuedAt: string; // ISO or formatted date
  signatoryName?: string;
  signatoryTitle?: string;
  organization?: string;
  tagline?: string;
  signatureText?: string;
  siteUrl?: string;
}

// ─── Color Palette ───
const COLOR_BG = rgb(0.98, 0.988, 1.0); // #FAFCFF
const COLOR_NAVY = rgb(0.071, 0.161, 0.369); // #12295E
const COLOR_TITLE_BLUE = rgb(0.137, 0.345, 0.722); // #2358B8
const COLOR_GOLD = rgb(0.722, 0.537, 0.184); // #B8892F
const COLOR_BODY_GRAY = rgb(0.365, 0.396, 0.451); // #5D6573
const COLOR_DARK_TEXT = rgb(0.122, 0.141, 0.188); // #1F2430
const COLOR_LINE_GRAY = rgb(0.541, 0.561, 0.60); // #8A8F99
const COLOR_WHITE = rgb(1, 1, 1);

// ─── Page Dimensions ───
const PAGE_W = 841.89; // A4 Landscape width
const PAGE_H = 595.28; // A4 Landscape height
const CENTER_X = 421; // Horizontal center

/**
 * Converts top-down Y coordinate to pdf-lib bottom-left Y coordinate
 */
function toPdfY(yTop: number): number {
  return PAGE_H - yTop;
}

/**
 * Sanitizes input text to replace unencodable non-WinAnsi characters
 * so pdf-lib font rendering never throws.
 */
function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\u2014\u2013]/g, "-") // em-dash, en-dash
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u00A0]/g, " ") // non-breaking space
    .replace(/[^\x00-\xFF]/g, "") // strip non-Latin1 / WinAnsi characters
    .trim();
}

/**
 * Formats ISO date string to "DD Mon YYYY" (e.g. 09 Oct 2026)
 */
function formatCertDate(rawDate: string): string {
  if (!rawDate) return "";
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate;
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return rawDate;
  }
}

/**
 * Draws text horizontally centered on X from top-center Y coordinate
 */
function drawCenteredTextByTopCenter(
  page: PDFPage,
  text: string,
  yTopCenter: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  centerX = CENTER_X
) {
  const safeText = sanitizeText(text);
  if (!safeText) return;
  const textWidth = font.widthOfTextAtSize(safeText, size);
  const yPdfCenter = toPdfY(yTopCenter);
  // Cap-height adjustment for vertical centering
  const yPdfBaseline = yPdfCenter - size * 0.35;

  page.drawText(safeText, {
    x: centerX - textWidth / 2,
    y: yPdfBaseline,
    size,
    font,
    color,
  });
}

/**
 * Returns a Uint8Array of the generated PDF bytes matching the reference design.
 */
export async function generateCertificatePDF(
  data: CertificatePDFData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  // ─── Standard Fonts ───
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontTimesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  // ─── Script Signature Font ───
  let fontScript = fontHelveticaOblique;
  try {
    const fontPath = path.join(process.cwd(), "src/assets/fonts/MrsSaintDelafield-Regular.ttf");
    if (fs.existsSync(fontPath)) {
      const fontBytes = fs.readFileSync(fontPath);
      fontScript = await pdfDoc.embedFont(fontBytes);
    }
  } catch (err) {
    console.warn("[CERT_PDF] Could not load script font, falling back to Oblique:", err);
  }

  // ─── 1. Background Fill ───
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: COLOR_BG,
  });

  // ─── 2. Outer Navy Border (5 pt, inset 16 pt) ───
  page.drawRectangle({
    x: 16,
    y: 16,
    width: PAGE_W - 32,
    height: PAGE_H - 32,
    borderColor: COLOR_NAVY,
    borderWidth: 5,
  });

  // ─── 3. Gold Frame (1.5 pt, inset 27 pt) ───
  page.drawRectangle({
    x: 27,
    y: 27,
    width: PAGE_W - 54,
    height: PAGE_H - 54,
    borderColor: COLOR_GOLD,
    borderWidth: 1.5,
  });

  // ─── 4. Thin Blue Frame (0.75 pt, inset 33 pt) ───
  page.drawRectangle({
    x: 33,
    y: 33,
    width: PAGE_W - 66,
    height: PAGE_H - 66,
    borderColor: COLOR_TITLE_BLUE,
    borderWidth: 0.75,
  });

  // ─── 5. Four Corner Brackets (Gold 1.5 pt, inset 43 pt, arm 46 pt) ───
  const inset = 43;
  const arm = 46;

  // Top-Left Corner Bracket
  page.drawLine({
    start: { x: inset, y: toPdfY(inset) },
    end: { x: inset + arm, y: toPdfY(inset) },
    thickness: 1.5,
    color: COLOR_GOLD,
  });
  page.drawLine({
    start: { x: inset, y: toPdfY(inset) },
    end: { x: inset, y: toPdfY(inset + arm) },
    thickness: 1.5,
    color: COLOR_GOLD,
  });

  // Top-Right Corner Bracket
  page.drawLine({
    start: { x: PAGE_W - inset, y: toPdfY(inset) },
    end: { x: PAGE_W - inset - arm, y: toPdfY(inset) },
    thickness: 1.5,
    color: COLOR_GOLD,
  });
  page.drawLine({
    start: { x: PAGE_W - inset, y: toPdfY(inset) },
    end: { x: PAGE_W - inset, y: toPdfY(inset + arm) },
    thickness: 1.5,
    color: COLOR_GOLD,
  });

  // Bottom-Left Corner Bracket
  page.drawLine({
    start: { x: inset, y: toPdfY(PAGE_H - inset) },
    end: { x: inset + arm, y: toPdfY(PAGE_H - inset) },
    thickness: 1.5,
    color: COLOR_GOLD,
  });
  page.drawLine({
    start: { x: inset, y: toPdfY(PAGE_H - inset) },
    end: { x: inset, y: toPdfY(PAGE_H - inset - arm) },
    thickness: 1.5,
    color: COLOR_GOLD,
  });

  // Bottom-Right Corner Bracket
  page.drawLine({
    start: { x: PAGE_W - inset, y: toPdfY(PAGE_H - inset) },
    end: { x: PAGE_W - inset - arm, y: toPdfY(PAGE_H - inset) },
    thickness: 1.5,
    color: COLOR_GOLD,
  });
  page.drawLine({
    start: { x: PAGE_W - inset, y: toPdfY(PAGE_H - inset) },
    end: { x: PAGE_W - inset, y: toPdfY(PAGE_H - inset - arm) },
    thickness: 1.5,
    color: COLOR_GOLD,
  });

  // ─── 6. Four Small Navy Diamonds (13 pt wide, centered 57 pt from edges) ───
  const diamondDist = 57;
  const diamondSize = 13;
  const diamondOffset = diamondSize / Math.SQRT2;

  const diamondCenters = [
    { cx: diamondDist, cyTop: diamondDist },
    { cx: PAGE_W - diamondDist, cyTop: diamondDist },
    { cx: diamondDist, cyTop: PAGE_H - diamondDist },
    { cx: PAGE_W - diamondDist, cyTop: PAGE_H - diamondDist },
  ];

  for (const dc of diamondCenters) {
    page.drawRectangle({
      x: dc.cx,
      y: toPdfY(dc.cyTop) - diamondOffset,
      width: diamondSize,
      height: diamondSize,
      color: COLOR_NAVY,
      rotate: degrees(45),
    });
  }

  // ─────────────────────────────────────────────────────────────
  // TEXT SECTION (Top-down Y coordinates)
  // ─────────────────────────────────────────────────────────────

  // 1. "CodeElevate" (Helvetica-Bold 26 pt, Navy, y = 72)
  drawCenteredTextByTopCenter(
    page,
    "CodeElevate",
    72,
    fontHelveticaBold,
    26,
    COLOR_NAVY
  );

  // 2. Tagline (Helvetica-Oblique 9 pt, Gray, y = 94)
  const taglineText =
    data.tagline || "Practical Internship & Career Acceleration Platform";
  drawCenteredTextByTopCenter(
    page,
    taglineText,
    94,
    fontHelveticaOblique,
    9,
    COLOR_BODY_GRAY
  );

  // 3. Gold Divider (x: 251 to 591 at y = 112, circle r = 3 at x = 421)
  const dividerYPdf = toPdfY(112);
  page.drawLine({
    start: { x: 251, y: dividerYPdf },
    end: { x: 591, y: dividerYPdf },
    thickness: 1.2,
    color: COLOR_GOLD,
  });
  page.drawCircle({
    x: CENTER_X,
    y: dividerYPdf,
    size: 3,
    color: COLOR_GOLD,
  });

  // 4. "CERTIFICATE OF COMPLETION" (Helvetica-Bold 34 pt, Title Blue, y = 150)
  drawCenteredTextByTopCenter(
    page,
    "CERTIFICATE OF COMPLETION",
    150,
    fontHelveticaBold,
    34,
    COLOR_TITLE_BLUE
  );

  // 5. "This is to certify that" (Helvetica-Oblique 12 pt, Gray, y = 195)
  drawCenteredTextByTopCenter(
    page,
    "This is to certify that",
    195,
    fontHelveticaOblique,
    12,
    COLOR_BODY_GRAY
  );

  // 6. Student Name (TimesRomanBoldItalic 46 pt, Dark Text, baseline at y = 252)
  const safeStudentName = sanitizeText(data.studentName || "Student Name");
  let nameFontSize = 46;
  let nameWidth = fontTimesBoldItalic.widthOfTextAtSize(safeStudentName, nameFontSize);

  // Auto-fit Student Name if wider than 440 pt down to min 28 pt
  if (nameWidth > 440) {
    nameFontSize = Math.max(28, (440 / nameWidth) * 46);
    nameWidth = fontTimesBoldItalic.widthOfTextAtSize(safeStudentName, nameFontSize);
  }

  const nameBaselineYPdf = toPdfY(252);
  page.drawText(safeStudentName, {
    x: CENTER_X - nameWidth / 2,
    y: nameBaselineYPdf,
    size: nameFontSize,
    font: fontTimesBoldItalic,
    color: COLOR_DARK_TEXT,
  });

  // Underline directly below name (0.6 pt, #8A8F99, from x = 266 to 576 at y = 264)
  const nameLineYPdf = toPdfY(264);
  page.drawLine({
    start: { x: 266, y: nameLineYPdf },
    end: { x: 576, y: nameLineYPdf },
    thickness: 0.6,
    color: COLOR_LINE_GRAY,
  });

  // 7. "has successfully completed" (Helvetica-Oblique 12 pt, Gray, y = 287)
  drawCenteredTextByTopCenter(
    page,
    "has successfully completed",
    287,
    fontHelveticaOblique,
    12,
    COLOR_BODY_GRAY
  );

  // 8. Course Title (Helvetica-Bold 22 pt, Navy, y = 318)
  let fullCourseTitle = (data.courseName || "Software Engineering").trim();
  if (!fullCourseTitle.toLowerCase().endsWith("internship")) {
    fullCourseTitle += " Internship";
  }
  const safeCourseTitle = sanitizeText(fullCourseTitle);

  let courseFontSize = 22;
  let courseWidth = fontHelveticaBold.widthOfTextAtSize(safeCourseTitle, courseFontSize);

  // Auto-fit & Wrap for Course Title:
  // If wider than 560 pt, reduce down to 14 pt. If still wider, wrap to two lines.
  if (courseWidth > 560) {
    courseFontSize = Math.max(14, (560 / courseWidth) * 22);
    courseWidth = fontHelveticaBold.widthOfTextAtSize(safeCourseTitle, courseFontSize);
  }

  if (courseWidth > 560 && courseFontSize <= 14) {
    const words = safeCourseTitle.split(" ");
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(" ");
    const line2 = words.slice(mid).join(" ");
    drawCenteredTextByTopCenter(page, line1, 310, fontHelveticaBold, 14, COLOR_NAVY);
    drawCenteredTextByTopCenter(page, line2, 326, fontHelveticaBold, 14, COLOR_NAVY);
  } else {
    drawCenteredTextByTopCenter(
      page,
      safeCourseTitle,
      318,
      fontHelveticaBold,
      courseFontSize,
      COLOR_NAVY
    );
  }

  // 9. Dates Line (Helvetica 10.5 pt, Gray, y = 352)
  const startDateStr = formatCertDate(data.startDate);
  const endDateStr = formatCertDate(data.endDate);
  const issueDateStr = formatCertDate(data.issuedAt);
  const datesText = `Start Date: ${startDateStr}   |   End Date: ${endDateStr}   |   Issue Date: ${issueDateStr}`;
  drawCenteredTextByTopCenter(
    page,
    datesText,
    352,
    fontHelvetica,
    10.5,
    COLOR_BODY_GRAY
  );

  // 10. Certificate ID (Helvetica-Bold 10.5 pt, Dark Text, y = 372)
  const certIdText = `Certificate ID: ${data.certificateNumber}`;
  drawCenteredTextByTopCenter(
    page,
    certIdText,
    372,
    fontHelveticaBold,
    10.5,
    COLOR_DARK_TEXT
  );

  // ─────────────────────────────────────────────────────────────
  // FOOTER SECTION
  // ─────────────────────────────────────────────────────────────

  // 1. Thin gray separator line (0.6 pt from x = 70 to 772 at y = 425)
  const footerSeparatorYPdf = toPdfY(425);
  page.drawLine({
    start: { x: 70, y: footerSeparatorYPdf },
    end: { x: 772, y: footerSeparatorYPdf },
    thickness: 0.6,
    color: COLOR_LINE_GRAY,
  });

  // 2. Signature (script text, Mrs Saint Delafield ~44 pt, Navy, vertical center y = 475)
  const sigText = data.signatureText || "Sdeore";
  drawCenteredTextByTopCenter(
    page,
    sigText,
    475,
    fontScript,
    44,
    COLOR_NAVY
  );

  // 3. Signature Line (0.8 pt dark line from x = 311 to 531 at y = 497)
  const sigLineYPdf = toPdfY(497);
  page.drawLine({
    start: { x: 311, y: sigLineYPdf },
    end: { x: 531, y: sigLineYPdf },
    thickness: 0.8,
    color: COLOR_DARK_TEXT,
  });

  // 4. Signer Name (Helvetica-Bold 11 pt, Dark Text, y = 507)
  const signatoryName = data.signatoryName || "Sanika Deore";
  drawCenteredTextByTopCenter(
    page,
    signatoryName,
    507,
    fontHelveticaBold,
    11,
    COLOR_DARK_TEXT
  );

  // 5. Signer Title (Helvetica 8.5 pt, Gray, y = 520)
  const signatoryTitle =
    data.signatoryTitle || "Head of Academic Programs & Engineering";
  drawCenteredTextByTopCenter(
    page,
    signatoryTitle,
    520,
    fontHelvetica,
    8.5,
    COLOR_BODY_GRAY
  );

  // 6. Organization Line (Helvetica 8.5 pt, Gray, y = 531)
  const orgName = data.organization || "CodeElevate EdTech Platform";
  drawCenteredTextByTopCenter(
    page,
    orgName,
    531,
    fontHelvetica,
    8.5,
    COLOR_BODY_GRAY
  );

  // 7. Verification Line (Helvetica 7.5 pt, Gray, y = 547)
  let baseSiteUrl = "https://code-elevate-mu.vercel.app";
  if (data.siteUrl && !data.siteUrl.includes("localhost")) {
    baseSiteUrl = data.siteUrl.replace(/\/$/, "");
  } else if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    baseSiteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  } else if (process.env.VERCEL_URL) {
    const rawVercel = process.env.VERCEL_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
    baseSiteUrl = `https://${rawVercel}`;
  }
  const verifyUrl = `${baseSiteUrl}/verify/${data.urlSlug}`;
  const verifyText = `Verify at: ${verifyUrl}`;
  drawCenteredTextByTopCenter(
    page,
    verifyText,
    547,
    fontHelvetica,
    7.5,
    COLOR_BODY_GRAY
  );

  // 8. QR Code Block (Bottom Right: x: 664 to 756, top: 441 to 533, size 92x92)
  const qrBoxX = 664;
  const qrBoxTop = 441;
  const qrBoxSize = 92;
  const qrBoxYPdf = toPdfY(qrBoxTop + qrBoxSize); // Bottom Y

  // Draw white background square with 1 pt gold border
  page.drawRectangle({
    x: qrBoxX,
    y: qrBoxYPdf,
    width: qrBoxSize,
    height: qrBoxSize,
    color: COLOR_WHITE,
    borderColor: COLOR_GOLD,
    borderWidth: 1,
  });

  // Generate QR code encoding verifyUrl
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 280,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    });
    const qrBase64 = qrDataUrl.split(",")[1];
    const qrImageBytes = Uint8Array.from(Buffer.from(qrBase64, "base64"));
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    const qrInnerSize = 70;
    const qrOffsetX = (qrBoxSize - qrInnerSize) / 2; // 11 pt
    const qrOffsetY = (qrBoxSize - qrInnerSize) / 2; // 11 pt

    page.drawImage(qrImage, {
      x: qrBoxX + qrOffsetX,
      y: qrBoxYPdf + qrOffsetY,
      width: qrInnerSize,
      height: qrInnerSize,
    });
  } catch (qrErr) {
    console.error("[CERT_PDF] QR Code generation error:", qrErr);
  }

  // "Scan to Verify" label under QR box (Helvetica 7.5 pt, Gray, centered at x = 710, y = 543)
  drawCenteredTextByTopCenter(
    page,
    "Scan to Verify",
    543,
    fontHelvetica,
    7.5,
    COLOR_BODY_GRAY,
    710
  );

  // ─── Finalize PDF ───
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
