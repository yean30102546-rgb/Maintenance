import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface DropdownOption {
  value: string;
  label: string;
}

export interface GlassSelectProps {
  /** The id and name of the select field */
  name?: string;
  /** Label text displayed above the select */
  label?: string;
  /** Currently selected value */
  value?: string;
  /** Callback fired when a value is selected */
  onValueChange?: (value: string) => void;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Array of options to display */
  options: DropdownOption[] | string[];
  /** Whether the field is required */
  required?: boolean;
  /** Optional z-index for overlapping elements */
  zIndex?: number;
  /** Additional container classes */
  className?: string;
  /** Disables the select */
  disabled?: boolean;
}

/**
 * A reusable Dropdown component styled to match the Add Job (CreateRepairForm) design.
 * Features a glassmorphism style, rounded corners, and forces dropdown to open downwards.
 */
export function GlassSelect({
  name,
  label,
  value,
  onValueChange,
  placeholder = "โปรดเลือก...",
  options,
  required = false,
  zIndex = 100,
  className,
  disabled = false
}: GlassSelectProps) {
  // Normalize options to object array
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') return { value: opt, label: opt };
    return opt;
  });

  return (
    <div className={cn("relative", className)} style={{ zIndex }}>
      {label && (
        <Label 
          htmlFor={name} 
          className="text-sm font-semibold text-gray-700 mb-2 block"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Select 
        name={name} 
        value={value} 
        onValueChange={(val) => {
          if (onValueChange) {
            // @ts-ignore
            onValueChange(val || '');
          }
        }} 
        required={required}
        disabled={disabled}
      >
        <SelectTrigger 
          id={name}
          className="w-full text-base py-6 bg-white/60 backdrop-blur-sm border-gray-200 focus:ring-blue-500 rounded-2xl transition-all shadow-sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          side="bottom" 
          align="start" 
          alignItemWithTrigger={false} 
          className="rounded-2xl shadow-xl border-gray-100 z-[9999] max-h-60 overflow-y-auto"
        >
          {normalizedOptions.map(opt => (
            <SelectItem 
              key={opt.value} 
              value={opt.value} 
              className="text-base py-3 cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
