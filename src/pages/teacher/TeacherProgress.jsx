import React, { useEffect, useMemo, useRef, useState } from "react";
import teacherProgressService from "../../services/teacherProgressService";
import { toast } from "react-hot-toast";
import { FaSearch, FaTimes, FaChevronRight } from "react-icons/fa";
import "../../styles/teacher-progress.css";

/* ── Mini progress bar ── */
const Bar = ({ value = 0, color = "blue" }) => (
  <div className="tp-bar-track">
    <div
      className={`tp-bar-fill tp-bar-fill--${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

/* ── Detail Modal ── */
const DetailModal = ({ open, onClose, student }) => {
  if (!open) return null;
  return (
    <>
      <div className="tp-overlay" onClick={onClose} />
      <div className="tp-modal">
        <div className="tp-modal-header">
          <div>
            <h3 className="tp-modal-title">
              {student?.studentName}
              <span className="tp-modal-std">Std {student?.studentStandard}</span>
            </h3>
            <p className="tp-modal-sub">Detailed content progress</p>
          </div>
          <button className="tp-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="tp-modal-body">
          {!student ? (
            <div className="tp-loading">Loading…</div>
          ) : student.progressList?.length === 0 ? (
            <div className="tp-empty"><p>No activity recorded yet.</p></div>
          ) : (
            student.progressList.map(p => (
              <div key={`${p.contentType}_${p.contentId}`} className="tp-detail-row">
                <div className="tp-detail-top">
                  <span className="tp-detail-title">{p.title}</span>
                  <span className={`tp-type-pill tp-type-pill--${p.contentType === "LECTURE" ? "blue" : "green"}`}>
                    {p.contentType}
                  </span>
                </div>
                {p.subject && <p className="tp-detail-sub">{p.subject}</p>}
                <div className="tp-detail-meta">
                  <span className={`tp-status-badge tp-status-badge--${p.completed ? "done" : "pending"}`}>
                    {p.completed ? "✓ Completed" : "⏳ Pending"}
                  </span>
                  {p.completionDate && (
                    <span className="tp-detail-date">
                      {new Date(p.completionDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

/* ======================================================
   MAIN
====================================================== */
const TeacherProgress = () => {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const debounce = useRef(null);

  /* initial load */
  useEffect(() => {
    (async () => {
      try {
        const data = await teacherProgressService.getAllProgress();
        setRows(data || []);
      } catch { toast.error("Failed to load progress"); }
      finally  { setLoading(false); }
    })();
  }, []);

  /* debounced search */
  useEffect(() => {
    setLoading(true);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const fn = query.trim()
          ? teacherProgressService.searchProgress
          : teacherProgressService.getAllProgress;
        const data = await fn(query.trim());
        setRows(data || []);
      } catch { toast.error("Failed to load progress"); }
      finally  { setLoading(false); }
    }, 350);
    return () => clearTimeout(debounce.current);
  }, [query]);

  const openDetails = async (studentId) => {
    const tid = toast.loading("Loading details…");
    try {
      const data = await teacherProgressService.getStudentProgress(studentId);
      setSelected(data); setModalOpen(true);
      toast.success("Ready", { id: tid });
    } catch {
      toast.error("Could not load student details", { id: tid });
    }
  };

  return (
    <div className="tp-root">
      {/* ── Header ── */}
      <div className="tp-page-header">
        <div>
          <h2 className="tp-title">Students Progress</h2>
          <p className="tp-sub">Track lecture and material completion per student</p>
        </div>
        <div className="tp-search-wrap">
          <FaSearch className="tp-search-icon" />
          <input
            className="tp-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by student name…"
          />
          {query && (
            <button className="tp-search-clear" onClick={() => setQuery("")}>
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="tp-card">
        {loading ? (
          <div className="tp-skeleton-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="tp-skeleton-row">
                <div className="tp-skeleton tp-sk-name" />
                <div className="tp-skeleton tp-sk-sm" />
                <div className="tp-skeleton tp-sk-bar" />
                <div className="tp-skeleton tp-sk-bar" />
                <div className="tp-skeleton tp-sk-bar" />
                <div className="tp-skeleton tp-sk-btn" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="tp-empty">
            <div className="tp-empty-icon">🎓</div>
            <p>No students found.</p>
            {query && <span>Try clearing your search.</span>}
          </div>
        ) : (
          <div className="tp-table-wrap">
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Std</th>
                  <th>Lectures</th>
                  <th>Materials</th>
                  <th>Overall</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const lecPct = (r.completedLectures / Math.max(1, r.totalLectures)) * 100;
                  const matPct = (r.completedMaterials / Math.max(1, r.totalMaterials)) * 100;
                  const overall = Math.round(r.overallPercentage);
                  const completed = (r.progressList || []).filter(i => i.completed).length;
                  const total     = (r.progressList || []).length;

                  return (
                    <tr key={r.studentId}>
                      <td>
                        <div className="tp-student-cell">
                          <div className="tp-avatar">
                            {(r.studentName || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="tp-student-name">{r.studentName}</div>
                            <div className="tp-student-meta">{completed}/{total} completed</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tp-std-badge">{r.studentStandard}</span>
                      </td>
                      <td>
                        <div className="tp-bar-cell">
                          <Bar value={lecPct} color="blue" />
                          <span className="tp-bar-count">{r.completedLectures}/{r.totalLectures}</span>
                        </div>
                      </td>
                      <td>
                        <div className="tp-bar-cell">
                          <Bar value={matPct} color="purple" />
                          <span className="tp-bar-count">{r.completedMaterials}/{r.totalMaterials}</span>
                        </div>
                      </td>
                      <td>
                        <div className="tp-bar-cell">
                          <Bar value={overall} color={overall >= 75 ? "green" : overall >= 50 ? "gold" : "red"} />
                          <span className="tp-bar-count">{overall}%</span>
                        </div>
                      </td>
                      <td>
                        <button className="tp-view-btn" onClick={() => openDetails(r.studentId)}>
                          Details <FaChevronRight />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DetailModal open={modalOpen} onClose={() => setModalOpen(false)} student={selected} />
    </div>
  );
};

export default TeacherProgress;