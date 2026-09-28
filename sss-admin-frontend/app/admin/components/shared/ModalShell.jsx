"use client";

import React from "react";

import {
  X,
} from "lucide-react";
function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div
        className={`max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#171d39] shadow-2xl sm:rounded-3xl ${
          wide ? "sm:max-w-5xl" : "sm:max-w-2xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#171d39]/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              SSS Admin
            </p>

            <h3 className="mt-0.5 text-lg font-bold">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-0.5 text-xs text-white/40">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}


export default ModalShell;
