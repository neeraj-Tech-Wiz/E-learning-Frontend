import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { FaSpinner, FaCheck, FaTimes, FaUsers, FaRedo } from "react-icons/fa";
import "../../styles/teacher-attendance.css";

export default function TeacherAttendance() {
  const [standard, setStandard]           = useState(10);
  const [date, setDate]                   = useState(() => new Date().toISOString().slice(0,10));
  const [students, setStudents]           = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [selectAll, setSelectAll]         = useState(true);
  const [error, setError]                 = useState("");

  useEffect(() => { fetchStudents(); }, [standard]);

  async function fetchStudents() {
    setLoadingStudents(true); setError(""); setStudents([]);
    try {
      const res = await api.get(`/api/teacher/students/class/${standard}`);
      const data = Array.isArray(res.data)
        ? res.data.map(s => ({
            studentId: s.id ?? s.studentId ?? null,
            name: s.name ?? s.studentName ?? s.email ?? "Unknown",
            present: true,
          }))
        : [];
      setStudents(data); setSelectAll(true);
      toast.success(`Loaded ${data.length} students`);
    } catch (err) {
      setError("Failed to load students — check token or network");
      toast.error("Error fetching students");
    } finally {
      setLoadingStudents(false);
    }
  }

  function toggleStudent(idx) {
    setStudents(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], present: !copy[idx].present };
      return copy;
    });
    setSelectAll(false);
  }

  function handleSelectAll() {
    setSelectAll(prev => {
      const next = !prev;
      setStudents(prevS => prevS.map(s => ({ ...s, present: next })));
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!students.length) { toast.error("No students loaded!"); return; }
    setSubmitting(true);
    const toastId = toast.loading("Submitting attendance...");
    try {
      const statuses = students.map(s => ({ studentId: s.studentId, present: !!s.present }));
      const res = await api.post("/api/attendance/bulk", { date, statuses });
      toast.success("Attendance submitted ✓", { id: toastId });
      if (Array.isArray(res.data)) toast(`${res.data.length} records updated`, { icon: "📋" });
    } catch {
      toast.error("Failed to submit attendance", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  const presentCount = students.filter(s => s.present).length;
  const absentCount  = students.length - presentCount;

  return (
    <div className="ta-root">
      {/* ── Page header ── */}
      <div className="ta-page-header">
        <div>
          <h2 className="ta-title">Upload Attendance</h2>
          <p className="ta-sub">Mark and submit bulk attendance for your class</p>
        </div>
        {students.length > 0 && (
          <div className="ta-counter-pills">
            <span className="ta-counter-pill ta-counter-pill--green">
              <FaCheck /> {presentCount} Present
            </span>
            <span className="ta-counter-pill ta-counter-pill--red">
              <FaTimes /> {absentCount} Absent
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="ta-error-banner">{error}</div>
      )}

      {/* ── Filter form ── */}
      <form onSubmit={handleSubmit}>
        <div className="ta-card ta-filter-card">
          <div className="ta-filter-row">
            <div className="ta-field">
              <label className="ta-label">Class / Standard</label>
              <select className="ta-select" value={standard} onChange={e => setStandard(Number(e.target.value))}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i+1} value={i+1}>Standard {i+1}</option>
                ))}
              </select>
            </div>

            <div className="ta-field">
              <label className="ta-label">Date</label>
              <input
                type="date"
                className="ta-select"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <div className="ta-field ta-field--actions">
              <button
                type="button"
                onClick={fetchStudents}
                disabled={loadingStudents}
                className="ta-btn ta-btn--secondary"
              >
                {loadingStudents ? <FaSpinner className="ta-spin" /> : <FaRedo />}
                {loadingStudents ? "Loading…" : "Reload Students"}
              </button>

              <button
                type="submit"
                disabled={submitting || loadingStudents || !students.length}
                className="ta-btn ta-btn--success"
              >
                {submitting && <FaSpinner className="ta-spin" />}
                {submitting ? "Submitting…" : "Submit Attendance"}
              </button>
            </div>
          </div>

          {/* Toolbar */}
          {students.length > 0 && (
            <div className="ta-toolbar">
              <div className="ta-toolbar-left">
                <label className="ta-check-label">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="ta-checkbox"
                  />
                  Mark All Present
                </label>
                <button
                  type="button"
                  className="ta-invert-btn"
                  onClick={() => setStudents(prev => prev.map(s => ({ ...s, present: !s.present })))}
                >
                  Invert Selection
                </button>
              </div>
              <span className="ta-toolbar-right">
                <FaUsers /> {students.length} students
              </span>
            </div>
          )}
        </div>

        {/* ── Student Table ── */}
        <div className="ta-card ta-table-card">
          {loadingStudents ? (
            <div className="ta-skeleton-list">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ta-skeleton-row">
                  <div className="ta-skeleton ta-sk-xs" />
                  <div className="ta-skeleton ta-sk-lg" />
                  <div className="ta-skeleton ta-sk-md" />
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="ta-empty">
              <div className="ta-empty-icon">👥</div>
              <p>No students loaded</p>
              <span>Select a standard and click "Reload Students"</span>
            </div>
          ) : (
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.studentId ?? idx} className={!s.present ? "ta-row--absent" : ""}>
                      <td className="ta-td-mono">{s.studentId}</td>
                      <td className="ta-td-name">{s.name}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleStudent(idx)}
                          className={`ta-toggle-btn${s.present ? " ta-toggle-btn--present" : " ta-toggle-btn--absent"}`}
                        >
                          {s.present
                            ? <><FaCheck /> Present</>
                            : <><FaTimes /> Absent</>
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}