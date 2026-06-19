
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/demo-landing.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* Pre-seeded demo credentials — these accounts exist in your DB */
const DEMO_ACCOUNTS = [
  {
    id: "student",
    role: "Student",
    email: "demo@student.eduverse",
    password: "demo123n",
    description: "Browse lectures, materials, live sessions, AI chatbot, and assignment submissions.",
    icon: "🎓",
    gradient: "demo-card--blue",
    redirectTo: "/student/dashboard",
  },
  {
    id: "teacher",
    role: "Teacher",
    email: "demo@teacher.eduverse",
    password: "demo123n",
    description: "Upload content, manage attendance, create MCQ tests, grade assignments with AI.",
    icon: "👨‍🏫",
    gradient: "demo-card--teal",
    redirectTo: "/teacher/dashboard",
  },
  {
    id: "admin",
    role: "Admin",
    email: "demo@admin.eduverse",
    password: "demo123n",
    description: "View all students, teachers, platform analytics, and management tools.",
    icon: "⚙️",
    gradient: "demo-card--purple",
    redirectTo: "/admin/dashboard",
  },
];

const DemoLandingPage = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(null); // which card is loading
  const [error, setError]     = useState("");

//   const handleDemoLogin = async (account) => {
//     setLoading(account.id);
//     setError("");
//     try {
//       /* Calls your existing /api/auth/login — no new backend code needed */
//       const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
//         email:    account.email,
//         password: account.password,
//       });

//       /* Store token exactly like your normal login does */
//       const token = res.data.token ?? res.data.accessToken ?? res.data;
//       localStorage.setItem("user_token", token);

//       /* Navigate to the correct dashboard */
//       navigate(account.redirectTo);
//     } catch (err) {
//       console.error(err);
//       setError(
//         "Demo login failed. Make sure demo accounts are seeded in your database. " +
//         "See the setup guide for SQL commands."
//       );
//     } finally {
//       setLoading(null);
//     }
//   };
    const handleDemoLogin = async (account) => {
        setLoading(account.id);
        setError("");

        try {
            await login(
                account.email,
                account.password
            );

            switch (account.role) {
                case "Student":
                    navigate("/student/dashboard");
                    break;

                case "Teacher":
                    navigate("/teacher/dashboard");
                    break;

                case "Admin":
                    navigate("/admin/dashboard");
                    break;

                default:
                    navigate("/login");
            }
        } catch (err) {
            console.error(err);
            setError("Demo login failed.");
        } finally {
            setLoading(null);
        }
    };

  return (
    <div className="dl-root">
      {/* ── Hero ── */}
      <div className="dl-hero">
        <div className="dl-hero-badge">Live Demo</div>
        <h1 className="dl-hero-title">EduVerse Learning Platform</h1>
        <p className="dl-hero-sub">
          A full-stack e-learning platform with AI-powered features.<br />
          Click any role below to instantly explore the platform.
        </p>

        {/* Tech stack pills */}
        <div className="dl-tech-row">
          {["React", "Spring Boot", "PostgreSQL", "Gemini AI", "Jitsi Video", "JWT Auth"].map(t => (
            <span key={t} className="dl-tech-pill">{t}</span>
          ))}
        </div>
      </div>

      {/* ── Demo role cards ── */}
      <div className="dl-cards">
        {DEMO_ACCOUNTS.map(account => (
          <div key={account.id} className={`dl-card ${account.gradient}`}>
            <div className="dl-card-icon">{account.icon}</div>
            <h2 className="dl-card-role">{account.role} View</h2>
            <p className="dl-card-desc">{account.description}</p>

            <div className="dl-card-creds">
              <span className="dl-cred-row"><span className="dl-cred-label">Email</span>{account.email}</span>
              <span className="dl-cred-row"><span className="dl-cred-label">Password</span>{account.password}</span>
            </div>

            <button
              className="dl-login-btn"
              onClick={() => handleDemoLogin(account)}
              disabled={loading === account.id}
            >
              {loading === account.id ? (
                <><div className="dl-spinner" /> Logging in…</>
              ) : (
                <>Enter as {account.role} →</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && <div className="dl-error">{error}</div>}

      {/* ── Features grid ── */}
      <div className="dl-features-section">
        <h2 className="dl-features-title">Platform Features</h2>
        <div className="dl-features-grid">
          {[
            { icon: "📹", title: "Video Lectures", desc: "Secure streaming with auto-completion tracking" },
            { icon: "📄", title: "Study Materials", desc: "PDF downloads with progress tracking" },
            { icon: "🤖", title: "AI Chatbot", desc: "Gemini-powered doubt clearing tutor" },
            { icon: "📝", title: "AI Assignment Grader", desc: "Upload PDF → get instant marks & remarks" },
            { icon: "📊", title: "MCQ Tests", desc: "Create, take, and review timed tests" },
            { icon: "📡", title: "Live Video Sessions", desc: "Jitsi-powered free video classrooms" },
            { icon: "📋", title: "Attendance System", desc: "Bulk attendance with warning emails" },
            { icon: "🎯", title: "Progress Tracking", desc: "Per-student lecture & material completion" },
          ].map(f => (
            <div key={f.title} className="dl-feature-card">
              <span className="dl-feature-icon">{f.icon}</span>
              <span className="dl-feature-title">{f.title}</span>
              <span className="dl-feature-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="dl-footer">
        <p>
          Demo accounts have full access to all features.
          Data entered during the demo may be reset periodically.
        </p>
        <a
          className="dl-github-link"
          href="https://github.com/your-repo"
          target="_blank"
          rel="noreferrer"
        >
          View Source on GitHub →
        </a>
      </div>
    </div>
  );
};

export default DemoLandingPage;