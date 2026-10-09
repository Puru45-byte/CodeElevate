import fs from "fs";
import path from "path";
import { generateCertificatePDF } from "../src/lib/certificates/generate-pdf";

async function main() {
  const sampleData = {
    studentName: "Pushkar Patil",
    courseName: "Software Testing & QA Internship",
    certificateNumber: "CE-COMP-0005/2026",
    urlSlug: "CE-COMP-0005-2026",
    startDate: "2026-10-09",
    endDate: "2026-11-08",
    issuedAt: "2026-10-09",
    signatoryName: "Sanika Deore",
    signatoryTitle: "Head of Academic Programs & Engineering",
    organization: "CodeElevate EdTech Platform",
    tagline: "Practical Internship & Career Acceleration Platform",
    signatureText: "Sdeore",
    siteUrl: "https://code-elevate-mu.vercel.app",
  };

  console.log("Generating sample certificate PDF...");
  const pdfBytes = await generateCertificatePDF(sampleData);

  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const outputPath = path.join(tmpDir, "sample.pdf");
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Sample certificate generated successfully at: ${outputPath}`);
}

main().catch((err) => {
  console.error("Error generating sample certificate:", err);
  process.exit(1);
});
