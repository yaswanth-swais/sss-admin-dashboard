"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

import ModalShell from "../shared/ModalShell";
import FormSection from "../shared/FormSection";
import Field from "../shared/Field";
import SelectField from "../shared/SelectField";
import { apiFetch } from "../../../../lib/api";

const emptyNotice = {
  notice_title: "",
  notice_text: "",
  target_audience: "all",
  applicable_class: "",
};

const emptyEvent = {
  title: "",
  event_type: "",
  event_date: "",
  description: "",
  location: "",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function DeleteDialog({ label, onCancel, onConfirm, busy }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11172d] p-5 shadow-2xl">
        <h3 className="text-base font-bold text-white">Delete item?</h3>
        <p className="mt-2 text-sm text-white/55">
          Delete {label}? This will remove it from the active list.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NoticeForm({ notice, classes, onClose, onSaved, setToast }) {
  const editing = Boolean(notice);

  const [form, setForm] = useState({
    ...emptyNotice,
    notice_title: notice?.notice_title ?? "",
    notice_text: notice?.notice_text ?? "",
    target_audience: notice?.target_audience ?? "all",
    applicable_class: notice?.applicable_class ?? "",
  });

  const [saving, setSaving] = useState(false);

  const audienceOptions = [
    ["all", "For All"],
    ["students", "Students"],
    ["teachers", "Teachers"],
  ];

  const classOptions = [
    ["", "For All"],
    ...(Array.isArray(classes) ? classes : []).map((item) => [
      String(item.class_id),
      item.label ||
        [item.class_name, item.section_name]
          .filter(Boolean)
          .join(" - "),
    ]),
  ];

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));
  }

  async function save() {
    const title = String(form.notice_title ?? "").trim();
    const audience = String(form.target_audience ?? "").trim().toLowerCase();

    if (!title) {
      setToast({ type: "error", message: "Notice title is required." });
      return;
    }

    if (!audience) {
      setToast({
        type: "error",
        message: "Select who should receive this notice.",
      });
      return;
    }

    setSaving(true);

    try {
      await apiFetch(
        editing
          ? `/api/admin/notices/${encodeURIComponent(notice.notice_id)}`
          : "/api/admin/notices",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            notice_title: title,
            notice_text: String(form.notice_text ?? "").trim() || null,
            target_audience: audience,
            applicable_class:
              audience === "students"
                ? String(form.applicable_class ?? "")
                : "",
          }),
        }
      );

      await onSaved(
        editing
          ? "Notice updated successfully."
          : "Notice added successfully."
      );
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Failed to save notice.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={editing ? "Modify Notice" : "Add New Notice"}
      onClose={onClose}
    >
      <div className="space-y-5">
        <FormSection title="Notice Information">
          <div className="space-y-4">
            <Field
              label="Notice Title *"
              value={form.notice_title ?? ""}
              onChange={(v) => update("notice_title", v)}
            />

            <SelectField
              label="Notice For *"
              value={form.target_audience ?? "all"}
              onChange={(v) => update("target_audience", v)}
              options={audienceOptions}
            />

            {String(form.target_audience ?? "all") === "students" && (
              <SelectField
                label="Class / Section"
                value={form.applicable_class ?? ""}
                onChange={(v) => update("applicable_class", v)}
                options={classOptions}
              />
            )}

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                Notice Content
              </span>
              <textarea
                value={form.notice_text ?? ""}
                onChange={(e) => update("notice_text", e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-[#0e142c] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                placeholder="Enter notice details..."
              />
            </label>
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
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
            className="rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] px-6 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Notice"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function EventForm({ event, onClose, onSaved, setToast }) {
  const editing = Boolean(event);

  const [form, setForm] = useState({
    ...emptyEvent,
    title: event?.title ?? "",
    event_type: event?.event_type ?? "",
    event_date: event?.event_date ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
  });

  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));
  }

  async function save() {
    const title = String(form.title ?? "").trim();

    if (!title) {
      setToast({ type: "error", message: "Event title is required." });
      return;
    }

    if (!form.event_date) {
      setToast({ type: "error", message: "Event date is required." });
      return;
    }

    setSaving(true);

    try {
      await apiFetch(
        editing
          ? `/api/admin/events/${encodeURIComponent(event.event_id)}`
          : "/api/admin/events",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            title,
            event_type: String(form.event_type ?? "").trim() || null,
            event_date: form.event_date,
            description: String(form.description ?? "").trim() || null,
            location: String(form.location ?? "").trim() || null,
          }),
        }
      );

      await onSaved(
        editing
          ? "Event updated successfully."
          : "Event added successfully."
      );
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Failed to save event.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      title={editing ? "Modify Event" : "Add New Event"}
      onClose={onClose}
    >
      <div className="space-y-5">
        <FormSection title="Event Information">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Event Title *"
                value={form.title ?? ""}
                onChange={(v) => update("title", v)}
              />

              <Field
                label="Event Type"
                value={form.event_type ?? ""}
                onChange={(v) => update("event_type", v)}
              />

              <Field
                label="Event Date *"
                type="date"
                value={form.event_date ?? ""}
                onChange={(v) => update("event_date", v)}
              />

              <Field
                label="Location"
                value={form.location ?? ""}
                onChange={(v) => update("location", v)}
              />
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                Description
              </span>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-[#0e142c] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                placeholder="Enter event details..."
              />
            </label>
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
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
            className="rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] px-6 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Event"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ViewDialog({ title, children, onClose }) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="space-y-4">{children}</div>
    </ModalShell>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-white/75">
        {value || "—"}
      </div>
    </div>
  );
}

export default function Others() {
  const [tab, setTab] = useState("notices");

  const [classes, setClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);

  const [noticeForm, setNoticeForm] = useState(null);
  const [eventForm, setEventForm] = useState(null);

  const [viewNotice, setViewNotice] = useState(null);
  const [viewEvent, setViewEvent] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast?.message) return undefined;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    loadClasses();
    loadNotices();
    loadEvents();
  }, []);

  async function loadClasses() {
    try {
      const result = await apiFetch("/api/admin/classes");
      setClasses(Array.isArray(result) ? result : []);
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Failed to load classes.",
      });
    }
  }

  async function loadNotices() {
    try {
      const result = await apiFetch("/api/admin/notices");
      setNotices(result?.items || []);
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Failed to load notices.",
      });
    }
  }

  async function loadEvents() {
    try {
      const result = await apiFetch("/api/admin/events");
      setEvents(result?.items || []);
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Failed to load events.",
      });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleteBusy(true);

    try {
      const path =
        deleteTarget.kind === "notice"
          ? `/api/admin/notices/${deleteTarget.item.notice_id}`
          : `/api/admin/events/${deleteTarget.item.event_id}`;

      await apiFetch(path, { method: "DELETE" });

      if (deleteTarget.kind === "notice") {
        await loadNotices();
      } else {
        await loadEvents();
      }

      setDeleteTarget(null);
      setToast({ type: "success", message: "Deleted successfully." });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Failed to delete.",
      });
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="relative space-y-5">
      {toast?.message && (
        <div className={`fixed bottom-5 right-5 z-[100] max-w-sm rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl ${
          toast.type === "error"
            ? "border-red-400/20 bg-red-500/10 text-red-200"
            : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="border-b border-white/10">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("notices")}
            className={`border-b-2 px-5 py-3 text-sm font-bold transition ${
              tab === "notices"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/45 hover:text-white"
            }`}
          >
            Notices
          </button>

          <button
            type="button"
            onClick={() => setTab("events")}
            className={`border-b-2 px-5 py-3 text-sm font-bold transition ${
              tab === "events"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/45 hover:text-white"
            }`}
          >
            Events
          </button>
        </div>
      </div>

      {tab === "notices" && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">
                Notifications
              </div>
              <h1 className="mt-1 text-xl font-black text-white">
                Notifications
              </h1>
            </div>

            <button
              type="button"
              title="Add New Notice"
              onClick={() => setNoticeForm({ ...emptyNotice })}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] shadow-lg"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            {notices.length ? (
              <div className="divide-y divide-white/5">
                {notices.map((notice) => (
                  <div
                    key={notice.notice_id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-white">
                          {notice.notice_title || "Untitled Notice"}
                        </h3>
                        <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
                          {notice.target_audience === "teachers"
                            ? "Teachers"
                            : notice.target_audience === "students"
                              ? "Students"
                              : "Not Set"}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-white/45">
                        {notice.notice_text || "No notice content"}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        title="View"
                        onClick={() => setViewNotice(notice)}
                        className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        title="Modify"
                        onClick={() => setNoticeForm(notice)}
                        className="rounded-lg p-2 text-cyan-300/70 hover:bg-cyan-400/10 hover:text-cyan-300"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "notice",
                            item: notice,
                          })
                        }
                        className="rounded-lg p-2 text-red-300/70 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center text-sm text-white/35">
                No notifications found.
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "events" && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">
                Events
              </div>
              <h1 className="mt-1 text-xl font-black text-white">Events</h1>
            </div>

            <button
              type="button"
              title="Add New Event"
              onClick={() => setEventForm({ ...emptyEvent })}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#258af5] to-[#08b9dc] shadow-lg"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            {events.length ? (
              <div className="divide-y divide-white/5">
                {events.map((event) => (
                  <div
                    key={event.event_id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white">
                        {event.title || "Untitled Event"}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                        <span>{formatDate(event.event_date)}</span>
                        {event.event_type && <span>{event.event_type}</span>}
                        {event.location && <span>{event.location}</span>}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        title="View"
                        onClick={() => setViewEvent(event)}
                        className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        title="Modify"
                        onClick={() => setEventForm(event)}
                        className="rounded-lg p-2 text-cyan-300/70 hover:bg-cyan-400/10 hover:text-cyan-300"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "event",
                            item: event,
                          })
                        }
                        className="rounded-lg p-2 text-red-300/70 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center text-sm text-white/35">
                No events found.
              </div>
            )}
          </div>
        </section>
      )}

      {noticeForm && (
        <NoticeForm
          notice={noticeForm.notice_id ? noticeForm : null}
          classes={classes}
          onClose={() => setNoticeForm(null)}
          onSaved={async (message) => {
            setNoticeForm(null);
            await loadNotices();
            setToast({ type: "success", message });
          }}
          setToast={setToast}
        />
      )}

      {eventForm && (
        <EventForm
          event={eventForm.event_id ? eventForm : null}
          onClose={() => setEventForm(null)}
          onSaved={async (message) => {
            setEventForm(null);
            await loadEvents();
            setToast({ type: "success", message });
          }}
          setToast={setToast}
        />
      )}

      {viewNotice && (
        <ViewDialog
          title="View Notice"
          onClose={() => setViewNotice(null)}
        >
          <InfoRow label="Title" value={viewNotice.notice_title} />
          <InfoRow
            label="Notice For"
            value={
              viewNotice.target_audience === "teachers"
                ? "Teachers"
                : viewNotice.target_audience === "students"
                  ? "Students"
                  : "For All"
            }
          />
          {viewNotice.target_audience === "students" && (
            <InfoRow
              label="Class / Section"
              value={
                viewNotice.applicable_class
                  ? (() => {
                      const selected = classes.find(
                        (item) =>
                          String(item.class_id) ===
                          String(viewNotice.applicable_class)
                      );
                      return (
                        selected?.label ||
                        [selected?.class_name, selected?.section_name]
                          .filter(Boolean)
                          .join(" - ") ||
                        viewNotice.applicable_class
                      );
                    })()
                  : "For All"
              }
            />
          )}
          <InfoRow label="Content" value={viewNotice.notice_text} />
        </ViewDialog>
      )}

      {viewEvent && (
        <ViewDialog title="View Event" onClose={() => setViewEvent(null)}>
          <InfoRow label="Title" value={viewEvent.title} />
          <InfoRow label="Event Type" value={viewEvent.event_type} />
          <InfoRow label="Event Date" value={formatDate(viewEvent.event_date)} />
          <InfoRow label="Location" value={viewEvent.location} />
          <InfoRow label="Description" value={viewEvent.description} />
        </ViewDialog>
      )}

      {deleteTarget && (
        <DeleteDialog
          label={
            deleteTarget.kind === "notice"
              ? `"${deleteTarget.item.notice_title || "this notice"}"`
              : `"${deleteTarget.item.title || "this event"}"`
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          busy={deleteBusy}
        />
      )}
    </div>
  );
}
