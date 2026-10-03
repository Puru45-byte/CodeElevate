import React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputProps {
  label: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, helperText, icon, id, className, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              {icon}
            </div>
          )}
          <Input
            id={id}
            ref={ref}
            error={error}
            className={cn(icon && "pl-10", className)}
            {...props}
          />
        </div>
        {helperText && !error && (
          <p className="text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";
