"use client";

import React from "react";

import {
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
function Toast({ toast }) {
  return (
    <div
      className={`fixed bottom-5 right-5 z-[120] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl ${
        toast.type === "success"
          ? "border-emerald-400/20 bg-[#12362d] text-emerald-100"
          : "border-red-400/20 bg-[#3b1d27] text-red-100"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 size={18} />
      ) : (
        <AlertCircle size={18} />
      )}

      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
}


export default Toast;
