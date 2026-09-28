"use client";

import ModalShell from "../shared/ModalShell";
import {
  Trash2,
} from "lucide-react";
function ConfirmDelete({ student, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171d39] p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
          <Trash2 size={20} />
        </div>

        <h3 className="mt-4 text-xl font-bold">
          Delete Student?
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/50">
          You are deleting{" "}
          <span className="font-semibold text-white">
            {student.name}
          </span>{" "}
          ({student.ui_id}).
          <br />
          The record will be soft-deleted.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-400"
          >
            Delete Student
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */



export default ConfirmDelete;



