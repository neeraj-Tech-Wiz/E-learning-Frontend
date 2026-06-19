import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import {
  FaChalkboardTeacher,
  FaVideo,
  FaBook,
  FaList,
  FaUserGraduate,
  FaCalendarCheck,
  FaSignOutAlt,
  FaFileSignature,
  FaClipboardList,
  FaTasks,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import "../../styles/teacher-dashboard.css";

/* ── NAV ITEMS CONFIG ── */
const NAV_ITEMS = [
  { to: "upload/video",     icon: <FaVideo />,          label: "Upload Lecture",    id: "upload-video"     },
  { to: "upload/material",  icon: <FaBook />,           label: "Upload Material",   id: "upload-material"  },
  { to: "my-uploads",       icon: <FaList />,           label: "My Uploads",        id: "my-uploads"       },
  { to: "assignments",      icon: <FaTasks />,          label: "Assignments",       id: "assignments"      },
  { to: "progress",         icon: <FaUserGraduate />,   label: "Students Progress", id: "progress"         },
  { to: "attendance",       icon: <FaCalendarCheck />,  label: "Upload Attendance", id: "attendance"       },
  { to: "view-attendance",  icon: <FaFileSignature />,  label: "View Attendance",   id: "view-attendance"  },
  { to: "tests",            icon: <FaClipboardList />,  label: "MCQ Tests",         id: "tests"            },
  { to: "video", icon: <FaVideo />, label: "Live Sessions", id: "video" },
];

/* ── SIDEBAR ICONS (collapsed) ── */
const SIDEBAR_ICONS = [
  { to: "upload/video",    icon: <FaVideo />,         tip: "Upload Lecture",    id: "upload-video"    },
  { to: "upload/material", icon: <FaBook />,          tip: "Upload Material",   id: "upload-material" },
  { to: "my-uploads",      icon: <FaList />,          tip: "My Uploads",        id: "my-uploads"      },
  { to: "assignments",     icon: <FaTasks />,         tip: "Assignments",       id: "assignments"     },
  { to: "progress",        icon: <FaUserGraduate />,  tip: "Students Progress", id: "progress"        },
  { to: "attendance",      icon: <FaCalendarCheck />, tip: "Upload Attendance", id: "attendance"      },
  { to: "view-attendance", icon: <FaFileSignature />, tip: "View Attendance",   id: "view-attendance" },
  { to: "tests",           icon: <FaClipboardList />, tip: "MCQ Tests",         id: "tests"           },
];

/* ── CURRENT SECTION LABEL ── */
const getSectionLabel = (pathname) => {
  const item = NAV_ITEMS.find((n) => pathname.includes(n.to));
  return item?.label ?? "Dashboard";
};

/* ======================================================
   MAIN COMPONENT
====================================================== */
const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname.includes(path);
  const currentSection = getSectionLabel(location.pathname);

  return (
    <div className={`td-root${theme === "light" ? " td-light" : ""}`}>

      {/* ════════════════════════════════
          TOP NAV
      ════════════════════════════════ */}
      <nav className="td-topnav">
        <div className="td-topnav-left">
          {/* Mobile hamburger */}
          <button
            className="td-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className="td-logo">
            <div className="td-logo-icon">
              <FaChalkboardTeacher />
            </div>
            <div>
              <span className="td-logo-title">Teacher Portal</span>
              <span className="td-logo-sub">
                {user?.username || "Professor"}
              </span>
            </div>
          </div>
        </div>

        <div className="td-topnav-right">
          {/* Current section breadcrumb */}
          <span className="td-breadcrumb">{currentSection}</span>

          {/* Theme toggle */}
          <button className="td-theme-btn" onClick={toggleTheme} title="Toggle theme">
            <FaMoon className="td-theme-icon td-theme-icon-moon" />
            <FaSun  className="td-theme-icon td-theme-icon-sun"  />
          </button>

          {/* Logout */}
          <button className="td-logout-btn" onClick={logout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════
          LAYOUT  (sidebar + main)
      ════════════════════════════════ */}
      <div className="td-layout">

        {/* ── SIDEBAR ── */}
        <aside className={`td-sidebar${mobileOpen ? " td-sidebar--open" : ""}`}>
          {/* Mobile overlay */}
          {mobileOpen && (
            <div
              className="td-sidebar-overlay"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <div className="td-sidebar-inner">
            {/* Nav items — full label on mobile / expanded, icon-only on desktop */}
            <div className="td-sidebar-nav">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`td-nav-item${isActive(item.to) ? " active" : ""}`}
                  data-tip={item.label}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="td-nav-icon">{item.icon}</span>
                  <span className="td-nav-label">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Bottom: teacher info */}
            <div className="td-sidebar-footer">
              <div className="td-teacher-avatar">
                {(user?.username || "P")[0].toUpperCase()}
              </div>
              <div className="td-teacher-info">
                <span className="td-teacher-name">{user?.username || "Professor"}</span>
                <span className="td-teacher-role">Teacher</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="td-main">
          {/* Page header strip */}
          <div className="td-page-header">
            <div className="td-page-header-left">
              <h2 className="td-page-title">{currentSection}</h2>
              <span className="td-page-sub">Teacher Portal · EduVerse</span>
            </div>
            {/* Quick action pills */}
            <div className="td-quick-pills">
              {NAV_ITEMS.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`td-pill${isActive(item.to) ? " active" : ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="td-content-area">
            {location.pathname.endsWith("/teacher") ||
            location.pathname.endsWith("/teacher/") ? (
              <WelcomeScreen username={user?.username} />
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

/* ======================================================
   WELCOME SCREEN (shown when no route is selected)
====================================================== */
const WelcomeScreen = ({ username }) => (
  <div className="td-welcome">
    <div className="td-welcome-glow" />
    <div className="td-welcome-icon">
      <FaChalkboardTeacher />
    </div>
    <h3>Welcome back, {username || "Professor"} 👋</h3>
    <p>Select a section from the sidebar to get started.</p>
    <div className="td-welcome-cards">
      {[
        { icon: <FaVideo />,        label: "Upload Lecture",    to: "upload/video",    color: "blue"   },
        { icon: <FaBook />,         label: "Upload Material",   to: "upload/material", color: "green"  },
        { icon: <FaUserGraduate />, label: "Student Progress",  to: "progress",        color: "purple" },
        { icon: <FaTasks />,        label: "Assignments",       to: "assignments",     color: "orange" },
        { icon: <FaClipboardList />,label: "MCQ Tests",         to: "tests",           color: "gold"   },
      ].map((c) => (
        <Link key={c.to} to={c.to} className={`td-welcome-card td-wc-${c.color}`}>
          <span className="td-wc-icon">{c.icon}</span>
          <span className="td-wc-label">{c.label}</span>
          <span className="td-wc-arrow">→</span>
        </Link>
      ))}
    </div>
  </div>
);

export default TeacherDashboard;