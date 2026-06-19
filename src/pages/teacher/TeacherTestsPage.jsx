import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createTest, getTeacherTests, getTestSubmissions, enableReview, disableReview,
} from "../../services/testService";
import { toast } from "react-hot-toast";
import LoaderButton from "../../components/LoaderButton";
import {
  FaPlus, FaTrash, FaEye, FaLock, FaLockOpen,
  FaClipboardList, FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import "../../styles/teacher-tests.css";

const emptyQuestion = () => ({
  questionText:"", optionA:"", optionB:"", optionC:"", optionD:"", correctAnswer:"A",
});

const TeacherTestsPage = () => {
  const { user } = useAuth();

  const [tests, setTests]               = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [title, setTitle]               = useState("");
  const [date, setDate]                 = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [standard, setStandard]         = useState("");
  const [questions, setQuestions]       = useState([emptyQuestion()]);
  const [creating, setCreating]         = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [submissions, setSubmissions]   = useState([]);
  const [error, setError]               = useState("");
  const [reviewLoadingId, setReviewLoadingId]       = useState(null);
  const [submissionsLoadingId, setSubmissionsLoadingId] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingTests(true);
        const res = await getTeacherTests();
        setTests((res.data || []).sort((a,b) => b.id - a.id));
      } catch { toast.error("Failed to load tests"); }
      finally  { setLoadingTests(false); }
    })();
  }, []);

  const handleQuestionChange = (index, field, value) =>
    setQuestions(prev => { const c=[...prev]; c[index]={...c[index],[field]:value}; return c; });

  const addQuestion    = () => setQuestions(p => [...p, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions(p => p.filter((_,idx) => idx!==i));

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!title || !date || !standard || !questions.length) {
      toast.error("Please fill in all fields and add at least one question."); return;
    }
    try {
      setCreating(true); setError("");
      const res = await createTest({ title, date, durationMinutes, standard, questions });
      setTests(p => [res.data, ...p]);
      setTitle(""); setDate(""); setDurationMinutes(30); setStandard(""); setQuestions([emptyQuestion()]);
      toast.success("Test created successfully!");
    } catch {
      setError("Failed to create test. Are you logged in as TEACHER?");
      toast.error("Failed to create test.");
    } finally { setCreating(false); }
  };

  const loadSubmissions = async (test) => {
    setSelectedTest(test); setSubmissions([]); setSubmissionsLoadingId(test.id);
    try {
      const res = await getTestSubmissions(test.id);
      setSubmissions(res.data || []);
    } catch { toast.error("Failed to load submissions"); }
    finally  { setSubmissionsLoadingId(null); }
  };

  const handleReviewToggle = async (test) => {
    try {
      setReviewLoadingId(test.id);
      if (test.reviewEnabled) { await disableReview(test.id); toast("Review disabled", { icon:"🚫" }); }
      else                    { await enableReview(test.id);  toast("Review enabled",  { icon:"🔓" }); }
      setTests(p => p.map(t => t.id===test.id ? {...t, reviewEnabled:!t.reviewEnabled} : t));
    } catch { toast.error("Failed to update review setting"); }
    finally  { setReviewLoadingId(null); }
  };

  return (
    <div className="tt-root">
      {/* ── Header ── */}
      <div className="tt-page-header">
        <div>
          <h2 className="tt-title">MCQ Tests</h2>
          <p className="tt-sub">Create and manage multiple-choice tests for your students</p>
        </div>
        {user && (
          <span className="tt-user-pill">
            {user.email} · {user.role}
          </span>
        )}
      </div>

      {error && <div className="tt-error-banner">{error}</div>}

      <div className="tt-grid">
        {/* ═══════════════ CREATE FORM ═══════════════ */}
        <div className="tt-card tt-create-card">
          <div className="tt-card-header">
            <FaClipboardList className="tt-card-header-icon" />
            <h3>Create New Test</h3>
          </div>

          <form onSubmit={handleCreateTest} className="tt-form">
            <div className="tt-field">
              <label className="tt-label">Test Title</label>
              <input className="tt-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Advanced Mathematics Ch.3" />
            </div>

            <div className="tt-row-2">
              <div className="tt-field">
                <label className="tt-label">Date</label>
                <input className="tt-input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
              <div className="tt-field">
                <label className="tt-label">Standard</label>
                <select className="tt-input" value={standard} onChange={e=>setStandard(Number(e.target.value))} required>
                  <option value="">Select</option>
                  {[8,9,10,11,12].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="tt-field">
              <label className="tt-label">Duration (minutes)</label>
              <input className="tt-input" type="number" min="1" value={durationMinutes} onChange={e=>setDurationMinutes(Number(e.target.value))} />
            </div>

            {/* Questions */}
            <div className="tt-questions-header">
              <span className="tt-label">Questions <span className="tt-q-count">{questions.length}</span></span>
              <button type="button" className="tt-add-q-btn" onClick={addQuestion}>
                <FaPlus /> Add Question
              </button>
            </div>

            <div className="tt-questions-list">
              {questions.map((q, idx) => (
                <div key={idx} className="tt-question-block">
                  <div className="tt-q-header">
                    <span className="tt-q-num">Q{idx+1}</span>
                    {questions.length > 1 && (
                      <button type="button" className="tt-q-remove" onClick={() => removeQuestion(idx)}>
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  <textarea
                    className="tt-input tt-textarea"
                    rows={2}
                    placeholder="Enter question text…"
                    value={q.questionText}
                    onChange={e => handleQuestionChange(idx,"questionText",e.target.value)}
                  />
                  <div className="tt-options-grid">
                    {["A","B","C","D"].map(opt => (
                      <div key={opt} className={`tt-option${q.correctAnswer===opt ? " tt-option--correct" : ""}`}>
                        <span className="tt-opt-label">{opt}</span>
                        <input
                          className="tt-input tt-opt-input"
                          placeholder={`Option ${opt}`}
                          value={q[`option${opt}`]}
                          onChange={e => handleQuestionChange(idx,`option${opt}`,e.target.value)}
                        />
                        <label className="tt-correct-label" title="Mark as correct">
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={q.correctAnswer===opt}
                            onChange={() => handleQuestionChange(idx,"correctAnswer",opt)}
                            className="tt-radio"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <LoaderButton type="submit" loading={creating} className="tt-submit-btn">
              {creating ? "Creating…" : "Create Test"}
            </LoaderButton>
          </form>
        </div>

        {/* ═══════════════ TEST LIST ═══════════════ */}
        <div className="tt-right-col">
          <div className="tt-card">
            <div className="tt-card-header">
              <FaClipboardList className="tt-card-header-icon" />
              <h3>Your Tests</h3>
              <span className="tt-test-count">{tests.length}</span>
            </div>

            {loadingTests ? (
              <div className="tt-skeleton-list">
                {Array.from({length:3}).map((_,i) => (
                  <div key={i} className="tt-skeleton-item">
                    <div className="tt-skeleton tt-sk-title" />
                    <div className="tt-skeleton tt-sk-sub" />
                    <div className="tt-skeleton tt-sk-btns" />
                  </div>
                ))}
              </div>
            ) : tests.length === 0 ? (
              <div className="tt-empty">
                <div className="tt-empty-icon">📝</div>
                <p>No tests created yet.</p>
              </div>
            ) : (
              <div className="tt-test-list">
                {tests.map(t => (
                  <div key={t.id} className={`tt-test-item${expandedTest===t.id ? " tt-test-item--open" : ""}`}>
                    <div className="tt-test-top">
                      <div className="tt-test-info">
                        <span className="tt-test-title">{t.title}</span>
                        <div className="tt-test-meta">
                          <span>📅 {t.date}</span>
                          <span>⏱ {t.durationMinutes} min</span>
                          <span>🎓 Std {t.standard}</span>
                        </div>
                        <span className={`tt-review-badge${t.reviewEnabled ? " tt-review-badge--on" : " tt-review-badge--off"}`}>
                          {t.reviewEnabled ? <><FaLockOpen /> Review ON</> : <><FaLock /> Review OFF</>}
                        </span>
                      </div>
                      <button
                        className="tt-expand-btn"
                        onClick={() => setExpandedTest(expandedTest===t.id ? null : t.id)}
                      >
                        {expandedTest===t.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>

                    {/* Expanded actions */}
                    {expandedTest===t.id && (
                      <div className="tt-test-actions">
                        <LoaderButton
                          type="button"
                          loading={reviewLoadingId===t.id}
                          onClick={() => handleReviewToggle(t)}
                          className={`tt-action-btn${t.reviewEnabled ? " tt-action-btn--disable" : " tt-action-btn--enable"}`}
                        >
                          {t.reviewEnabled ? <><FaLock /> Disable Review</> : <><FaLockOpen /> Enable Review</>}
                        </LoaderButton>
                        <LoaderButton
                          type="button"
                          loading={submissionsLoadingId===t.id}
                          onClick={() => loadSubmissions(t)}
                          className="tt-action-btn tt-action-btn--view"
                        >
                          <FaEye /> View Submissions
                        </LoaderButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submissions */}
          {selectedTest && (
            <div className="tt-card tt-submissions-card">
              <div className="tt-card-header">
                <FaEye className="tt-card-header-icon" />
                <h3>Submissions — {selectedTest.title}</h3>
              </div>

              {submissionsLoadingId===selectedTest.id ? (
                <div className="tt-loading-spin">
                  <div className="tt-spinner" />
                  <span>Loading submissions…</span>
                </div>
              ) : submissions.length===0 ? (
                <div className="tt-empty"><div className="tt-empty-icon">📭</div><p>No submissions yet.</p></div>
              ) : (
                <div className="tt-sub-table-wrap">
                  <table className="tt-sub-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Score</th>
                        <th>Total Q</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(s => {
                        const pct = Math.round((s.score/s.totalQuestions)*100);
                        return (
                          <tr key={s.id}>
                            <td className="tt-sub-name">{s.studentName||"N/A"}</td>
                            <td className="tt-sub-email">{s.studentEmail||"N/A"}</td>
                            <td>
                              <span className={`tt-score-badge${pct>=75 ? " tt-score-badge--high" : pct>=50 ? " tt-score-badge--mid" : " tt-score-badge--low"}`}>
                                {s.score}/{s.totalQuestions}
                              </span>
                            </td>
                            <td>{s.totalQuestions}</td>
                            <td className="tt-sub-date">{s.dateTaken}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherTestsPage;