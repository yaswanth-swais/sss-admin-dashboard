"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, Pencil, Trash2, CheckCircle2, AlertCircle, UserRound, ChevronDown, Plus } from "lucide-react";
import Kpi from "../shared/Kpi";
import ActionButton from "../shared/ActionButton";
import Toast from "../shared/Toast";
import TeacherFormModal from "./TeacherFormModal";
import TeacherView from "./TeacherView";
import ConfirmDelete from "./ConfirmDelete";
import { apiFetch } from "../../../../lib/api";

function Teachers() {
  const [teachers, setTeachers] = useState({ items: [], total: 0, active: 0, inactive: 0 });
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewTeacher, setViewTeacher] = useState(null);
  const [editTeacher, setEditTeacher] = useState(null);
  const [deleteTeacher, setDeleteTeacher] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadClasses(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadTeachers(), 250);
    return () => clearTimeout(timer);
  }, [classId, search]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadClasses() {
    try {
      const data = await apiFetch("/api/admin/classes");
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load classes.");
    }
  }

  async function loadTeachers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (classId) params.set("class_id", classId);

      const query = params.toString();
      const data = await apiFetch(`/api/admin/teachers${query ? `?${query}` : ""}`);

      setTeachers({
        items: Array.isArray(data?.items) ? data.items : [],
        total: Number(data?.total || 0),
        active: Number(data?.active || 0),
        inactive: Number(data?.inactive || 0),
      });

      setError("");
    } catch (err) {
      setError(err.message || "Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  }

  const visibleTeachers = useMemo(() => {
    if (statusFilter === "active") return teachers.items.filter((teacher) => teacher.is_active);
    if (statusFilter === "inactive") return teachers.items.filter((teacher) => !teacher.is_active);
    return teachers.items;
  }, [teachers.items, statusFilter]);

  function formatClass(className, sectionName) {
    return [className, sectionName].filter(Boolean).join("-") || "-";
  }

  async function openView(teacher) {
    try {
      const data = await apiFetch(`/api/admin/teachers/${encodeURIComponent(teacher.teacher_id)}`);
      setViewTeacher(data);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to load teacher details." });
    }
  }

  async function handleStatus(teacher) {
    try {
      const data = await apiFetch(`/api/admin/teachers/${encodeURIComponent(teacher.teacher_id)}/status`, { method: "PATCH" });
      setToast({ type: "success", message: `${teacher.full_name} is now ${data?.is_active ? "Active" : "Inactive"}.` });
      await loadTeachers();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to update teacher status." });
    }
  }

  async function handleDeleteConfirmed(teacher) {
    try {
      await apiFetch(`/api/admin/teachers/${encodeURIComponent(teacher.teacher_id)}`, { method: "DELETE" });
      setDeleteTeacher(null);
      setToast({ type: "success", message: `${teacher.full_name} deleted successfully.` });
      await loadTeachers();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to delete teacher." });
    }
  }

  function assignmentSummary(teacher) {
    const mappings = Array.isArray(teacher.teaching_mappings) ? teacher.teaching_mappings : [];
    if (!mappings.length) return "-";

    return (
      <div className="space-y-1">
        {mappings.slice(0, 2).map((mapping) => (
          <div key={mapping.assignment_id} className="text-xs text-white/70">
            <span className="font-semibold text-cyan-300">
              {formatClass(mapping.class_name, mapping.section_name)}
            </span>
            <span className="mx-1 text-white/25">•</span>
            <span>{mapping.subject_name || "-"}</span>
          </div>
        ))}
        {mappings.length > 2 && <div className="text-[10px] text-white/35">+{mappings.length - 2} more</div>}
      </div>
    );
  }

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Teachers</p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">Teacher Management</h2>
        <p className="mt-1 text-sm text-white/40">View and manage teachers and their teaching assignments.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => setStatusFilter("all")} className="text-left">
          <Kpi title="Total Teachers" value={teachers.total} icon={UserRound} type="total" selected={statusFilter === "all"} />
        </button>

        <button type="button" onClick={() => setStatusFilter("active")} className="text-left">
          <Kpi title="Active Teachers" value={teachers.active} icon={CheckCircle2} type="active" selected={statusFilter === "active"} />
        </button>

        <button type="button" onClick={() => setStatusFilter("inactive")} className="text-left">
          <Kpi title="Inactive Teachers" value={teachers.inactive} icon={AlertCircle} type="inactive" selected={statusFilter === "inactive"} />
        </button>
      </div>

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#171d39] p-4 shadow-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Search Teachers</label>
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, ID, phone, email, subject..."
                className="h-11 w-full rounded-xl border border-white/10 bg-[#0e142c] pl-10 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-cyan-400/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Class & Section</label>
            <div className="relative">
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#0e142c] px-3.5 pr-9 text-sm outline-none focus:border-cyan-400/50"
              >
                <option value="">All Classes</option>
                {classes.map((item) => (
                  <option key={item.class_id} value={item.class_id}>
                    {item.label || [item.class_name, item.section_name].filter(Boolean).join(" - ")}
                    {item.academic_year ? ` — ${item.academic_year}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#171d39] shadow-xl">
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold">Teacher List</h3>
            <p className="mt-0.5 text-[11px] text-white/35">{visibleTeachers.length} teacher{visibleTeachers.length === 1 ? "" : "s"} shown</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] px-4 py-2.5 text-sm font-bold shadow-lg shadow-cyan-950/30 transition hover:brightness-110"
          >
            <Plus size={16} />
            Add Teacher
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-white/[0.025] text-left text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
              <tr>
                <th className="px-4 py-3">Teacher ID</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Teaching Assignments</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="8" className="px-5 py-12 text-center text-sm text-white/40">Loading teachers...</td></tr>
              ) : visibleTeachers.length === 0 ? (
                <tr><td colSpan="8" className="px-5 py-12 text-center text-sm text-white/40">No teachers found.</td></tr>
              ) : (
                visibleTeachers.map((teacher) => (
                  <tr key={teacher.teacher_id} className="transition hover:bg-white/[0.025]">
                    <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-cyan-300">{teacher.teacher_id}</span></td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold">{teacher.full_name}</div>
                      {teacher.qualification && <div className="mt-0.5 text-[10px] text-white/35">{teacher.qualification}</div>}
                    </td>

                    <td className="px-4 py-3 text-xs text-white/65">{teacher.phone || "-"}</td>
                    <td className="max-w-[190px] truncate px-4 py-3 text-xs text-white/65">{teacher.email_id || "-"}</td>
                    <td className="px-4 py-3 text-sm text-white/65">{teacher.role || "Faculty"}</td>
                    <td className="px-4 py-3">{assignmentSummary(teacher)}</td>

                    <td className="px-4 py-3">
                      <button type="button" onClick={() => handleStatus(teacher)} className={`status-badge ${teacher.is_active ? "status-active" : "status-inactive"}`}>
                        {teacher.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ActionButton title="View" onClick={() => openView(teacher)}><Eye size={15} /></ActionButton>
                        <ActionButton title="Modify" onClick={() => setEditTeacher(teacher)}><Pencil size={15} /></ActionButton>
                        <ActionButton title="Delete" danger onClick={() => setDeleteTeacher(teacher)}><Trash2 size={15} /></ActionButton>
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
        <TeacherFormModal
          title="Add Teacher"
          classes={classes}
          onClose={() => setShowAdd(false)}
          onSaved={async (message) => {
            setShowAdd(false);
            setToast({ type: "success", message });
            await loadTeachers();
          }}
          setToast={setToast}
        />
      )}

      {editTeacher && (
        <TeacherFormModal
          title="Modify Teacher"
          teacher={editTeacher}
          classes={classes}
          onClose={() => setEditTeacher(null)}
          onSaved={async (message) => {
            setEditTeacher(null);
            setToast({ type: "success", message });
            await loadTeachers();
          }}
          setToast={setToast}
        />
      )}

      {viewTeacher && <TeacherView teacher={viewTeacher} onClose={() => setViewTeacher(null)} />}

      {deleteTeacher && (
        <ConfirmDelete
          teacher={deleteTeacher}
          onCancel={() => setDeleteTeacher(null)}
          onConfirm={() => handleDeleteConfirmed(deleteTeacher)}
        />
      )}

      {toast && <Toast toast={toast} />}
    </>
  );
}

export default Teachers;