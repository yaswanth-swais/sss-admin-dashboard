"use client";

import { Image as ImageIcon } from "lucide-react";

function StudentPhoto({ src, name, onClick }) {
  if (!src) {
    return (
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0e142c] text-white/20"
        title="No student photo"
      >
        <ImageIcon size={17} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.(src)}
      className="group relative h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-[#0e142c]"
      title={`View ${name || "student"} photo`}
    >
      <img
        src={src}
        alt={name || "Student"}
        className="h-full w-full object-cover transition duration-200 group-hover:scale-110"
      />

      <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
    </button>
  );
}

export default StudentPhoto;