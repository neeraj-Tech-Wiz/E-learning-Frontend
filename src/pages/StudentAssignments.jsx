// src/components/student/StudentAssignments.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import {
  FaFileUpload, FaCheckCircle, FaSpinner,
  FaClipboardList, FaStar, FaLightbulb,
  FaChevronDown, FaChevronUp, FaHistory,
} from "react-icons/fa";
import "../styles/student-assignments.css";

const StudentAssignments = () => {
  const [assignments, setAssignments]   = useState([]);
  const [submissions, setSubmissions]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState("assignments"); // "assignments" | "results"
  const [submitting, setSubmitting]     = useState(null); // assignmentId being submitted
  const [result, setResult]             = useState(null); // latest grade result
  const [expanded, setExpanded]         = useState(null); // expanded assignment id
  const fileRefs                        = useRef({});

  useEffect(() => {
    Promise.all([fetchAssignments(), fetchSubmissions()])
      .finally(() => setLoading(false));
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/api/assignments/student");
      setAssignments(res.data || []);
    } catch { toast.error("Failed to load assignments"); }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/api/assignments/student/submissions");
      setSubmissions(res.data || []);
    } catch { /* silent */ }
  };

  const handleSubmit = async (assignmentId) => {
    const file = fileRefs.current[assignmentId]?.files?.[0];
    if (!file) { toast.error("Please select a PDF file first"); return; }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are accepted"); return;
    }

    setSubmitting(assignmentId);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(`/api/assignments/${assignmentId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setTab("results");
      toast.success("Assignment graded successfully!");
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data || "Submission failed. Please try again.");
    } finally {
      setSubmitting(null);
      if (fileRefs.current[assignmentId]) fileRefs.current[assignmentId].value = "";
    }
  };

  const getScoreColor = (marks, total) => {
    const pct = (marks / total) * 100;
    if (pct >= 75) return "sa-score--high";
    if (pct >= 50) return "sa-score--mid";
    return "sa-score--low";
  };

  const getScoreLabel = (marks, total) => {
    const pct = (marks / total) * 100;
    if (pct >= 75) return "Excellent";
    if (pct >= 50) return "Good";
    if (pct >= 35) return "Needs Work";
    return "Below Average";
  };

  return (
    <div className="sa-root">
      {/* ── Header ── */}
      <div className="sa-header">
        <div className="sa-header-left">
          <div className="sa-header-icon"><FaClipboardList /></div>
          <div>
            <h2 className="sa-title">AI Assignment Grader</h2>
            <p className="sa-sub">Upload your PDF — get instant marks and feedback</p>
          </div>
        </div>
        <div className="sa-tabs">
          <button
            className={`sa-tab${tab === "assignments" ? " sa-tab--active" : ""}`}
            onClick={() => setTab("assignments")}
          >
            <FaClipboardList /> Assignments
            {assignments.length > 0 && <span className="sa-tab-badge">{assignments.length}</span>}
          </button>
          <button
            className={`sa-tab${tab === "results" ? " sa-tab--active" : ""}`}
            onClick={() => setTab("results")}
          >
            <FaHistory /> My Results
            {submissions.length > 0 && <span className="sa-tab-badge">{submissions.length}</span>}
          </button>
        </div>
      </div>

      {/* ── ASSIGNMENTS TAB ── */}
      {tab === "assignments" && (
        <div className="sa-content">
          {loading ? (
            <div className="sa-grid">
              {[1,2].map(i => (
                <div key={i} className="sa-card">
                  <div className="sa-sk sa-sk--title" />
                  <div className="sa-sk sa-sk--sub" />
                  <div className="sa-sk sa-sk--sub" style={{ width: "50%" }} />
                  <div className="sa-sk sa-sk--btn" />
                </div>
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="sa-empty">
              <FaClipboardList className="sa-empty-icon" />
              <p>No assignments yet</p>
              <span>Your teacher hasn't posted any assignments yet.</span>
            </div>
          ) : (
            <div className="sa-assignment-list">
              {assignments.map(a => (
                <div key={a.id} className="sa-card sa-assignment-card">
                  <div className="sa-card-top">
                    <div className="sa-assignment-info">
                      <div className="sa-assignment-title-row">
                        <h3 className="sa-assignment-title">{a.title}</h3>
                        <span className="sa-marks-pill">{a.totalMarks} marks</span>
                      </div>
                      <div className="sa-assignment-meta">
                        <span>{a.subject}</span>
                        <span>·</span>
                        <span>By {a.teacherName}</span>
                        <span>·</span>
                        <span>Std {a.standard}</span>
                      </div>
                    </div>
                    <button
                      className="sa-expand-btn"
                      onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    >
                      {expanded === a.id ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>

                  {/* Rubric (expandable) */}
                  {expanded === a.id && (
                    <div className="sa-rubric-box">
                      <p className="sa-rubric-label">Marking Criteria</p>
                      <p className="sa-rubric-text">{a.rubric}</p>
                    </div>
                  )}

                  {/* Upload area */}
                  <div className="sa-upload-area">
                    <label className="sa-file-label" htmlFor={`file-${a.id}`}>
                      <FaFileUpload />
                      <span>Choose PDF file</span>
                      <input
                        id={`file-${a.id}`}
                        type="file"
                        accept=".pdf"
                        className="sa-file-input"
                        ref={el => fileRefs.current[a.id] = el}
                        onChange={e => {
                          const name = e.target.files?.[0]?.name;
                          const label = document.getElementById(`file-name-${a.id}`);
                          if (label) label.textContent = name || "No file chosen";
                        }}
                      />
                    </label>
                    <span id={`file-name-${a.id}`} className="sa-file-name">No file chosen</span>

                    <button
                      className="sa-submit-btn"
                      onClick={() => handleSubmit(a.id)}
                      disabled={submitting === a.id}
                    >
                      {submitting === a.id ? (
                        <><FaSpinner className="sa-spin" /> Grading with AI…</>
                      ) : (
                        <><FaCheckCircle /> Submit & Grade</>
                      )}
                    </button>
                  </div>

                  {submitting === a.id && (
                    <div className="sa-grading-status">
                      <FaSpinner className="sa-spin" />
                      Extracting text from PDF and grading with Gemini AI…
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RESULTS TAB ── */}
      {tab === "results" && (
        <div className="sa-content">
          {/* Latest result highlight */}
          {result && (
            <div className="sa-result-highlight">
              <div className="sa-result-top">
                <div>
                  <p className="sa-result-label">Latest Result</p>
                  <h3 className="sa-result-title">{result.assignmentTitle}</h3>
                </div>
                <div className={`sa-score-circle ${getScoreColor(result.marksAwarded, result.totalMarks)}`}>
                  <span className="sa-score-num">{result.marksAwarded}</span>
                  <span className="sa-score-total">/ {result.totalMarks}</span>
                  <span className="sa-score-label">{getScoreLabel(result.marksAwarded, result.totalMarks)}</span>
                </div>
              </div>

              <div className="sa-result-section">
                <div className="sa-result-section-header">
                  <FaStar className="sa-section-icon sa-section-icon--amber" />
                  <span>Remarks</span>
                </div>
                <p className="sa-result-text">{result.remarks}</p>
              </div>

              <div className="sa-result-section">
                <div className="sa-result-section-header">
                  <FaLightbulb className="sa-section-icon sa-section-icon--blue" />
                  <span>Tips to Improve</span>
                </div>
                <p className="sa-result-text">{result.improvementTips}</p>
              </div>
            </div>
          )}

          {/* Past submissions */}
          {submissions.length === 0 ? (
            <div className="sa-empty">
              <FaHistory className="sa-empty-icon" />
              <p>No submissions yet</p>
              <span>Submit an assignment to see your results here.</span>
            </div>
          ) : (
            <div className="sa-submissions-list">
              <h3 className="sa-section-title">All Submissions</h3>
              {submissions.map(s => (
                <div key={s.submissionId} className={`sa-submission-item${s.status === "GRADED" ? " sa-submission-item--graded" : ""}`}>
                  <div className="sa-submission-left">
                    <span className="sa-submission-title">{s.assignmentTitle}</span>
                    <span className="sa-submission-date">
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      }) : "—"}
                    </span>
                  </div>
                  <div className="sa-submission-right">
                    {s.status === "GRADED" ? (
                      <span className={`sa-score-pill ${getScoreColor(s.marksAwarded, s.totalMarks)}`}>
                        {s.marksAwarded} / {s.totalMarks}
                      </span>
                    ) : (
                      <span className={`sa-status-pill sa-status-${s.status?.toLowerCase()}`}>
                        {s.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;