import React from "react";
import { Metadata } from "next";
import { VerifyCertificateContent } from "./verify-content";

export const metadata: Metadata = {
  title: "Verify Certificate | CodeElevate",
  description:
    "Enter a certificate number to verify its authenticity and view details from CodeElevate.",
};

export default function VerifyPage() {
  return <VerifyCertificateContent />;
}
