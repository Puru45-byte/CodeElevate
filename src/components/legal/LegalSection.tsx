import React from "react";

export interface LegalSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function LegalSection({
  id,
  title,
  children,
  className = "",
}: LegalSectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 space-y-3 ${className}`}>
      <div className="border-b border-slate-200 pb-2">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
      </div>
      <div className="text-sm leading-relaxed text-slate-600 space-y-3">
        {children}
      </div>
    </section>
  );
}
