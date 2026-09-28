"use client";

import { useMemo, useState } from "react";

import ModalShell from "../shared/ModalShell";
import FormSection from "../shared/FormSection";
import Field from "../shared/Field";
import SelectField from "../shared/SelectField";

import { apiFetch } from "../../../../lib/api";

const emptyTeacher = {
  full_name: "",
  phone: "",
  email_id: "",
  role: "Faculty",
  qualification: "",
};

function TeacherFormModal({
  title,
  teacher,
  classes,
  onClose,
  onSaved,
  setToast,
}) {
  const editing = Boolean(teacher);
  const classList = Array.isArray(classes) ? classes : [];

  const [form, setForm] = useState(() => ({
    ...emptyTeacher,
    full_name: teacher?.full_name ?? "",
    phone: teacher?.phone ?? "",
    email_id: teacher?.email_id ?? "",
    role: teacher?.role === "Headmaster" ? "Headmaster" : "Faculty",
    qualification: teacher?.qualification ?? "",
  }));

  const [mappings, setMappings] = useState(() =>
    teacher?.teaching_mappings?.length
      ? teacher.teaching_mappings.map((m) => {
          const selectedClass = classList.find(
            (c) => String(c.class_id) === String(m?.class_id ?? "")
          );

          return {
            class_id: m?.class_id != null ? String(m.class_id) : "",
            subject_name: m?.subject_name ?? "",
            academic_year:
              m?.academic_year ??
              selectedClass?.academic_year ??
              "",
            is_class_teacher: Boolean(m?.is_class_teacher),
          };
        })
      : [
          {
            class_id: "",
            subject_name: "",
            academic_year: "",
            is_class_teacher: false,
          },
        ]
  );

  const [saving, setSaving] = useState(false);

  const classOptions = useMemo(
    () => [
      ["", "Select Class / Section"],
      ...classList.map((item) => [
        String(item.class_id),
        item.label ||
          [item.class_name, item.section_name]
            .filter(Boolean)
            .join(" - "),
      ]),
    ],
    [classList]
  );

  const roleOptions = [
    ["Faculty", "Faculty"],
    ["Headmaster", "Headmaster"],
  ];

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));
  }

  function updateMapping(index, field, value) {
    setMappings((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "class_id") {
          const selected = classList.find(
            (c) => String(c.class_id) === String(value ?? "")
          );

          return {
            ...item,
            class_id: value ?? "",
            academic_year: selected?.academic_year ?? "",
          };
        }

        return {
          ...item,
          [field]:
            field === "subject_name"
              ? value ?? ""
              : value,
        };
      })
    );
  }

  function addMapping() {
    setMappings((prev) => [
      ...prev,
      {
        class_id: "",
        subject_name: "",
        academic_year: "",
        is_class_teacher: false,
      },
    ]);
  }

  function removeMapping(index) {
    if (mappings.length === 1) return;
    setMappings((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const fullName = String(form.full_name ?? "").trim();
    const phone = String(form.phone ?? "").trim();
    const email = String(form.email_id ?? "").trim();

    if (!fullName) {
      return "Teacher name is required.";
    }

    if (!/^\d{10}$/.test(phone)) {
      return "Phone must contain exactly 10 digits.";
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      return "Teacher email must be a valid Gmail address.";
    }

    if (!String(form.role ?? "").trim()) {
      return "Role is required.";
    }

    if (!mappings.length) {
      return "At least one teaching assignment is required.";
    }

    const seen = new Set();

    for (let i = 0; i < mappings.length; i += 1) {
      const mapping = mappings[i];

      const classId = String(mapping?.class_id ?? "").trim();
      const subjectName = String(mapping?.subject_name ?? "").trim();
      const academicYear = String(mapping?.academic_year ?? "").trim();

      if (!classId) {
        return `Assignment ${i + 1}: Class / Section is required.`;
      }

      if (!subjectName) {
        return `Assignment ${i + 1}: Subject is required.`;
      }

      const key = `${classId}|${subjectName.toLowerCase()}|${academicYear}`;

      if (seen.has(key)) {
        return `Assignment ${i + 1}: Duplicate class and subject.`;
      }

      seen.add(key);
    }

    return "";
  }

  async function save() {
    const validationError = validate();

    if (validationError) {
      setToast({
        type: "error",
        message: validationError,
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        full_name: String(form.full_name ?? "").trim(),
        phone: String(form.phone ?? "").trim(),
        email_id: String(form.email_id ?? "").trim().toLowerCase(),
        role: String(form.role ?? "").trim(),
        // Qualification is OPTIONAL.
        qualification: String(form.qualification ?? "").trim() || null,

        teaching_mappings: mappings.map((m) => ({
          class_id: Number(m.class_id),
          subject_name: String(m.subject_name ?? "").trim(),
          // Backend derives this from sss_class_master.
          academic_year: String(m.academic_year ?? "").trim() || "",
          is_class_teacher: Boolean(m.is_class_teacher),
        })),
      };

      const result = await apiFetch(
        editing
          ? `/api/admin/teachers/${encodeURIComponent(teacher.teacher_id)}`
          : "/api/admin/teachers",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      await onSaved(
        editing
          ? `${String(form.full_name ?? "").trim()} updated successfully.`
          : `${String(form.full_name ?? "").trim()} added successfully.`
      );

      return result;
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Failed to save teacher.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={title} onClose={onClose} wide>
      <div className="space-y-5">
        <FormSection title="Teacher Information">
          <div className="form-grid">
            <Field
              label="Name *"
              value={form.full_name ?? ""}
              onChange={(v) => update("full_name", v)}
            />

            <Field
              label="Phone *"
              value={form.phone ?? ""}
              onChange={(v) =>
                update(
                  "phone",
                  String(v ?? "").replace(/\D/g, "").slice(0, 10)
                )
              }
            />

            <Field
              label="Email *"
              value={form.email_id ?? ""}
              onChange={(v) => update("email_id", v)}
            />

            <SelectField
              label="Role *"
              value={form.role ?? ""}
              onChange={(v) => update("role", v)}
              options={roleOptions}
            />

            <Field
              label="Qualification"
              value={form.qualification ?? ""}
              onChange={(v) => update("qualification", v)}
            />
          </div>
        </FormSection>

        <FormSection title="Teaching Assignments">
          <div className="space-y-3">
            {mappings.map((mapping, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-3"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
                  <div>
                    <SelectField
                      label={`Class / Section ${index + 1} *`}
                      value={mapping.class_id ?? ""}
                      onChange={(v) =>
                        updateMapping(index, "class_id", v)
                      }
                      options={classOptions}
                    />
                  </div>

                  <Field
                    label="Subject *"
                    value={mapping.subject_name ?? ""}
                    onChange={(v) =>
                      updateMapping(index, "subject_name", v)
                    }
                  />

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                      Academic Year
                    </label>

                    <input
                      value={mapping.academic_year ?? ""}
                      readOnly
                      placeholder="Auto"
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0e142c] px-3.5 text-sm text-white/60 outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    {mappings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMapping(index)}
                        className="h-11 rounded-xl border border-red-400/20 px-3 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <label className="mt-3 flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={Boolean(mapping.is_class_teacher)}
                    onChange={(e) =>
                      updateMapping(
                        index,
                        "is_class_teacher",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-white/20 bg-[#0e142c]"
                  />
                  Class Teacher
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addMapping}
              className="rounded-xl border border-cyan-400/20 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10"
            >
              + Add Another Assignment
            </button>
          </div>
        </FormSection>

        <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] px-6 py-2.5 text-sm font-bold shadow-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Teacher"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default TeacherFormModal;
