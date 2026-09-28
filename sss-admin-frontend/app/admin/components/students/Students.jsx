"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  Mic,
  Volume2,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";

import Kpi from "../shared/Kpi";
import StudentPhoto from "../shared/StudentPhoto";
import ActionButton from "../shared/ActionButton";
import Toast from "../shared/Toast";

import StudentFormModal from "./StudentFormModal";
import StudentView from "./StudentView";
import ConfirmDelete from "./ConfirmDelete";

import { apiFetch } from "../../../../lib/api";

function Students() {
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
  const [largePhoto, setLargePhoto] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState(null);

  const [toast, setToast] = useState(null);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

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

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        // Ignore cleanup errors.
      }

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function loadClasses() {
    try {
      const data = await apiFetch("/api/admin/classes");

      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Failed to load classes."
      );
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

      setStudents({
        items: Array.isArray(data?.items)
          ? data.items
          : [],
        total: Number(data?.total || 0),
        active: Number(data?.active || 0),
        inactive: Number(data?.inactive || 0),
      });

      setError("");
    } catch (err) {
      setError(
        err.message || "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleStudents = useMemo(() => {
    if (statusFilter === "active") {
      return students.items.filter(
        (student) => student.is_active
      );
    }

    if (statusFilter === "inactive") {
      return students.items.filter(
        (student) => !student.is_active
      );
    }

    return students.items;
  }, [students.items, statusFilter]);

  function getSpeechLanguage() {
    if (
      typeof navigator === "undefined"
    ) {
      return "en-IN";
    }

    return (
      navigator.language || "en-IN"
    );
  }

  function startVoiceSearch() {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setToast({
        type: "error",
        message:
          "Voice search is not supported in this browser.",
      });

      return;
    }

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        // Ignore stop errors.
      }

      setListening(false);
      return;
    }

    try {
      const recognition =
        new SpeechRecognition();

      recognition.lang =
        getSpeechLanguage();

      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognitionRef.current =
        recognition;

      setListening(true);

      recognition.onresult = (event) => {
        const spokenText =
          event.results?.[0]?.[0]?.transcript
            ?.trim() || "";

        if (spokenText) {
          setSearch(spokenText);
        }
      };

      recognition.onerror = (event) => {
        console.error(
          "Voice search error:",
          event
        );

        setListening(false);
        recognitionRef.current = null;

        setToast({
          type: "error",
          message:
            "Voice search could not be started.",
        });
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err) {
      console.error(
        "Voice search start error:",
        err
      );

      setListening(false);
      recognitionRef.current = null;

      setToast({
        type: "error",
        message:
          err.message ||
          "Voice search could not be started.",
      });
    }
  }

  function speakSearch() {
    if (typeof window === "undefined") {
      return;
    }

    const text = search.trim();

    if (!text) {
      setToast({
        type: "error",
        message:
          "Enter or search for a name first.",
      });

      return;
    }

    if (
      !("speechSynthesis" in window)
    ) {
      setToast({
        type: "error",
        message:
          "Voice playback is not supported in this browser.",
      });

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang =
      getSpeechLanguage();

    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );
  }

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
          !student.is_active
            ? "Active"
            : "Inactive"
        }.`,
      });

      await loadStudents();
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.message ||
          "Failed to update status.",
      });
    }
  }

  async function handleDeleteConfirmed(
    student
  ) {
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
        message:
          err.message ||
          "Failed to delete student.",
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
        message:
          err.message ||
          "Failed to load student details.",
      });
    }
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          Students
        </p>

        <h2 className="mt-1 text-2xl font-black sm:text-3xl">
          Student Management
        </h2>

        <p className="mt-1 text-sm text-white/40">
          View and manage students across SSS School.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() =>
            setStatusFilter("all")
          }
          className="text-left"
        >
          <Kpi
            title="Total Students"
            value={students.total}
            icon={Users}
            type="total"
            selected={
              statusFilter === "all"
            }
          />
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter("active")
          }
          className="text-left"
        >
          <Kpi
            title="Active Students"
            value={students.active}
            icon={CheckCircle2}
            type="active"
            selected={
              statusFilter === "active"
            }
          />
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter("inactive")
          }
          className="text-left"
        >
          <Kpi
            title="Inactive Students"
            value={students.inactive}
            icon={AlertCircle}
            type="inactive"
            selected={
              statusFilter === "inactive"
            }
          />
        </button>
      </div>

      {/* SEARCH + CLASS FILTER */}
      <section className="mt-4 rounded-2xl border border-white/10 bg-[#171d39] p-4 shadow-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
          {/* SEARCH */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              Search Students
            </label>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Name, ID, phone, email, admission..."
                className="h-11 w-full rounded-xl border border-white/10 bg-[#0e142c] pl-10 pr-24 text-sm outline-none placeholder:text-white/25 focus:border-cyan-400/50"
              />

              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {/* MIC */}
                <button
                  type="button"
                  title="Voice search"
                  onClick={
                    startVoiceSearch
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    listening
                      ? "bg-cyan-400/15 text-cyan-300"
                      : "text-white/40 hover:bg-white/10 hover:text-cyan-300"
                  }`}
                >
                  <Mic
                    size={16}
                    className={
                      listening
                        ? "animate-pulse"
                        : ""
                    }
                  />
                </button>

                {/* SPEAKER */}
                <button
                  type="button"
                  title="Read search"
                  onClick={speakSearch}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-cyan-300"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* CLASS FILTER */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              Class & Section
            </label>

            <div className="relative">
              <select
                value={classId}
                onChange={(e) =>
                  setClassId(
                    e.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#0e142c] px-3.5 pr-9 text-sm outline-none focus:border-cyan-400/50"
              >
                <option value="">
                  All Classes
                </option>

                {classes.map((item) => (
                  <option
                    key={item.class_id}
                    value={item.class_id}
                  >
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

      {/* STUDENT LIST */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#171d39] shadow-xl">
        {/* LIST HEADER */}
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold">
              Student List
            </h3>

            <p className="mt-0.5 text-[11px] text-white/35">
              {visibleStudents.length} student
              {visibleStudents.length ===
              1
                ? ""
                : "s"}{" "}
              shown
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAdd(true)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] px-4 py-2.5 text-sm font-bold shadow-lg shadow-cyan-950/30 transition hover:brightness-110"
          >
            <Users size={16} />
            Add Student
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-white/[0.025] text-left text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
              <tr>
                <th className="px-4 py-3">
                  Photo
                </th>

                <th className="px-4 py-3">
                  ID
                </th>

                <th className="px-4 py-3">
                  Student
                </th>

                <th className="px-4 py-3">
                  Class
                </th>

                <th className="px-4 py-3">
                  Section
                </th>

                <th className="px-4 py-3">
                  Phone
                </th>

                <th className="px-4 py-3">
                  Email
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Actions
                </th>
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
              ) : visibleStudents.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-12 text-center text-sm text-white/40"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                visibleStudents.map(
                  (student) => (
                    <tr
                      key={
                        student.student_id
                      }
                      className="transition hover:bg-white/[0.025]"
                    >
                      {/* PHOTO */}
                      <td className="px-4 py-3">
                        <StudentPhoto
                          src={
                            student.student_photo_url
                          }
                          name={
                            student.name
                          }
                          onClick={(src) =>
                            setLargePhoto(
                              src
                            )
                          }
                        />
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-cyan-300">
                          {student.ui_id ||
                            `S${String(
                              student.student_id
                            ).padStart(
                              4,
                              "0"
                            )}`}
                        </span>
                      </td>

                      {/* STUDENT */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold">
                          {student.name}
                        </div>

                        <div className="mt-0.5 text-[10px] text-white/35">
                          {student.admission_no ||
                            "-"}
                        </div>
                      </td>

                      {/* CLASS */}
                      <td className="px-4 py-3 text-sm text-white/65">
                        {student.class_name ||
                          "-"}
                      </td>

                      {/* SECTION */}
                      <td className="px-4 py-3 text-sm text-white/65">
                        {student.section ||
                          "-"}
                      </td>

                      {/* PHONE */}
                      <td className="px-4 py-3 text-xs text-white/65">
                        {student.student_phone ||
                          "-"}
                      </td>

                      {/* EMAIL */}
                      <td className="max-w-[190px] truncate px-4 py-3 text-xs text-white/65">
                        {student.student_email ||
                          "-"}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatus(
                              student
                            )
                          }
                          className={`status-badge ${
                            student.is_active
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {student.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <ActionButton
                            title="View"
                            onClick={() =>
                              openView(
                                student
                              )
                            }
                          >
                            <Eye
                              size={15}
                            />
                          </ActionButton>

                          <ActionButton
                            title="Modify"
                            onClick={() =>
                              setEditStudent(
                                student
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />
                          </ActionButton>

                          <ActionButton
                            title="Delete"
                            danger
                            onClick={() =>
                              setDeleteStudent(
                                student
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ADD STUDENT */}
      {showAdd && (
        <StudentFormModal
          title="Add Student"
          classes={classes}
          onClose={() =>
            setShowAdd(false)
          }
          onSaved={async (
            message
          ) => {
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

      {/* MODIFY STUDENT */}
      {editStudent && (
        <StudentFormModal
          title="Modify Student"
          student={editStudent}
          classes={classes}
          onClose={() =>
            setEditStudent(null)
          }
          onSaved={async (
            message
          ) => {
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

      {/* VIEW STUDENT */}
      {viewStudent && (
        <StudentView
          student={viewStudent}
          onClose={() =>
            setViewStudent(null)
          }
        />
      )}

      {/* DELETE CONFIRMATION */}
      {deleteStudent && (
        <ConfirmDelete
          student={deleteStudent}
          onCancel={() =>
            setDeleteStudent(null)
          }
          onConfirm={() =>
            handleDeleteConfirmed(
              deleteStudent
            )
          }
        />
      )}

      {/* LARGE PHOTO */}
      {largePhoto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-5"
          onClick={() =>
            setLargePhoto(null)
          }
        >
          <button
            type="button"
            onClick={() =>
              setLargePhoto(null)
            }
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close photo"
          >
            ✕
          </button>

          <img
            src={largePhoto}
            alt="Student"
            className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          />
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <Toast toast={toast} />
      )}
    </>
  );
}

export default Students;