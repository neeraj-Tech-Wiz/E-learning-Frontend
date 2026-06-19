// src/pages/QuizPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getStudentTests,
  startTest,
  submitTest,
  getStudentResult,
} from "../services/testService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";

const QuizPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Test list
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loadingTests, setLoadingTests] = useState(true);

  // Per-button loading
  const [startLoadingId, setStartLoadingId] = useState(null);
  const [viewAnswersLoadingId, setViewAnswersLoadingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Active test
  const [activeTestId, setActiveTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // Timer
  const [duration, setDuration] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);
  const answersRef = useRef({});
  const activeTestIdRef = useRef(null);
  const submittingRef = useRef(false)

  // Result / Review
  const [result, setResult] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  // Submit confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  const safeClearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const markTestAttempted = (testId, resultData) => {
    setAttempts((prev) => ({
      ...prev,
      [testId]: {
        attempted: true,
        result: resultData,
      },
    }));
  };


  useEffect(() => {
      activeTestIdRef.current = activeTestId;
    }, [activeTestId]);
    
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);


  /* ===========================================
     Cleanup on unmount
  ============================================ */
  useEffect(() => {
    return () => {
      safeClearTimer();
      window.onbeforeunload = null;
    };
  }, []);

  /* ===========================================
     Load tests & attempts (to mark completed)
  ============================================ */
  const loadTests = async () => {
    try {
      setLoadingTests(true);

      const res = await getStudentTests();
      const data = res.data || [];

      setTests(data);

      // Optional: if you still want attempts map (UI compatibility)
      const map = {};
      data.forEach(t => {
        map[t.testId] = {
          attempted: t.attempted,
          result: t.attempted
            ? {
                score: t.score,
                totalQuestions: t.totalQuestions,
                reviewEnabled: t.reviewEnabled
              }
            : null
        };
    });

    setAttempts(map);

  } catch (err) {
    console.error(err);
    toast.error("Failed to load tests.");
  } finally {
    setLoadingTests(false);
  }
};


  useEffect(() => {
    loadTests();
  }, []);
  
  const finalizeSubmission = (testId, resultData) => {
  safeClearTimer();
  window.onbeforeunload = null;

  setAttempts((prev) => ({
    ...prev,
    [testId]: {
      attempted: true,
      result: resultData,
    },
  }));

  setResult(resultData);
  setActiveTestId(null);
  setQuestions([]);
  setConfirmOpen(false);
  submittingRef.current = false;
};

  /* ===========================================
     Stable auto-submit function
  ============================================ */
  const autoSubmitTest = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const testId = activeTestIdRef.current;
    if (!testId) return;

    const payload = {
      answers: Object.entries(answersRef.current).map(
        ([qid, selected]) => ({
          questionId: Number(qid),
          selectedAnswer: selected ?? null,
        })
      ),
    };

    try {
      const res = await submitTest(testId, payload);
      toast.success("⏳ Time's up! Test auto-submitted.");
      finalizeSubmission(testId, res.data);
    } catch (err) {
      submittingRef.current = false;
      toast.error("Auto-submit failed. Please submit manually.");
    }
  }, []);

  /* ===========================================
     Start test with timer
  ============================================ */
  const handleStart = async (testId) => {
    try {
      setStartLoadingId(testId);
      const res = await startTest(testId);
      const data = res.data;

      setActiveTestId(testId);
      setQuestions(data.questions || []);
      setAnswers({});
      setResult(null);
      setReviewData(null);
      setCurrentIndex(0);

      const totalSeconds = (data.durationMinutes || 0) * 60;
      setDuration(data.durationMinutes || 0);
      setSecondsLeft(totalSeconds);

      safeClearTimer();
      if (totalSeconds > 0) {
        timerRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              safeClearTimer();

              toast.error("⏳ Time is up! Auto-submitting your test...");
              
              // 🔥 DIRECT auto-submit here
              autoSubmitTest();

              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      window.onbeforeunload = () =>
        "You have an ongoing test. Are you sure you want to leave?";

      toast.success("Test started!");
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.error("You have already attempted this test!");
      } else {
        toast.error("Cannot start test");
      }
    } finally {
      setStartLoadingId(null);
    }
  };

  /* ===========================================
     Manual submit (used by confirm modal)
  ============================================ */
  const handleSubmitTest = async () => {
    if (!activeTestIdRef.current || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitLoading(true);

    const testId = activeTestIdRef.current;

    const payload = {
      answers: Object.entries(answersRef.current).map(
        ([qid, selected]) => ({
          questionId: Number(qid),
          selectedAnswer: selected ?? null,
        })
      ),
    };

    try {
      const res = await submitTest(testId, payload);
      toast.success("Test submitted!");
      finalizeSubmission(testId, res.data);
    } catch (err) {
      submittingRef.current = false;
      toast.error("Error submitting test");
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ===========================================
     View Answers (Review)
  ============================================ */
  const handleViewAnswers = async (testId) => {
    try {
      setViewAnswersLoadingId(testId);
      const res = await getStudentResult(testId);
      const data = res.data;

      if (!data.reviewEnabled) {
        toast.error("Review not enabled by teacher yet.");
        return;
      }

      setReviewData(data);
      setResult(null);
      setActiveTestId(null);
      setQuestions([]);
    } catch {
      toast.error("Could not load review.");
    } finally {
      setViewAnswersLoadingId(null);
    }
  };

  /* ===========================================
     Helpers
  ============================================ */
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  /* ===========================================
     UI START
  ============================================ */
  return (
    <div className="p-6 text-[var(--fg)]">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">MCQ Tests</h1>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="px-4 py-2 rounded bg-gray-700 text-white text-sm hover:bg-gray-800"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ========== REVIEW SCREEN (detailed answers) ========== */}
      {reviewData && (
        <div className="bg-[var(--card)] p-5 rounded-lg border border-[var(--border)] mb-4">
          <h2 className="text-xl font-semibold mb-3">
            Review – Score: {reviewData.score} /{" "}
            {reviewData.totalQuestions ?? reviewData.total}
          </h2>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {reviewData.questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded border border-[var(--border)]"
              >
                <p className="font-semibold mb-2">
                  {idx + 1}. {q.questionText}
                </p>
            {/* Question status badge */}
            <div className="mb-2">
              {q.studentAnswer == null ? (
                <span className="inline-block px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
                  Not Answered
                </span>
              ) : q.correct ? (
                <span className="inline-block px-2 py-1 text-xs rounded bg-green-700/40 text-green-300">
                  Correct
                </span>
              ) : (
                <span className="inline-block px-2 py-1 text-xs rounded bg-red-700/40 text-red-300">
                  Wrong
                </span>
              )}
            </div>
            {/* Options */}
            {["A", "B", "C", "D"].map((opt) => {
              const isCorrect = q.correctAnswer === opt;
              const isSelected = q.studentAnswer === opt;

              return (
                <p
                  key={opt}
                  className={`px-3 py-1 rounded mb-1 border ${
                    isCorrect
                      ? "bg-green-900/40 text-green-300 border-green-700"
                      : isSelected
                      ? "bg-red-900/40 text-red-300 border-red-700"
                      : "bg-gray-800/40 text-gray-300 border-gray-700"
                  }`}
                >
                  <b>{opt}:</b> {q[`option${opt}`]}
                </p>
              );
            })}
              </div>
            ))}
          </div>

          <button
            onClick={() => setReviewData(null)}
            className="mt-4 px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
          >
            Back to Tests
          </button>
        </div>
      )}

      {/* ========== SCORE SCREEN (simple) ========== */}
      {result && !reviewData && (
        <div className="bg-[var(--card)] p-5 rounded-lg border border-[var(--border)] mb-4">
          <h2 className="text-xl font-semibold mb-3">Your Score</h2>
          <p className="text-lg">
            <b>Score:</b> {result.score} / {result.totalQuestions}
          </p>

          <button
            onClick={() => setResult(null)}
            className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Tests
          </button>
        </div>
      )}

      {/* ========== ACTIVE TEST SCREEN ========== */}
      {activeTestId && questions.length > 0 && !result && !reviewData && (
        <div className="bg-[var(--card)] p-5 rounded-lg border border-[var(--border)]">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">
              Question {currentIndex + 1} / {questions.length}
            </span>
            {duration > 0 && (
              <span
                className={`font-bold ${
                  secondsLeft < 60 ? "text-red-400" : "text-yellow-300"
                }`}
              >
                ⏳ {formatTime(secondsLeft)}
              </span>
            )}
          </div>

          <div className="w-full bg-gray-700 h-2 rounded mb-4">
            <div
              className="h-2 bg-green-500 rounded"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>

          <div className="p-4 rounded border border-[var(--border)] mb-6">
            <p className="font-semibold mb-3 text-lg">
              {questions[currentIndex].questionIndex}.{" "}
              {questions[currentIndex].questionText}
            </p>

            <div className="space-y-2">
              {["A", "B", "C", "D"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 cursor-pointer bg-[var(--muted)] p-2 rounded"
                >
                  <input
                    type="radio"
                    name={`q-${questions[currentIndex].id}`}
                    value={opt}
                    checked={answers[questions[currentIndex].id] === opt}
                   onChange={() => {
                      const qid = questions[currentIndex].id;

                      // update ref immediately
                      answersRef.current[qid] = opt;

                      // update state for UI
                      setAnswers((prev) => ({
                        ...prev,
                        [qid]: opt,
                      }));
                    }}

                  />
                  <span>
                    <b>{opt}:</b> {questions[currentIndex][`option${opt}`]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-4 py-2 rounded bg-gray-600 text-white disabled:bg-gray-800"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Next
              </button>
            ) : (
              <LoaderButton
                loading={submitLoading}
                onClick={() => setConfirmOpen(true)}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Submit Test
              </LoaderButton>
            )}
          </div>
        </div>
      )}

      {/* ========== TEST LIST (with View Score + View Answers) ========== */}
      {!activeTestId && !result && !reviewData && (
        <div className="space-y-4 mt-4">
          {loadingTests ? (
            <div className="w-full flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tests.length === 0 ? (
            <p>No tests available.</p>
          ) : (
            tests.map((t) => (
              <div
                key={t.testId
}
                className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-lg font-semibold">{t.title}</p>
                  <p className="opacity-70 text-sm">Date: {t.date}</p>
                  <p className="opacity-70 text-sm">
                    Duration: {t.durationMinutes} mins
                  </p>

                  {attempts[t.testId
]?.attempted && (
                    <span className="text-green-400 text-sm font-medium">
                      ✔ Completed
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {attempts[t.testId
]?.attempted ? (
                    <>
                      <button
                        onClick={() => setResult(attempts[t.testId
].result)}
                        className="px-3 py-2 rounded bg-green-700 text-white hover:bg-green-800 text-sm"
                      >
                        View Score
                      </button>
                      <LoaderButton
                        loading={viewAnswersLoadingId === t.testId
}
                        onClick={() => handleViewAnswers(t.testId
)}
                        className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                      >
                        View Answers
                      </LoaderButton>
                    </>
                  ) : (
                    <LoaderButton
                      loading={startLoadingId === t.testId
}
                      onClick={() => handleStart(t.testId
)}
                      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      Start Test
                    </LoaderButton>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== SUBMIT CONFIRMATION MODAL ========== */}
      {confirmOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Submit Test?</h3>
            <p className="text-sm opacity-80 mb-4">
              Are you sure you want to submit your answers? You won&apos;t be
              able to change them after submission.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-3 py-2 rounded bg-gray-700 text-white text-sm hover:bg-gray-800"
              >
                Cancel
              </button>
              <LoaderButton
                loading={submitLoading}
                onClick={handleSubmitTest}
                className="px-3 py-2 rounded bg-green-600 text-white text-sm"
              >
                Yes, Submit
              </LoaderButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
