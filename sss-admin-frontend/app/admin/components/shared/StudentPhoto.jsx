"use client";

import React from "react";
function StudentPhoto({ src, name, onClick }) {
  return (
    <button
      type="button"
      onClick={() => src && onClick?.(src)}
      disabled={!src}
      className="group flex h-[50px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0d142d] transition hover:border-cyan-400/50 disabled:cursor-default"
      title={src ? "View student photo" : "No photo"}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Student"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="px-1 text-center text-[10px] font-medium text-white/35">
          No photo
        </span>
      )}
    </button>
  );
}


export default StudentPhoto;
