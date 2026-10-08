"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LegalPrintButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 border-slate-200 hover:border-blue-300 print:hidden"
      aria-label="Print or save this document as PDF"
    >
      <Printer className="h-3.5 w-3.5" />
      <span>Print / Save PDF</span>
    </Button>
  );
}
