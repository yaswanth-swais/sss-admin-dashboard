"use client";

import React from "react";

function Field({
  label,
  value,
  onChange,
  type = "text",
  error = "",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/40">
        {label}
      </span>

      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full rounded-xl border bg-[#0e142c] px-3 text-sm text-white outline-none placeholder:text-white/20 ${
          error
            ? "border-red-400/70 focus:border-red-400"
            : "border-white/10 focus:border-cyan-400/50"
        }`}
      />

      {error && (
        <p className="mt-1 text-[11px] font-medium text-red-300">
          {error}
        </p>
      )}
    </label>
  );
}

export default Field;