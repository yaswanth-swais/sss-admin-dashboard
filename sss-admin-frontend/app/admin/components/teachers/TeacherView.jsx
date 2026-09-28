"use client";

import ModalShell from "../shared/ModalShell";
import Detail from "../shared/Detail";

function TeacherView({
  teacher,
  onClose,
}) {
  const mappings =
    Array.isArray(
      teacher.teaching_mappings
    )
      ? teacher.teaching_mappings
      : [];

  return (
    <ModalShell
      title="Teacher Details"
      subtitle={`${teacher.teacher_id} • ${teacher.full_name}`}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">
        {/* BASIC DETAILS */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Detail
            label="Teacher ID"
            value={
              teacher.teacher_id
            }
          />

          <Detail
            label="Name"
            value={
              teacher.full_name
            }
          />

          <Detail
            label="Phone"
            value={
              teacher.phone
            }
          />

          <Detail
            label="Email"
            value={
              teacher.email_id
            }
          />

          <Detail
            label="Qualification"
            value={
              teacher.qualification
            }
          />

          <Detail
            label="Role"
            value={
              teacher.role ||
              "Faculty"
            }
          />

          <Detail
            label="Status"
            value={
              teacher.is_active
                ? "Active"
                : "Inactive"
            }
          />
        </div>

        {/* ASSIGNMENTS */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                Teaching Assignments
              </p>

              <p className="mt-1 text-xs text-white/35">
                {mappings.length} assignment
                {mappings.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>

          {mappings.length ===
          0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/40">
              No teaching assignments found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[650px]">
                <thead className="bg-white/[0.025] text-left text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
                  <tr>
                    <th className="px-4 py-3">
                      Class / Section
                    </th>

                    <th className="px-4 py-3">
                      Subject
                    </th>

                    <th className="px-4 py-3">
                      Academic Year
                    </th>

                    <th className="px-4 py-3">
                      Class Teacher
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {mappings.map(
                    (mapping) => (
                      <tr
                        key={
                          mapping.assignment_id
                        }
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-cyan-300">
                          {[
                            mapping.class_name,
                            mapping.section_name,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              "-"
                            ) ||
                            "-"
                          }
                        </td>

                        <td className="px-4 py-3 text-sm text-white/70">
                          {
                            mapping.subject_name
                          }
                        </td>

                        <td className="px-4 py-3 text-sm text-white/60">
                          {
                            mapping.academic_year ||
                            "-"
                          }
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {mapping.is_class_teacher ? (
                            <span className="status-badge status-active">
                              Yes
                            </span>
                          ) : (
                            <span className="text-white/40">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

export default TeacherView;