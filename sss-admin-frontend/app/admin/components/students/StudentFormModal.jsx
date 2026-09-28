"use client";

import { useEffect, useState } from "react";

import ModalShell from "../shared/ModalShell";
import FormSection from "../shared/FormSection";
import Field from "../shared/Field";
import SelectField from "../shared/SelectField";
import PhotoUpload from "../shared/PhotoUpload";

import { emptyForm } from "./studentConstants";
import { apiFetch } from "../../../../lib/api";

function StudentFormModal({
  title,
  student,
  classes,
  onClose,
  onSaved,
  setToast,
}) {
  const editing = Boolean(student);

  const [studentData, setStudentData] = useState(student || null);

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(student || {}),
    class_id: student?.class_id
      ? String(student.class_id)
      : "",
    gender: student?.gender || "",
  }));

  const [photos, setPhotos] = useState({
    student: null,
    parent1: null,
    parent2: null,
    guardian: null,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(editing);

  useEffect(() => {
    let cancelled = false;

    async function loadStudentDetails() {
      if (!editing || !student?.student_id) {
        setLoadingStudent(false);
        return;
      }

      try {
        setLoadingStudent(true);

        const data = await apiFetch(
          `/api/admin/students/${student.student_id}`
        );

        if (cancelled) {
          return;
        }

        setStudentData(data);

        setForm({
          ...emptyForm,
          ...data,
          class_id: data?.class_id
            ? String(data.class_id)
            : "",
          gender: data?.gender || "",
        });
      } catch (err) {
        if (!cancelled) {
          setToast({
            type: "error",
            message:
              err.message ||
              "Failed to load student details.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingStudent(false);
        }
      }
    }

    loadStudentDetails();

    return () => {
      cancelled = true;
    };
  }, [editing, student?.student_id, setToast]);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      if (!prev[field] && !prev.parentGeneral) {
        return prev;
      }

      const next = {
        ...prev,
      };

      delete next[field];
      delete next.parentGeneral;

      return next;
    });
  }

  function hasValue(value) {
    return String(value || "").trim().length > 0;
  }

  function normalize(value) {
    return String(value || "").trim();
  }

  function validate() {
    const nextErrors = {};

    const requiredFields = {
      name: "Student name",
      admission_no: "Admission number",
      roll_number: "Roll number",
      gender: "Gender",
      class_id: "Class",
      section: "Section",
      student_phone: "Student phone",
      student_email: "Student email",
    };

    for (const [field, label] of Object.entries(
      requiredFields
    )) {
      if (!hasValue(form[field])) {
        nextErrors[field] = `${label} is required.`;
      }
    }

    if (
      hasValue(form.student_phone) &&
      !/^\d{10}$/.test(
        normalize(form.student_phone)
      )
    ) {
      nextErrors.student_phone =
        "Student phone must contain exactly 10 digits.";
    }

    if (
      hasValue(form.student_email) &&
      !/^[^\s@]+@gmail\.com$/i.test(
        normalize(form.student_email)
      )
    ) {
      nextErrors.student_email =
        "Student email must be a valid Gmail address.";
    }

    const parentSections = [
      {
        prefix: "parent1",
        label: "Father / Parent 1",
      },
      {
        prefix: "parent2",
        label: "Mother / Parent 2",
      },
      {
        prefix: "guardian",
        label: "Guardian",
      },
    ];

    let parentCount = 0;

    for (const parent of parentSections) {
      const name = normalize(
        form[`${parent.prefix}_name`]
      );

      const phone = normalize(
        form[`${parent.prefix}_phone`]
      );

      const email = normalize(
        form[`${parent.prefix}_email`]
      );

      const hasAnyParentData =
        Boolean(name) ||
        Boolean(phone) ||
        Boolean(email);

      if (!hasAnyParentData) {
        continue;
      }

      parentCount += 1;

      if (!name) {
        nextErrors[`${parent.prefix}_name`] =
          `${parent.label} name is required.`;
      }

      if (!phone) {
        nextErrors[`${parent.prefix}_phone`] =
          `${parent.label} phone is required.`;
      } else if (!/^\d{10}$/.test(phone)) {
        nextErrors[`${parent.prefix}_phone`] =
          `${parent.label} phone must contain exactly 10 digits.`;
      }

      if (!email) {
        nextErrors[`${parent.prefix}_email`] =
          `${parent.label} email is required.`;
      } else if (
        !/^[^\s@]+@gmail\.com$/i.test(email)
      ) {
        nextErrors[`${parent.prefix}_email`] =
          `${parent.label} email must be a valid Gmail address.`;
      }
    }

    if (parentCount === 0) {
      nextErrors.parentGeneral =
        "Enter at least one parent or guardian.";
      nextErrors.parent1_name =
        "Enter at least one parent or guardian.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function save() {
    if (loadingStudent || saving) {
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: normalize(form.name),
        admission_no: normalize(
          form.admission_no
        ),
        roll_number: normalize(
          form.roll_number
        ),
        gender: normalize(form.gender),

        class_id: Number(form.class_id),

        section: normalize(form.section),

        student_phone: normalize(
          form.student_phone
        ),

        student_email: normalize(
          form.student_email
        ).toLowerCase(),

        parent1_name: normalize(
          form.parent1_name
        ),

        parent1_phone: normalize(
          form.parent1_phone
        ),

        parent1_email: normalize(
          form.parent1_email
        ).toLowerCase(),

        parent2_name: normalize(
          form.parent2_name
        ),

        parent2_phone: normalize(
          form.parent2_phone
        ),

        parent2_email: normalize(
          form.parent2_email
        ).toLowerCase(),

        guardian_name: normalize(
          form.guardian_name
        ),

        guardian_phone: normalize(
          form.guardian_phone
        ),

        guardian_email: normalize(
          form.guardian_email
        ).toLowerCase(),
      };

      let result;

      if (editing) {
        result = await apiFetch(
          `/api/admin/students/${studentData.student_id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        result = await apiFetch(
          "/api/admin/students",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      const studentId =
        result?.student_id ||
        studentData?.student_id;

      if (!studentId) {
        throw new Error(
          "Student was saved but no student ID was returned."
        );
      }

      await uploadPhotos(studentId);

      await onSaved(
        editing
          ? `${payload.name} updated successfully.`
          : `${payload.name} added successfully.`
      );
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.message ||
          "Failed to save student.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhotos(studentId) {
    const selectedPhotos = Object.entries(
      photos
    ).filter(([, file]) => file);

    for (const [photoType, file] of selectedPhotos) {
      const body = new FormData();

      body.append("file", file);
      body.append("photo_type", photoType);

      await apiFetch(
        `/api/admin/students/${studentId}/photos`,
        {
          method: "POST",
          body,
        }
      );
    }
  }

  const sections = classes.filter(
    (item) =>
      String(item.class_id) ===
      String(form.class_id)
  );

  if (loadingStudent) {
    return (
      <ModalShell
        title={title}
        onClose={onClose}
        wide
      >
        <div className="flex min-h-[260px] items-center justify-center text-sm text-white/45">
          Loading student details...
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title={title}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">

        {/* =========================
            STUDENT INFORMATION
        ========================== */}

        <FormSection title="Student Information">
          <div className="form-grid">

            <Field
              label="Student Name *"
              value={form.name}
              error={errors.name}
              onChange={(v) =>
                update("name", v)
              }
            />

            <Field
              label="Admission Number *"
              value={form.admission_no}
              error={errors.admission_no}
              onChange={(v) =>
                update(
                  "admission_no",
                  v
                )
              }
            />

            <Field
              label="Roll Number *"
              value={form.roll_number}
              error={errors.roll_number}
              onChange={(v) =>
                update(
                  "roll_number",
                  v
                )
              }
            />

            <SelectField
              label="Gender *"
              value={form.gender}
              error={errors.gender}
              onChange={(v) =>
                update("gender", v)
              }
              options={[
                ["", "Select Gender"],
                ["male", "Male"],
                ["female", "Female"],
              ]}
            />

            <SelectField
              label="Class *"
              value={form.class_id}
              error={errors.class_id}
              onChange={(v) => {
                update(
                  "class_id",
                  v
                );

                update(
                  "section",
                  ""
                );
              }}
              options={[
                ["", "Select Class"],
                ...classes.map(
                  (item) => [
                    String(
                      item.class_id
                    ),
                    item.label ||
                      `${item.class_name || ""}${
                        item.section_name
                          ? ` - ${item.section_name}`
                          : ""
                      }`,
                  ]
                ),
              ]}
            />

            <SelectField
              label="Section *"
              value={form.section}
              error={errors.section}
              onChange={(v) =>
                update(
                  "section",
                  v
                )
              }
              options={[
                ["", "Select Section"],
                ...sections.map(
                  (item) => [
                    item.section_name ||
                      item.section,
                    item.section_name ||
                      item.section,
                  ]
                ),
              ]}
            />

            <Field
              label="Phone *"
              value={form.student_phone}
              error={
                errors.student_phone
              }
              onChange={(v) =>
                update(
                  "student_phone",
                  v
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
            />

            <Field
              label="Email *"
              type="email"
              value={form.student_email}
              error={
                errors.student_email
              }
              onChange={(v) =>
                update(
                  "student_email",
                  v
                )
              }
            />

          </div>
        </FormSection>

        {/* =========================
            FATHER
        ========================== */}

        <FormSection title="Father / Parent 1">
          <div className="form-grid">

            <Field
              label="Name"
              value={
                form.parent1_name
              }
              error={
                errors.parent1_name
              }
              onChange={(v) =>
                update(
                  "parent1_name",
                  v
                )
              }
            />

            <Field
              label="Phone"
              value={
                form.parent1_phone
              }
              error={
                errors.parent1_phone
              }
              onChange={(v) =>
                update(
                  "parent1_phone",
                  v
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
            />

            <Field
              label="Email"
              type="email"
              value={
                form.parent1_email
              }
              error={
                errors.parent1_email
              }
              onChange={(v) =>
                update(
                  "parent1_email",
                  v
                )
              }
            />

          </div>
        </FormSection>

        {/* =========================
            MOTHER
        ========================== */}

        <FormSection title="Mother / Parent 2">
          <div className="form-grid">

            <Field
              label="Name"
              value={
                form.parent2_name
              }
              error={
                errors.parent2_name
              }
              onChange={(v) =>
                update(
                  "parent2_name",
                  v
                )
              }
            />

            <Field
              label="Phone"
              value={
                form.parent2_phone
              }
              error={
                errors.parent2_phone
              }
              onChange={(v) =>
                update(
                  "parent2_phone",
                  v
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
            />

            <Field
              label="Email"
              type="email"
              value={
                form.parent2_email
              }
              error={
                errors.parent2_email
              }
              onChange={(v) =>
                update(
                  "parent2_email",
                  v
                )
              }
            />

          </div>
        </FormSection>

        {/* =========================
            GUARDIAN
        ========================== */}

        <FormSection title="Guardian">
          <div className="form-grid">

            <Field
              label="Name"
              value={
                form.guardian_name
              }
              error={
                errors.guardian_name
              }
              onChange={(v) =>
                update(
                  "guardian_name",
                  v
                )
              }
            />

            <Field
              label="Phone"
              value={
                form.guardian_phone
              }
              error={
                errors.guardian_phone
              }
              onChange={(v) =>
                update(
                  "guardian_phone",
                  v
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
            />

            <Field
              label="Email"
              type="email"
              value={
                form.guardian_email
              }
              error={
                errors.guardian_email
              }
              onChange={(v) =>
                update(
                  "guardian_email",
                  v
                )
              }
            />

          </div>

          {errors.parentGeneral && (
            <p className="mt-2 text-xs text-red-300">
              {errors.parentGeneral}
            </p>
          )}
        </FormSection>

        {/* =========================
            PHOTOS
        ========================== */}

        <FormSection title="Photos">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <PhotoUpload
              label="Student Photo"
              value={photos.student}
              existingUrl={
                studentData?.student_photo_url
              }
              onChange={(file) =>
                setPhotos((prev) => ({
                  ...prev,
                  student: file,
                }))
              }
            />

            <PhotoUpload
              label="Father Photo"
              value={photos.parent1}
              existingUrl={
                studentData?.parent1_photo_url
              }
              onChange={(file) =>
                setPhotos((prev) => ({
                  ...prev,
                  parent1: file,
                }))
              }
            />

            <PhotoUpload
              label="Mother Photo"
              value={photos.parent2}
              existingUrl={
                studentData?.parent2_photo_url
              }
              onChange={(file) =>
                setPhotos((prev) => ({
                  ...prev,
                  parent2: file,
                }))
              }
            />

            <PhotoUpload
              label="Guardian Photo"
              value={photos.guardian}
              existingUrl={
                studentData?.guardian_photo_url
              }
              onChange={(file) =>
                setPhotos((prev) => ({
                  ...prev,
                  guardian: file,
                }))
              }
            />

          </div>
        </FormSection>

        {/* =========================
            ACTIONS
        ========================== */}

        <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              saving ||
              loadingStudent
            }
            onClick={save}
            className="rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] px-6 py-2.5 text-sm font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editing
              ? "Save Changes"
              : "Add Student"}
          </button>

        </div>

      </div>
    </ModalShell>
  );
}

export default StudentFormModal;