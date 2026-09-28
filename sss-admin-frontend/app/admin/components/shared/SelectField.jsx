"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

function SelectField({
  label,
  value,
  onChange,
  options,
  error = "",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/40">
        {label}
      </span>

      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-full appearance-none rounded-xl border bg-[#0e142c] px-3 pr-9 text-sm text-white outline-none ${
            error
              ? "border-red-400/70 focus:border-red-400"
              : "border-white/10 focus:border-cyan-400/50"
          }`}
        >
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
        />
      </div>

      {error && (
        <p className="mt-1 text-[11px] font-medium text-red-300">
          {error}
        </p>
      )}
    </label>
  );
}

export default SelectField;