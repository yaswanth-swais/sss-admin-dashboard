"use client";

import ModalShell from "../shared/ModalShell";
import Detail from "../shared/Detail";
import { useState } from "react";

import {
  X,
  Image as ImageIcon,
} from "lucide-react";

function StudentView({ student, onClose }) {
  const [largePhoto, setLargePhoto] = useState(null);

  const photos = [
    ["Student Photo", student.student_photo_url],
    ["Father Photo", student.parent1_photo_url],
    ["Mother Photo", student.parent2_photo_url],
    ["Guardian Photo", student.guardian_photo_url],
  ];

  return (
    <>
      <ModalShell
        title="Student Details"
        subtitle={`${student.ui_id || ""} • ${student.name}`}
        onClose={onClose}
        wide
      >
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
              Photos
            </p>

            <div className="grid grid-cols-2 gap-2">
              {photos.map(([label, src]) => (
                <button
                  key={label}
                  type="button"
                  disabled={!src}
                  onClick={() => src && setLargePhoto(src)}
                  className="photo-view-card"
                >
                  {src ? (
                    <img
                      src={src}
                      alt={label}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon
                      size={20}
                      className="text-white/20"
                    />
                  )}

                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Detail
                label="Student ID"
                value={student.ui_id}
              />

              <Detail
                label="Name"
                value={student.name}
              />

              <Detail
                label="Admission Number"
                value={student.admission_no}
              />

              <Detail
                label="Roll Number"
                value={student.roll_number}
              />

              <Detail
                label="Gender"
                value={student.gender}
              />

              <Detail
                label="Class"
                value={student.class_name}
              />

              <Detail
                label="Section"
                value={student.section}
              />

              <Detail
                label="Phone"
                value={student.student_phone}
              />

              <Detail
                label="Email"
                value={student.student_email}
              />

              <Detail
                label="Father"
                value={student.parent1_name}
              />

              <Detail
                label="Father Phone"
                value={student.parent1_phone}
              />

              <Detail
                label="Father Email"
                value={student.parent1_email}
              />

              <Detail
                label="Mother"
                value={student.parent2_name}
              />

              <Detail
                label="Mother Phone"
                value={student.parent2_phone}
              />

              <Detail
                label="Mother Email"
                value={student.parent2_email}
              />

              <Detail
                label="Guardian"
                value={student.guardian_name}
              />

              <Detail
                label="Guardian Phone"
                value={student.guardian_phone}
              />

              <Detail
                label="Guardian Email"
                value={student.guardian_email}
              />
            </div>
          </div>
        </div>
      </ModalShell>

      {largePhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-5"
          onClick={() => setLargePhoto(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLargePhoto(null)}
          >
            <X size={22} />
          </button>

          <img
            src={largePhoto}
            alt="Student"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default StudentView;