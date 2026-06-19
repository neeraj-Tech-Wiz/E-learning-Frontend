// src/components/teacher/TeacherAssignments.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  FaClipboardList, FaPlus, FaChevronDown, FaChevronUp,
  FaUserGraduate, FaStar, FaLightbulb, FaTimes,
} from "react-icons/fa";
import "../../styles/teacher-assignments.css";

const TeacherAssignments = () => {
  const [assignments, setAssignments]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [creating, setCreating]               = useState(false);
  const [showForm, setShowForm]               = useState(false);
  const [expandedId, setExpandedId]           = useState(null);
  const [submissionsMap, setSubmissionsMap]   = useState({});
  const [loadingSubsId, setLoadingSubsId]     = useState(null);

  /* Form state */
  const [title, setTitle]       = useState("");
  const [subject, setSubject]   = useState("");
  const [standard, setStandard] = useState("");

  /* Multi-question state — each question has text, marks, rubric */
  const emptyQuestion = () => ({ text: "", marks: 2, rubric: "" });
  const [questions, setQuestions] = useState([emptyQuestion()]);

  /* Total marks = sum of all question marks (auto-calculated) */
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, value) =>
    setQuestions(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/api/assignments/mine");
      setAssignments(res.data || []);
    } catch { toast.error("Failed to load assignments"); }
    finally  { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !subject || !standard || questions.length === 0) {
      toast.error("Please fill in all fields and add at least one question"); return;
    }
    const incomplete = questions.find(q => !q.text.trim() || !q.rubric.trim() || !q.marks);
    if (incomplete) {
      toast.error("Please complete all question fields (text, marks, rubric)"); return;
    }

    // Build a single combined rubric string from all questions for the backend
    // Format: "Q1 (X marks): <question text>\nRubric: <rubric>\n\nQ2..."
    const combinedRubric = questions
      .map((q, i) =>
        `Question ${i + 1} (${q.marks} marks):\n${q.text}\nMarking criteria: ${q.rubric}`
      )
      .join("\n\n");

    try {
      setCreating(true);
      const res = await api.post("/api/assignments", {
        title, subject, standard: Number(standard),
        totalMarks,          // auto-summed
        rubric: combinedRubric,
      });
      setAssignments(prev => [res.data, ...prev]);
      setTitle(""); setSubject(""); setStandard("");
      setQuestions([emptyQuestion()]);
      setShowForm(false);
      toast.success("Assignment created! Students can now submit.");
    } catch { toast.error("Failed to create assignment"); }
    finally  { setCreating(false); }
  };

  const loadSubmissions = async (assignmentId) => {
    if (submissionsMap[assignmentId]) return; // already loaded
    setLoadingSubsId(assignmentId);
    try {
      const res = await api.get(`/api/assignments/${assignmentId}/submissions`);
      setSubmissionsMap(prev => ({ ...prev, [assignmentId]: res.data || [] }));
    } catch { toast.error("Failed to load submissions"); }
    finally  { setLoadingSubsId(null); }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadSubmissions(id);
    }
  };

  const getScoreColor = (marks, total) => {
    const pct = (marks / total) * 100;
    if (pct >= 75) return "ta-score--high";
    if (pct >= 50) return "ta-score--mid";
    return "ta-score--low";
  };

  return (
    <div className="ta-asgn-root">
      {/* ── Page header ── */}
      <div className="ta-asgn-page-header">
        <div>
          <h2 className="ta-asgn-title">AI Assignment Grader</h2>
          <p className="ta-asgn-sub">Create assignments — Gemini AI grades student PDFs automatically</p>
        </div>
        <button className="ta-asgn-create-btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> New Assignment</>}
        </button>
      </div>

      {/* ── Create form ── */}
      {showForm && (
        <div className="ta-asgn-card ta-asgn-form-card">
          <div className="ta-asgn-card-header">
            <FaClipboardList className="ta-asgn-card-icon" />
            <h3>Create New Assignment</h3>
          </div>

          <form onSubmit={handleCreate} className="ta-asgn-form">
            <div className="ta-asgn-row-2">
              <div className="ta-asgn-field">
                <label className="ta-asgn-label">Title</label>
                <input
                  className="ta-asgn-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 5 — Photosynthesis"
                />
              </div>
              <div className="ta-asgn-field">
                <label className="ta-asgn-label">Subject</label>
                <input
                  className="ta-asgn-input"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Biology"
                />
              </div>
            </div>

            <div className="ta-asgn-row-2">
              <div className="ta-asgn-field">
                <label className="ta-asgn-label">Standard</label>
                <select
                  className="ta-asgn-input"
                  value={standard}
                  onChange={e => setStandard(e.target.value)}
                  required
                >
                  <option value="">Select standard</option>
                  {[8,9,10,11,12].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="ta-asgn-field">
                <label className="ta-asgn-label">Total Marks</label>
                <input
                  className="ta-asgn-input"
                  type="number" min="1" max="100"
                  value={totalMarks}
                  onChange={e => setTotalMarks(e.target.value)}
                />
              </div>
            </div>

            {/* ── Questions ── */}
            <div className="ta-asgn-questions-header">
              <div>
                <span className="ta-asgn-label">Questions</span>
                <span className="ta-asgn-q-count">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
                <span className="ta-asgn-total-marks-pill">{totalMarks} total marks</span>
              </div>
              <button type="button" className="ta-asgn-add-q-btn" onClick={addQuestion}>
                <FaPlus /> Add Question
              </button>
            </div>

            <div className="ta-asgn-questions-list">
              {questions.map((q, i) => (
                <div key={i} className="ta-asgn-question-block">
                  <div className="ta-asgn-q-block-header">
                    <span className="ta-asgn-q-num">Q{i + 1}</span>
                    <div className="ta-asgn-q-marks-wrap">
                      <label className="ta-asgn-q-marks-label">Marks</label>
                      <input
                        type="number" min="1" max="50"
                        className="ta-asgn-input ta-asgn-q-marks-input"
                        value={q.marks}
                        onChange={e => updateQuestion(i, "marks", e.target.value)}
                      />
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="ta-asgn-q-remove"
                        onClick={() => removeQuestion(i)}
                        title="Remove question"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <div className="ta-asgn-field">
                    <label className="ta-asgn-label">Question Text</label>
                    <textarea
                      className="ta-asgn-input ta-asgn-textarea ta-asgn-textarea--sm"
                      rows={2}
                      placeholder="e.g. Explain the process of photosynthesis with a diagram."
                      value={q.text}
                      onChange={e => updateQuestion(i, "text", e.target.value)}
                    />
                  </div>

                  <div className="ta-asgn-field">
                    <label className="ta-asgn-label">
                      Marking Rubric
                      <span className="ta-asgn-label-hint"> — AI grades this question using these criteria</span>
                    </label>
                    <textarea
                      className="ta-asgn-input ta-asgn-textarea ta-asgn-textarea--sm"
                      rows={3}
                      placeholder={`e.g.\n- Definition of photosynthesis: 1 mark\n- Mention of chlorophyll + sunlight: 1 mark\n- Correct equation: 2 marks\n- Neat diagram with labels: 1 mark`}
                      value={q.rubric}
                      onChange={e => updateQuestion(i, "rubric", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="ta-asgn-rubric-tip">
              💡 The more specific each rubric, the more accurate the AI grading will be.
            </p>

            <div className="ta-asgn-form-footer">
              <span className="ta-asgn-marks-summary">
                {questions.length} question{questions.length !== 1 ? "s" : ""} · {totalMarks} total marks
              </span>
              <button type="submit" className="ta-asgn-submit-btn" disabled={creating || totalMarks === 0}>
                {creating
                  ? <><div className="ta-asgn-spinner" /> Creating…</>
                  : <><FaPlus /> Create Assignment</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Assignment list ── */}
      {loading ? (
        <div className="ta-asgn-sk-list">
          {[1,2].map(i => (
            <div key={i} className="ta-asgn-card">
              <div className="ta-asgn-sk ta-asgn-sk--title" />
              <div className="ta-asgn-sk ta-asgn-sk--sub" />
              <div className="ta-asgn-sk ta-asgn-sk--sub" style={{ width: "40%" }} />
            </div>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="ta-asgn-empty">
          <FaClipboardList className="ta-asgn-empty-icon" />
          <p>No assignments yet</p>
          <span>Click "New Assignment" above to create one.</span>
        </div>
      ) : (
        <div className="ta-asgn-list">
          {assignments.map(a => (
            <div key={a.id} className="ta-asgn-card ta-asgn-item">
              {/* Top row */}
              <div className="ta-asgn-item-top">
                <div className="ta-asgn-item-info">
                  <div className="ta-asgn-item-title-row">
                    <span className="ta-asgn-item-title">{a.title}</span>
                    <span className="ta-asgn-item-marks">{a.totalMarks} marks</span>
                  </div>
                  <div className="ta-asgn-item-meta">
                    <span>{a.subject}</span>
                    <span>·</span>
                    <span>Std {a.standard}</span>
                    <span>·</span>
                    <span>{new Date(a.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span>
                  </div>
                </div>

                <div className="ta-asgn-item-actions">
                  <span className="ta-asgn-subs-count">
                    <FaUserGraduate />
                    {submissionsMap[a.id]?.length ?? "—"} submissions
                  </span>
                  <button
                    className="ta-asgn-expand-btn"
                    onClick={() => toggleExpand(a.id)}
                  >
                    {expandedId === a.id ? <FaChevronUp /> : <FaChevronDown />}
                    {expandedId === a.id ? "Hide" : "View Submissions"}
                  </button>
                </div>
              </div>

              {/* Submissions panel */}
              {expandedId === a.id && (
                <div className="ta-asgn-subs-panel">
                  {loadingSubsId === a.id ? (
                    <div className="ta-asgn-loading">
                      <div className="ta-asgn-spinner" /> Loading submissions…
                    </div>
                  ) : !submissionsMap[a.id]?.length ? (
                    <div className="ta-asgn-no-subs">No submissions yet for this assignment.</div>
                  ) : (
                    <div className="ta-asgn-subs-list">
                      {submissionsMap[a.id].map(s => (
                        <div key={s.submissionId} className="ta-asgn-sub-row">
                          <div className="ta-asgn-sub-student">
                            <div className="ta-asgn-sub-avatar">
                              {(s.studentName || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="ta-asgn-sub-name">{s.studentName || "Unknown"}</span>
                              <span className="ta-asgn-sub-date">
                                {s.submittedAt
                                  ? new Date(s.submittedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
                                  : "—"}
                              </span>
                            </div>
                          </div>

                          {s.status === "GRADED" ? (
                            <div className="ta-asgn-sub-result">
                              <span className={`ta-asgn-score ${getScoreColor(s.marksAwarded, s.totalMarks)}`}>
                                {s.marksAwarded}/{s.totalMarks}
                              </span>
                              <div className="ta-asgn-sub-feedback">
                                {s.remarks && (
                                  <div className="ta-asgn-feedback-row">
                                    <FaStar className="ta-asgn-feedback-icon ta-fi--amber" />
                                    <span>{s.remarks}</span>
                                  </div>
                                )}
                                {s.improvementTips && (
                                  <div className="ta-asgn-feedback-row">
                                    <FaLightbulb className="ta-asgn-feedback-icon ta-fi--blue" />
                                    <span>{s.improvementTips}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className={`ta-asgn-status ta-asgn-status--${s.status?.toLowerCase()}`}>
                              {s.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;