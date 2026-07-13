import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useStudentDashboard } from "../context/StudentDashboardContext";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../services/api";

import EditStudentProfileModal from "../components/student/modals/EditStudentProfileModal";
import StudentAvatar from "../components/student/header/StudentAvatar";
import StudentProgress from "../components/student/progress/StudentProgress";
import StudentVideoRoom from "./StudentVideoRoom";
import AiChatbot from "../components/student/AiChatbot";
import { FaRobot, FaTimes } from "react-icons/fa";

import {
  FaCheckCircle,
  FaPowerOff,
  FaSlidersH,
  FaTasks,
  FaBookOpen,
  FaVideo,
  FaClipboardList,
  FaMoon,
  FaSun,
} from "react-icons/fa";

import "../styles/student-dashboard.css";

/* ======================================================
   CONSTANTS
====================================================== */
const BACKEND_URL = BASE_URL;

/* ======================================================
   HELPERS
====================================================== */
const computeProgress = (items) => {
  if (!items.length) return 0;
  const completed = items.filter((i) => i.isCompleted || i.completed).length;
  return Math.round((completed / items.length) * 100);
};

/* ======================================================
   SIDEBAR CONFIG
====================================================== */
const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    tip: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 4a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm9 0a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V4zM2 13a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3zm9 0a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
      </svg>
    ),
  },
  {
    id: "lectures",
    tip: "Lectures",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
      </svg>
    ),
  },
  {
    id: "materials",
    tip: "Materials",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
  },
  {
    id: "tests",
    tip: "MCQ Tests",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

/* ======================================================
   MAIN COMPONENT
====================================================== */
const StudentDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  /* ── theme: pull BOTH theme value and toggler from context ── */
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const {
    profile,
    attendance,
    content,
    loaded,
    loading,
    loadDashboard,
    markContentComplete,
    refreshProfile,
  } = useStudentDashboard();

  const [openEdit, setOpenEdit]               = useState(false);
  const [searchTerm, setSearchTerm]           = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [loadingContentId, setLoadingContentId] = useState(null);
  const [activeSidebar, setActiveSidebar]     = useState("dashboard");
  const [totalTests, setTotalTests]           = useState(null); // null = loading
  const [showVideoRoom, setShowVideoRoom]     = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  /* ── load on mount ── */
  useEffect(() => {
    if (!loaded) loadDashboard();
  }, [loaded, loadDashboard]);

  /* ── fetch test count once dashboard is loaded ── */
  useEffect(() => {
    if (!loaded) return;
    // Log attendance so you can inspect its shape in the console
    console.log("[Dashboard] attendance object:", attendance);

    const fetchTestCount = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await fetch(
          `${BACKEND_URL}/api/tests/student/my`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          // API always returns List<StudentTestOverviewDTO> (array)
          const count = Array.isArray(data) ? data.length : 0;
          setTotalTests(count);
        } else {
          setTotalTests(0);
        }
      } catch {
        setTotalTests(0);
      }
    };

    fetchTestCount();
  }, [loaded, attendance]);

  /* ── progress ── */
  const lecturePercent  = useMemo(() => computeProgress(content.lectures),  [content.lectures]);
  const materialPercent = useMemo(() => computeProgress(content.materials), [content.materials]);
  const overallPercent  = useMemo(() => {
    const hasBoth = content.lectures.length > 0 && content.materials.length > 0;
    const hasOnly = content.lectures.length > 0 || content.materials.length > 0;
    if (!hasOnly) return 0;
    if (hasBoth) return Math.round((lecturePercent + materialPercent) / 2);
    return content.lectures.length > 0 ? lecturePercent : materialPercent;
  }, [lecturePercent, materialPercent, content.lectures.length, content.materials.length]);

  /* ── stat counts ── */
  const totalLectures  = content.lectures.length;
  const totalMaterials = content.materials.length;
  const completedCount = useMemo(
    () => [...content.lectures, ...content.materials].filter((i) => i.isCompleted || i.completed).length,
    [content.lectures, content.materials]
  );

  /* ── subjects ── */
  const subjects = useMemo(() => {
    const all = [...content.lectures, ...content.materials].map((i) => i.subject).filter(Boolean);
    return ["ALL", ...Array.from(new Set(all))];
  }, [content.lectures, content.materials]);

  /* ── filtered content ── */
  const filteredContent = useMemo(() => {
    return [...content.lectures, ...content.materials].filter((item) => {
      const matchesTitle   = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === "ALL" || item.subject === selectedSubject;
      return matchesTitle && matchesSubject;
    });
  }, [content, searchTerm, selectedSubject]);

  /* ── open content + auto-mark complete ── */
  const handleOpenContent = async (item) => {
  const token = localStorage.getItem("user_token");

  if (!token) {
    toast.error("Not authenticated");
    return;
  }

  if (!item?.id || !item?.type) {
    toast.error("Invalid content");
    return;
  }

  try {
    setLoadingContentId(item.id);

    const url =
      item.type === "LECTURE"
        ? `${BACKEND_URL}/api/lectures/secure/stream/${item.id}`
        : `${BACKEND_URL}/api/materials/secure/download/${item.id}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      toast.error(`Access failed (${res.status})`);
      return;
    }

    // ==========================
    // VIDEO
    // ==========================
    if (item.type === "LECTURE") {
      const data = await res.json();

      window.open(data.url, "_blank");

      if (!item.isCompleted) {
        await markContentComplete(item.id, item.type);
      }

      return;
    }

    // ==========================
    // PDF
    // ==========================
    const blob = await res.blob();

    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${item.title || "material"}.${item.fileType || "pdf"}`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(blobUrl);

    if (!item.isCompleted) {
      await markContentComplete(item.id, item.type);
    }

  } catch (err) {
    console.error(err);
    toast.error("Error accessing content");
  } finally {
    setLoadingContentId(null);
  }
};

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className={`sd-root${isLight ? " sd-light" : ""}`}>

      {/* ════════════════════════════════
          TOP NAV
      ════════════════════════════════ */}
      <nav className="sd-topnav">
        <div className="sd-logo">
          EduVerse
          <span>Learning Platform</span>
        </div>

        <div className="sd-nav-right">          <button className="sd-nbtn" onClick={() => navigate("/student/assignments") }>
            <FaTasks />
            <span>Assignments</span>
          </button>
          <button className="sd-nbtn" onClick={() => navigate("/student/tests")}>
            <FaClipboardList />
            <span>MCQ Tests</span>
          </button>

          <button className="sd-nbtn" onClick={() => setShowVideoRoom(true)}>
            <FaVideo />
            <span>Live Sessions</span>
          </button>

          <button className="sd-nbtn" onClick={() => setOpenEdit(true)}>
            <FaSlidersH />
            <span>Settings</span>
          </button>

          <button className="sd-nbtn sd-nbtn-danger" onClick={logout}>
            <FaPowerOff />
            <span>Logout</span>
          </button>

          <button className="sd-theme-btn" onClick={toggleTheme} title="Toggle theme">
            <FaMoon className="sd-theme-icon sd-theme-icon-moon" />
            <FaSun  className="sd-theme-icon sd-theme-icon-sun"  />
          </button>

          <div className="sd-nav-avatar">
            <StudentAvatar
              name={profile?.name}
              photo={profile?.profilePhoto}
              onUpdated={refreshProfile}
            />
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════
          LAYOUT
      ════════════════════════════════ */}
      <div className="sd-layout">

        {/* ── SIDEBAR ── */}
        <aside className="sd-sidebar">
          {SIDEBAR_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`sd-sidebar-icon${activeSidebar === item.id ? " active" : ""}`}
              data-tip={item.tip}
              onClick={() => setActiveSidebar(item.id)}
            >
              {item.icon}
            </div>
          ))}

          <div className="sd-sidebar-spacer" />

          <div
            className="sd-sidebar-icon"
            data-tip="Profile"
            onClick={() => setOpenEdit(true)}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="sd-main">

          {/* ── HERO BANNER ── */}
          <div className="sd-hero">
            <div className="sd-hero-left">
              <h2>Welcome back, {profile?.name ?? "Student"} 👋</h2>
              <p>Standard {profile?.standard ?? "—"} &nbsp;·&nbsp; Keep up the great work!</p>
              <div className="sd-hero-chips">
                <span className="sd-chip sd-chip-blue">
                  <svg viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm.5 7.5h-1v-4h1v4zm0-5.5h-1V2h1v1z" />
                  </svg>
                  {totalLectures} Lectures
                </span>
                <span className="sd-chip sd-chip-green">
                  <svg viewBox="0 0 12 12" fill="currentColor">
                    <path d="M10.5 2.5l-6 6-2.5-2.5-1 1 3.5 3.5 7-7-1-1z" />
                  </svg>
                  {completedCount} Completed
                </span>
                <span className="sd-chip sd-chip-purple">
                  <svg viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 3.5 9l1-3L2 4h3.5z" />
                  </svg>
                  Top 10%
                </span>
              </div>
            </div>

            <div className="sd-hero-right">
              <div className="sd-ring-wrap">
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="7" />
                  <circle
                    cx="45" cy="45" r="36"
                    fill="none"
                    stroke="url(#sdRingGrad)"
                    strokeWidth="7"
                    strokeDasharray="226.2"
                    strokeDashoffset={226.2 - (226.2 * (overallPercent ?? 0)) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
                  />
                  <defs>
                    <linearGradient id="sdRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="sd-ring-label">
                  <span>{overallPercent ?? 0}%</span>
                  <span>overall</span>
                </div>
              </div>
              <p className="sd-ring-sub">Course Progress</p>
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div className="sd-stats-row">
            <div className="sd-stat-card sd-stat-blue">
              <div className="sd-stat-icon sd-si-blue"><FaVideo /></div>
              <div className="sd-stat-val">{totalLectures}</div>
              <div className="sd-stat-lbl">Total Lectures</div>
              <div className="sd-stat-delta">
                {lecturePercent === 100 ? "All watched ✓" : `${lecturePercent}% watched`}
              </div>
            </div>

            <div className="sd-stat-card sd-stat-green">
              <div className="sd-stat-icon sd-si-green"><FaCheckCircle /></div>
              <div className="sd-stat-val">{completedCount}</div>
              <div className="sd-stat-lbl">Completed</div>
              <div className="sd-stat-delta">
                {completedCount > 0 ? "Great progress!" : "Get started"}
              </div>
            </div>

            <div className="sd-stat-card sd-stat-purple">
              <div className="sd-stat-icon sd-si-purple"><FaBookOpen /></div>
              <div className="sd-stat-val">{totalMaterials}</div>
              <div className="sd-stat-lbl">Materials</div>
              <div className="sd-stat-delta sd-delta-purple">
                {materialPercent === 100 ? "All downloaded" : `${materialPercent}% done`}
              </div>
            </div>

            <div
              className="sd-stat-card sd-stat-gold"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/student/tests")}
              title="Go to MCQ Tests"
            >
              <div className="sd-stat-icon sd-si-gold"><FaClipboardList /></div>
              <div className="sd-stat-val">
                {totalTests === null ? "—" : totalTests}
              </div>
              <div className="sd-stat-lbl">MCQ Tests</div>
              <button
                className="sd-stat-action-btn"
                onClick={(e) => { e.stopPropagation(); navigate("/student/tests"); }}
              >
                View all →
              </button>
            </div>
          </div>

          {/* ── PROGRESS BARS ── */}
          <StudentProgress
            lecturePercent={lecturePercent}
            materialPercent={materialPercent}
          />

          {/* ── SEARCH + FILTER ── */}
          <div className="sd-search-bar">
            <input
              className="sd-input"
              placeholder="🔍  Search by title…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: 220 }}
            />
            <select
              className="sd-input"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ minWidth: 180 }}
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* ── CONTENT ── */}
          <div className="sd-content-section">
            <div className="sd-content-header">
              <h3>Learning Content</h3>
              <span className="sd-content-count">
                {filteredContent.length} item{filteredContent.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              /* Skeleton */
              <div className="sd-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="sd-content-card">
                    <div className="sd-skeleton sd-skel-badge" />
                    <div className="sd-skeleton sd-skel-title" />
                    <div className="sd-skeleton sd-skel-sub" />
                    <div className="sd-skeleton sd-skel-btn" />
                  </div>
                ))}
              </div>
            ) : filteredContent.length === 0 ? (
              /* Empty */
              <div className="sd-empty">
                <svg viewBox="0 0 48 48" fill="none" style={{ width: 40, opacity: 0.3, marginBottom: 8 }}>
                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p>No content matches your search.</p>
              </div>
            ) : (
              /* Content grid */
              <div className="sd-grid">
                {filteredContent.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`sd-content-card${item.type === "LECTURE" ? " cc-lecture" : " cc-material"}`}
                  >
                    {/* Type badge */}
                    <span className={`sd-cc-type${item.type === "LECTURE" ? " ct-lecture" : " ct-material"}`}>
                      {item.type === "LECTURE"
                        ? <><FaVideo style={{ fontSize: 9 }} /> Lecture</>
                        : <><FaBookOpen style={{ fontSize: 9 }} /> Material</>
                      }
                    </span>

                    {/* Title & subject */}
                    <h4 className="sd-cc-title">{item.title}</h4>
                    <p className="sd-cc-sub">{item.subject || "—"}</p>

                    {/* Duration */}
                    {item.type === "LECTURE" && item.duration && (
                      <span className="sd-cc-badge">⏱ {item.duration}</span>
                    )}

                    {/* Completed */}
                    {(item.isCompleted || item.completed) && (
                      <p className="sd-cc-done">
                        <FaCheckCircle /> Completed
                      </p>
                    )}

                    {/* Action */}
                    <button
                      className={`sd-cc-btn${item.type === "LECTURE" ? " sd-btn-blue" : " sd-btn-green"}${
                        loadingContentId === item.id ? " sd-btn-loading" : ""
                      }`}
                      disabled={loadingContentId === item.id}
                      onClick={() => handleOpenContent(item)}
                    >
                      {item.type === "LECTURE" ? (
                        <><FaVideo />{loadingContentId === item.id ? " Opening…" : " View Lecture"}</>
                      ) : (
                        <><FaBookOpen />{loadingContentId === item.id ? " Downloading…" : " Download"}</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {openEdit && profile && (
        <EditStudentProfileModal
          profile={profile}
          onClose={() => setOpenEdit(false)}
          onUpdated={refreshProfile}
        />
      )}
  {/* ── AI Floating Action Button ── */}

  <button
    type="button"
    className={`acb-fab${chatOpen ? " acb-fab--open" : ""}`}
    onClick={() => setChatOpen(prev => !prev)}
    title={chatOpen ? "Close AI Tutor" : "Ask AI Tutor"}
    aria-label={chatOpen ? "Close AI Tutor" : "Open AI Tutor"}
  >
    {chatOpen ? <FaTimes /> : <FaRobot />}

    {!chatOpen && (
      <span className="acb-fab-dot" />
    )}
  </button>

  {/* ── AI CHATBOT PANEL ── */}

  <AiChatbot
    profile={profile}
    isOpen={chatOpen}
    onClose={() => setChatOpen(false)}
  />

      {/* ── LIVE SESSIONS MODAL ── */}
      {showVideoRoom && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflow: "auto",
            position: "relative",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          }}>
            <button
              onClick={() => setShowVideoRoom(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
                zIndex: 10,
              }}
              title="Close"
            >
              ✕
            </button>
            <StudentVideoRoom />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;