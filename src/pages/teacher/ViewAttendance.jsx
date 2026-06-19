import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaSearch, FaExclamationTriangle, FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../styles/view-attendance.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const ViewAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [pageMeta, setPageMeta]   = useState({ page: 0, size: 10, totalPages: 0 });
  const [year, setYear]           = useState(new Date().getFullYear());
  const [month, setMonth]         = useState(new Date().getMonth() + 1);
  const [loading, setLoading]     = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sendingWarning, setSendingWarning]   = useState(false);

  const token = localStorage.getItem("user_token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAttendance = async (page = 0) => {
    setLoading(true);
    try {
      const url = `${BACKEND_URL}/api/attendance/teacher/report?year=${year}&month=${month}&page=${page}&size=${pageMeta.size}`;
      const res = await axios.get(url, axiosConfig);
      setAttendanceData(res.data.content);
      setPageMeta({ page: res.data.number, size: res.data.size, totalPages: res.data.totalPages });
      toast.success("Attendance loaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAttendance(0); }, []);

  const openWarningModal  = (student) => { setSelectedStudent(student); setConfirmModal(true); };
  const closeWarningModal = () => { setConfirmModal(false); setSelectedStudent(null); };

  const sendWarning = async () => {
    if (!selectedStudent) return;
    const percentage = Math.round((selectedStudent.daysPresent / selectedStudent.totalDaysInMonth) * 100);
    setSendingWarning(true);
    try {
      await axios.post(`${BACKEND_URL}/api/attendance/warn`, {
        studentId: selectedStudent.studentId,
        year, month, attendancePercentage: percentage,
      }, axiosConfig);
      toast.success(`Warning sent to ${selectedStudent.studentName}`);
      closeWarningModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send warning");
    }
    setSendingWarning(false);
  };

  /* ── derived stats ── */
  const totalStudents  = attendanceData.length;
  const lowAttendance  = attendanceData.filter(s => Math.round((s.daysPresent / s.totalDaysInMonth) * 100) < 75).length;
  const goodAttendance = totalStudents - lowAttendance;

  return (
    <div className="va-root">
      {/* ── PAGE TITLE ── */}
      <div className="va-page-header">
        <div>
          <h2 className="va-title">View Attendance</h2>
          <p className="va-sub">Monthly attendance report for your class</p>
        </div>
      </div>

      {/* ── FILTER CARD ── */}
      <div className="va-card va-filter-card">
        <div className="va-filter-row">
          <div className="va-field">
            <label className="va-label">Month</label>
            <select className="va-select" value={month} onChange={e => setMonth(e.target.value)}>
              {MONTH_NAMES.map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="va-field">
            <label className="va-label">Year</label>
            <select className="va-select" value={year} onChange={e => setYear(e.target.value)}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="va-field va-field--end">
            <button className="va-btn va-btn--primary" onClick={() => fetchAttendance(0)} disabled={loading}>
              <FaSearch />
              {loading ? "Loading…" : "Load Attendance"}
            </button>
          </div>
        </div>
      </div>

      {/* ── STAT PILLS ── */}
      {!loading && attendanceData.length > 0 && (
        <div className="va-stats-row">
          <div className="va-stat-pill va-stat-pill--blue">
            <span className="va-stat-num">{totalStudents}</span>
            <span className="va-stat-lbl">Total Students</span>
          </div>
          <div className="va-stat-pill va-stat-pill--green">
            <FaCheckCircle />
            <span className="va-stat-num">{goodAttendance}</span>
            <span className="va-stat-lbl">Good Attendance</span>
          </div>
          <div className="va-stat-pill va-stat-pill--red">
            <FaExclamationTriangle />
            <span className="va-stat-num">{lowAttendance}</span>
            <span className="va-stat-lbl">Low Attendance</span>
          </div>
        </div>
      )}

      {/* ── TABLE CARD ── */}
      <div className="va-card">
        {/* Loading skeleton */}
        {loading && (
          <div className="va-skeleton-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="va-skeleton-row">
                <div className="va-skeleton va-sk-sm" />
                <div className="va-skeleton va-sk-md" />
                <div className="va-skeleton va-sk-sm" />
                <div className="va-skeleton va-sk-sm" />
                <div className="va-skeleton va-sk-sm" />
                <div className="va-skeleton va-sk-sm" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && attendanceData.length === 0 && (
          <div className="va-empty">
            <div className="va-empty-icon">📋</div>
            <p>No attendance data found.</p>
            <span>Select a month and year, then click Load Attendance.</span>
          </div>
        )}

        {/* Table */}
        {!loading && attendanceData.length > 0 && (
          <>
            <div className="va-table-wrap">
              <table className="va-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Days Present</th>
                    <th>Total Days</th>
                    <th>Attendance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map(s => {
                    const pct = Math.round((s.daysPresent / s.totalDaysInMonth) * 100);
                    const low = pct < 75;
                    return (
                      <tr key={s.studentId} className={low ? "va-row--low" : ""}>
                        <td className="va-td-mono">{s.studentId}</td>
                        <td className="va-td-name">{s.studentName}</td>
                        <td>{s.daysPresent}</td>
                        <td>{s.totalDaysInMonth}</td>
                        <td>
                          <div className="va-pct-cell">
                            <div className="va-mini-bar">
                              <div
                                className={`va-mini-fill${low ? " va-mini-fill--low" : ""}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`va-badge${low ? " va-badge--red" : " va-badge--green"}`}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td>
                          {low ? (
                            <button className="va-warn-btn" onClick={() => openWarningModal(s)}>
                              <FaExclamationTriangle /> Send Warning
                            </button>
                          ) : (
                            <span className="va-ok-badge">
                              <FaCheckCircle /> OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="va-pagination">
              <button
                className="va-page-btn"
                disabled={pageMeta.page === 0}
                onClick={() => fetchAttendance(pageMeta.page - 1)}
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="va-page-info">
                Page <strong>{pageMeta.page + 1}</strong> of <strong>{pageMeta.totalPages}</strong>
              </span>
              <button
                className="va-page-btn"
                disabled={pageMeta.page + 1 === pageMeta.totalPages}
                onClick={() => fetchAttendance(pageMeta.page + 1)}
              >
                Next <FaChevronRight />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── WARNING MODAL ── */}
      {confirmModal && (
        <>
          <div className="va-overlay" onClick={closeWarningModal} />
          <div className="va-modal">
            <div className="va-modal-icon">⚠️</div>
            <h3 className="va-modal-title">Send Warning Email?</h3>
            <p className="va-modal-body">
              You are about to send an attendance warning to<br />
              <strong>{selectedStudent?.studentName}</strong>.
            </p>
            <div className="va-modal-actions">
              <button className="va-btn va-btn--danger" onClick={sendWarning} disabled={sendingWarning}>
                {sendingWarning ? "Sending…" : "Yes, Send Warning"}
              </button>
              <button className="va-btn va-btn--ghost" onClick={closeWarningModal}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewAttendance;