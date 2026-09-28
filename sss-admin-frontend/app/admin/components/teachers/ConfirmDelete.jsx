"use client";

import { AlertTriangle } from "lucide-react";

function ConfirmDelete({
  teacher,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#171d39] p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
          <AlertTriangle size={20} />
        </div>

        <h3 className="mt-4 text-xl font-bold">
          Delete Teacher?
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/45">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white/75">
            {teacher.full_name}
          </span>
          ? The teacher will be marked inactive and
          the teaching mappings will also be disabled.
        </p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete;