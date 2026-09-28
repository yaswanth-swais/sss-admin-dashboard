"use client";

import React from "react";
function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#0f152d] p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium text-white/80">
        {value || "-"}
      </p>
    </div>
  );
}


export default Detail;
