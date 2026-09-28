"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserRound,
  Bell,
  CalendarDays,
  Search,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import AdminShell from "../../components/layout/AdminShell";
import { apiFetch } from "../../lib/api";

const emptyForm = {
  name: "",
  admission_no: "",
  roll_number: "",
  gender: "",
  class_id: "",
  class_name: "",
  section: "",
  student_phone: "",
  student_email: "",

  parent1_name: "",
  parent1_phone: "",
  parent1_email: "",

  parent2_name: "",
  parent2_phone: "",
  parent2_email: "",

  guardian_name: "",
  guardian_phone: "",
  guardian_email: "",
};

const translations = {
  English: {
    students: "Students",
    management: "Student Management",
    subtitle: "View and manage students across SSS School.",
    total: "Total Students",
    active: "Active Students",
    inactive: "Inactive Students",
    search: "Search Students",
    studentList: "Student List",
    addStudent: "Add Student",
    actions: "Actions",
  },
  Telugu: {
    students: "విద్యార్థులు",
    management: "విద్యార్థుల నిర్వహణ",
    subtitle: "SSS School విద్యార్థుల వివరాలను నిర్వహించండి.",
    total: "మొత్తం విద్యార్థులు",
    active: "యాక్టివ్ విద్యార్థులు",
    inactive: "ఇనాక్టివ్ విద్యార్థులు",
    search: "విద్యార్థులను వెతకండి",
    studentList: "విద్యార్థుల జాబితా",
    addStudent: "విద్యార్థిని జోడించండి",
    actions: "చర్యలు",
  },
  Hindi: {
    students: "छात्र",
    management: "छात्र प्रबंधन",
    subtitle: "SSS School के छात्रों को देखें और प्रबंधित करें।",
    total: "कुल छात्र",
    active: "सक्रिय छात्र",
    inactive: "निष्क्रिय छात्र",
    search: "छात्र खोजें",
    studentList: "छात्र सूची",
    addStudent: "छात्र जोड़ें",
    actions: "कार्य",
  },
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("students");
  const [language, setLanguage] = useState("English");

  const t = translations[language];

  return (
    <AdminShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      language={language}
      onLanguageChange={setLanguage}
    >
      {activeTab === "students" && (
        <Students language={language} t={t} />
      )}

      {activeTab === "teachers" && (
        <ComingSoon title="Teachers" icon={UserRound} />
      )}

      {activeTab === "others" && <Others />}
    </AdminShell>
  );
}

/* =========================================================
   STUDENTS
========================================================= */

function Students({ t }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState({
    items: [],
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 250);

    return () => clearTimeout(timer);
  }, [classId, search]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  async function loadClasses() {
    try {
      const data = await apiFetch("/api/admin/classes");

      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadStudents() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (classId) {
        params.set("class_id", classId);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const query = params.toString();

      const data = await apiFetch(
        `/api/admin/students${query ? `?${query}` : ""}`
      );

      setStudents(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const visibleStudents = useMemo(() => {
    if (statusFilter === "active") {
      return students.items.filter((student) => student.is_active);
    }

    if (statusFilter === "inactive") {
      return students.items.filter((student) => !student.is_active);
    }

    return students.items;
  }, [students.items, statusFilter]);

  async function handleStatus(student) {
    try {
      await apiFetch(
        `/api/admin/students/${student.student_id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_active: !student.is_active,
          }),
        }
      );

      setToast({
        type: "success",
        message: `${student.name} is now ${
          !student.is_active ? "Active" : "Inactive"
        }.`,
      });

      await loadStudents();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message,
      });
    }
  }

  async function handleDeleteConfirmed(student) {
    try {
      await apiFetch(
        `/api/admin/students/${student.student_id}`,
        {
          method: "DELETE",
        }
      );

      setDeleteStudent(null);

      setToast({
        type: "success",
        message: `${student.name} deleted successfully.`,
      });

      await loadStudents();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message,
      });
    }
  }

  async function openView(student) {
    try {
      const data = await apiFetch(
        `/api/admin/students/${student.student_id}`
      );

      setViewStudent(data);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message,
      });
    }
  }

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          {t.students}
        </p>

        <h2 className="mt-1 text-2xl font-black sm:text-3xl">
          {t.management}
        </h2>

        <p className="mt-1 text-sm text-white/40">
          {t.subtitle}
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className="text-left"
        >
          <Kpi
            title={t.total}
            value={students.total}
            icon={Users}
            type="total"
            selected={statusFilter === "all"}
          />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          className="text-left"
        >
          <Kpi
            title={t.active}
            value={students.active}
            icon={CheckCircle2}
            type="active"
            selected={statusFilter === "active"}
          />
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("inactive")}
          className="text-left"
        >
          <Kpi
            title={t.inactive}
            value={students.inactive}
            icon={AlertCircle}
            type="inactive"
            selected={statusFilter === "inactive"}
          />
        </button>
      </div>

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#171d39] p-4 shadow-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              {t.search}
            </label>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, ID, phone, email, admission..."
                className="h-11 w-full rounded-xl border border-white/10 bg-[#0e142c] pl-10 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-cyan-400/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              Class & Section
            </label>

            <div className="relative">
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#0e142c] px-3.5 pr-9 text-sm outline-none focus:border-cyan-400/50"
              >
                <option value="">All Classes</option>

                {classes.map((item) => (
                  <option key={item.class_id} value={item.class_id}>
                    {item.label ||
                      `${item.class_name || ""}${
                        item.section_name
                          ? ` - ${item.section_name}`
                          : ""
                      }`}
                    {item.academic_year
                      ? ` — ${item.academic_year}`
                      : ""}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#171d39] shadow-xl">
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold">{t.studentList}</h3>

            <p className="mt-0.5 text-[11px] text-white/35">
              {visibleStudents.length} student
              {visibleStudents.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] px-4 py-2.5 text-sm font-bold shadow-lg shadow-cyan-950/30 transition hover:brightness-110"
          >
            <Users size={16} />
            {t.addStudent}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-white/[0.025] text-left text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-12 text-center text-sm text-white/40"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : visibleStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-12 text-center text-sm text-white/40"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                visibleStudents.map((student) => (
                  <tr
                    key={student.student_id}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-4 py-3">
                      <StudentPhoto
                        src={student.student_photo_url}
                        name={student.name}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        {student.ui_id ||
                          `S${String(student.student_id).padStart(
                            4,
                            "0"
                          )}`}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold">
                        {student.name}
                      </div>

                      <div className="mt-0.5 text-[10px] text-white/35">
                        {student.admission_no || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-white/65">
                      {student.class_name || "-"}
                    </td>

                    <td className="px-4 py-3 text-sm text-white/65">
                      {student.section || "-"}
                    </td>

                    <td className="px-4 py-3 text-xs text-white/65">
                      {student.student_phone || "-"}
                    </td>

                    <td className="max-w-[190px] truncate px-4 py-3 text-xs text-white/65">
                      {student.student_email || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleStatus(student)}
                        className={`status-badge ${
                          student.is_active
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {student.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ActionButton
                          title="View"
                          onClick={() => openView(student)}
                        >
                          <Eye size={15} />
                        </ActionButton>

                        <ActionButton
                          title="Modify"
                          onClick={() => setEditStudent(student)}
                        >
                          <Pencil size={15} />
                        </ActionButton>

                        <ActionButton
                          title="Delete"
                          danger
                          onClick={() => setDeleteStudent(student)}
                        >
                          <Trash2 size={15} />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showAdd && (
        <StudentFormModal
          title="Add Student"
          classes={classes}
          onClose={() => setShowAdd(false)}
          onSaved={async (message) => {
            setShowAdd(false);
            setToast({
              type: "success",
              message,
            });
            await loadStudents();
          }}
          setToast={setToast}
        />
      )}

      {editStudent && (
        <StudentFormModal
          title="Modify Student"
          student={editStudent}
          classes={classes}
          onClose={() => setEditStudent(null)}
          onSaved={async (message) => {
            setEditStudent(null);
            setToast({
              type: "success",
              message,
            });
            await loadStudents();
          }}
          setToast={setToast}
        />
      )}

      {viewStudent && (
        <StudentView
          student={viewStudent}
          onClose={() => setViewStudent(null)}
        />
      )}

      {deleteStudent && (
        <ConfirmDelete
          student={deleteStudent}
          onCancel={() => setDeleteStudent(null)}
          onConfirm={() => handleDeleteConfirmed(deleteStudent)}
        />
      )}

      {toast && <Toast toast={toast} />}
    </>
  );
}

/* =========================================================
   STUDENT FORM
========================================================= */

function StudentFormModal({
  title,
  student,
  classes,
  onClose,
  onSaved,
  setToast,
}) {
  const editing = Boolean(student);

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(student || {}),
    class_id: student?.class_id ? String(student.class_id) : "",
    gender: student?.gender || "",
  }));

  const [photos, setPhotos] = useState({
    student: null,
    parent1: null,
    parent2: null,
    guardian: null,
  });

  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validate() {
    const required = [
      ["name", "Student name"],
      ["admission_no", "Admission number"],
      ["roll_number", "Roll number"],
      ["gender", "Gender"],
      ["class_id", "Class"],
      ["section", "Section"],
      ["student_phone", "Student phone"],
      ["student_email", "Student email"],
      ["parent1_name", "Father / Parent 1 name"],
      ["parent1_phone", "Father / Parent 1 phone"],
      ["parent1_email", "Father / Parent 1 email"],
      ["parent2_name", "Mother / Parent 2 name"],
      ["parent2_phone", "Mother / Parent 2 phone"],
      ["parent2_email", "Mother / Parent 2 email"],
    ];

    for (const [field, label] of required) {
      if (!String(form[field] || "").trim()) {
        return `${label} is required.`;
      }
    }

    const phones = [
      ["Student phone", form.student_phone],
      ["Father phone", form.parent1_phone],
      ["Mother phone", form.parent2_phone],
    ];

    for (const [label, value] of phones) {
      if (!/^\d{10}$/.test(String(value).trim())) {
        return `${label} must contain exactly 10 digits.`;
      }
    }

    const emails = [
      ["Student email", form.student_email],
      ["Father email", form.parent1_email],
      ["Mother email", form.parent2_email],
    ];

    for (const [label, value] of emails) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) {
        return `${label} is not a valid email address.`;
      }
    }

    if (form.guardian_phone && !/^\d{10}$/.test(form.guardian_phone)) {
      return "Guardian phone must contain exactly 10 digits.";
    }

    if (
      form.guardian_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guardian_email)
    ) {
      return "Guardian email is not valid.";
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

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        admission_no: form.admission_no.trim(),
        roll_number: form.roll_number.trim(),
        gender: form.gender,
        class_id: Number(form.class_id),
        section: form.section,
        student_phone: form.student_phone.trim(),
        student_email: form.student_email.trim(),

        parent1_name: form.parent1_name.trim(),
        parent1_phone: form.parent1_phone.trim(),
        parent1_email: form.parent1_email.trim(),

        parent2_name: form.parent2_name.trim(),
        parent2_phone: form.parent2_phone.trim(),
        parent2_email: form.parent2_email.trim(),

        guardian_name: form.guardian_name.trim(),
        guardian_phone: form.guardian_phone.trim(),
        guardian_email: form.guardian_email.trim(),
      };

      let result;

      if (editing) {
        result = await apiFetch(
          `/api/admin/students/${student.student_id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        result = await apiFetch("/api/admin/students", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const studentId =
        result?.student_id || student?.student_id;

      if (studentId) {
        await uploadPhotos(studentId);
      }

      await onSaved(
        editing
          ? `${form.name} updated successfully.`
          : `${form.name} added successfully.`
      );
    } catch (err) {
      setToast({
        type: "error",
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhotos(studentId) {
    const selectedPhotos = Object.entries(photos).filter(
      ([, file]) => file
    );

    for (const [photoType, file] of selectedPhotos) {
      const body = new FormData();

      body.append("file", file);
      body.append("photo_type", photoType);

      try {
        await apiFetch(
          `/api/admin/students/${studentId}/photos`,
          {
            method: "POST",
            body,
          }
        );
      } catch (err) {
        setToast({
          type: "error",
          message: `${photoType} photo upload failed: ${err.message}`,
        });
      }
    }
  }

  const sections = classes.filter(
    (item) =>
      String(item.class_id) === String(form.class_id)
  );

  return (
    <ModalShell title={title} onClose={onClose} wide>
      <div className="space-y-5">
        <FormSection title="Student Information">
          <div className="form-grid">
            <Field
              label="Student Name *"
              value={form.name}
              onChange={(v) => update("name", v)}
            />

            <Field
              label="Admission Number *"
              value={form.admission_no}
              onChange={(v) => update("admission_no", v)}
            />

            <Field
              label="Roll Number *"
              value={form.roll_number}
              onChange={(v) => update("roll_number", v)}
            />

            <SelectField
              label="Gender *"
              value={form.gender}
              onChange={(v) => update("gender", v)}
              options={[
                ["", "Select Gender"],
                ["male", "Male"],
                ["female", "Female"],
              ]}
            />

            <SelectField
              label="Class *"
              value={form.class_id}
              onChange={(v) => {
                update("class_id", v);
                update("section", "");
              }}
              options={[
                ["", "Select Class"],
                ...classes.map((item) => [
                  String(item.class_id),
                  item.label ||
                    `${item.class_name || ""}${
                      item.section_name
                        ? ` - ${item.section_name}`
                        : ""
                    }`,
                ]),
              ]}
            />

            <SelectField
              label="Section *"
              value={form.section}
              onChange={(v) => update("section", v)}
              options={[
                ["", "Select Section"],
                ...sections.map((item) => [
                  item.section_name || item.section,
                  item.section_name || item.section,
                ]),
              ]}
            />

            <Field
              label="Phone *"
              value={form.student_phone}
              onChange={(v) =>
                update(
                  "student_phone",
                  v.replace(/\D/g, "").slice(0, 10)
                )
              }
            />

            <Field
              label="Email *"
              type="email"
              value={form.student_email}
              onChange={(v) => update("student_email", v)}
            />
          </div>
        </FormSection>

        <FormSection title="Father / Parent 1 — Mandatory">
          <div className="form-grid">
            <Field
              label="Name *"
              value={form.parent1_name}
              onChange={(v) => update("parent1_name", v)}
            />

            <Field
              label="Phone *"
              value={form.parent1_phone}
              onChange={(v) =>
                update(
                  "parent1_phone",
                  v.replace(/\D/g, "").slice(0, 10)
                )
              }
            />

            <Field
              label="Email *"
              value={form.parent1_email}
              onChange={(v) => update("parent1_email", v)}
            />
          </div>
        </FormSection>

        <FormSection title="Mother / Parent 2 — Mandatory">
          <div className="form-grid">
            <Field
              label="Name *"
              value={form.parent2_name}
              onChange={(v) => update("parent2_name", v)}
            />

            <Field
              label="Phone *"
              value={form.parent2_phone}
              onChange={(v) =>
                update(
                  "parent2_phone",
                  v.replace(/\D/g, "").slice(0, 10)
                )
              }
            />

            <Field
              label="Email *"
              value={form.parent2_email}
              onChange={(v) => update("parent2_email", v)}
            />
          </div>
        </FormSection>

        <FormSection title="Guardian — Optional">
          <div className="form-grid">
            <Field
              label="Name"
              value={form.guardian_name}
              onChange={(v) => update("guardian_name", v)}
            />

            <Field
              label="Phone"
              value={form.guardian_phone}
              onChange={(v) =>
                update(
                  "guardian_phone",
                  v.replace(/\D/g, "").slice(0, 10)
                )
              }
            />

            <Field
              label="Email"
              value={form.guardian_email}
              onChange={(v) => update("guardian_email", v)}
            />
          </div>
        </FormSection>

        <FormSection title="Photos">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PhotoUpload
              label="Student Photo"
              value={photos.student}
              existingUrl={student?.student_photo_url}
              onChange={(file) =>
                setPhotos((p) => ({ ...p, student: file }))
              }
            />

            <PhotoUpload
              label="Father Photo"
              value={photos.parent1}
              existingUrl={student?.parent1_photo_url}
              onChange={(file) =>
                setPhotos((p) => ({ ...p, parent1: file }))
              }
            />

            <PhotoUpload
              label="Mother Photo"
              value={photos.parent2}
              existingUrl={student?.parent2_photo_url}
              onChange={(file) =>
                setPhotos((p) => ({ ...p, parent2: file }))
              }
            />

            <PhotoUpload
              label="Guardian Photo"
              value={photos.guardian}
              existingUrl={student?.guardian_photo_url}
              onChange={(file) =>
                setPhotos((p) => ({ ...p, guardian: file }))
              }
            />
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

/* =========================================================
   VIEW
========================================================= */

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

/* =========================================================
   DELETE
========================================================= */

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

function Kpi({ title, value, icon: Icon, type, selected }) {
  const styles = {
    total: {
      card: "from-[#103c62] to-[#17244a] border-cyan-400/30",
      icon: "bg-cyan-400/15 text-cyan-300",
      value: "text-cyan-100",
    },
    active: {
      card: "from-[#0d4935] to-[#172d38] border-emerald-400/30",
      icon: "bg-emerald-400/15 text-emerald-300",
      value: "text-emerald-100",
    },
    inactive: {
      card: "from-[#5a3013] to-[#292036] border-orange-400/30",
      icon: "bg-orange-400/15 text-orange-300",
      value: "text-orange-100",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-4 shadow-xl transition ${
        style.card
      } ${
        selected
          ? "ring-1 ring-white/25"
          : "hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/50">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-black ${style.value}`}
          >
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${style.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function StudentPhoto({ src, name }) {
  return (
    <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-[#0e142c]">
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-black text-cyan-300/70">
          {name?.charAt(0)?.toUpperCase() || "S"}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg border p-2 transition ${
        danger
          ? "border-red-400/15 text-red-300 hover:bg-red-400/10"
          : "border-white/10 text-white/55 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

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

function FormSection({ title, children }) {
  return (
    <section>
      <div className="mb-2.5">
        <h4 className="text-sm font-bold">{title}</h4>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/40">
        {label}
      </span>

      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-white/10 bg-[#0e142c] px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-400/50"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/40">
        {label}
      </span>

      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-[#0e142c] px-3 pr-9 text-sm text-white outline-none focus:border-cyan-400/50"
        >
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
        />
      </div>
    </label>
  );
}

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

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div
        className={`max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#171d39] shadow-2xl sm:rounded-3xl ${
          wide ? "sm:max-w-5xl" : "sm:max-w-2xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#171d39]/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              SSS Admin
            </p>

            <h3 className="mt-0.5 text-lg font-bold">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-0.5 text-xs text-white/40">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

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

function ComingSoon({ title, icon: Icon }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#171d39] p-8 shadow-xl">
      <Icon className="text-cyan-300" size={30} />
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm text-white/45">
        {title} management will be built after Students.
      </p>
    </section>
  );
}

function Others() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ComingSoon title="Notices" icon={Bell} />
      <ComingSoon title="Events" icon={CalendarDays} />
    </div>
  );
}