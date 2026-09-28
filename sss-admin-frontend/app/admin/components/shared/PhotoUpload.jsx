"use client";

import React from "react";

import {
  Upload,
} from "lucide-react";
function PhotoUpload({
  label,
  value,
  existingUrl,
  onChange,
}) {
  const preview = value
    ? URL.createObjectURL(value)
    : existingUrl;

  return (
    <label className="photo-upload-card">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          onChange(e.target.files?.[0] || null)
        }
      />

      {preview ? (
        <img
          src={preview}
          alt={label}
          className="h-24 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-xl bg-[#0e142c]">
          <Upload size={22} className="text-white/25" />
        </div>
      )}

      <span className="mt-2 block text-center text-[10px] font-bold text-white/50">
        {label}
      </span>
    </label>
  );
}


export default PhotoUpload;
