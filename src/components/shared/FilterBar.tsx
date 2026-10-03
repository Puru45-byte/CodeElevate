import React from "react";
import { Button } from "@/components/ui/button";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterBar({
  options,
  selected,
  onChange,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {options.map((option) => {
        const isActive = selected === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={isActive ? "primary" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 text-xs font-semibold transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
