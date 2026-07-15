// src/App.jsx

import React from "react";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,

} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./components/Login";

// Dashboards
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";

// Admin
import AdminRoute from "./pages/admin/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTeacherHeatmap from "./pages/admin/AdminTeacherHeatmap";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";

// Student
import { StudentDashboardProvider } from "./context/StudentDashboardContext";
import QuizPage from "./pages/QuizPage";

// Teacher
import UploadForm from "./components/UploadForm";
import TeacherUploadsList from "./components/TeacherUploadsList";
import TeacherProgress from "./pages/teacher/TeacherProgress";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import ViewAttendance from "./pages/teacher/ViewAttendance";
import TeacherTestsPage from "./pages/teacher/TeacherTestsPage";
import TeacherVideoRoom from "./pages/teacher/TeacherVideoRoom";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";

// Student
import StudentAssignments from "./pages/StudentAssignments";

import DemoLandingPage from "./pages/DemoLandingPage";

/* ======================================
   Small helper while auth is restoring
====================================== */
const AuthLoadingScreen = () => (
  <div style={{ height: "100vh", background: "var(--bg)" }} />
);

/* ======================================
   Generic Protected Route
====================================== */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/* ======================================
   App Routes
====================================== */
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  const getDashboardPath = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "ROLE_STUDENT":
        return "/student/dashboard";
      case "ROLE_TEACHER":
        return "/teacher/dashboard";
      case "ROLE_ADMIN":
        return "/admin/dashboard";
      default:
        return "/demo";
    }
  };

  return (
    <Routes>
      {/* LOGIN */}

       {/* ── PUBLIC: Demo landing page ── */}
        <Route path="/demo" element={<DemoLandingPage />} />
        <Route path="/" element={<Navigate to="/demo" replace />} />

      <Route
        path="/login"
        element={
          user ? <Navigate to={getDashboardPath()} replace /> : <Login />
        }
      />

      {/* ROOT */}
      <Route
        path="/"
        element={<Navigate to={getDashboardPath()} replace />}
      />

      {/* ========== STUDENT AREA ========== */}
      <Route element={<ProtectedRoute allowedRoles={["ROLE_STUDENT"]} />}>
        <Route
          element={
            <StudentDashboardProvider>
              <Outlet />
            </StudentDashboardProvider>
          }
        >
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/tests" element={<QuizPage />} />
        </Route>
      </Route>
      
      {/* ========== TEACHER AREA ========== */}
      <Route element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]} />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />}>
          <Route
            index
            element={
              <div className="text-gray-400">
                Select an action from the navigation bar.
              </div>
            }
          />
          <Route path="upload/video" element={<UploadForm fileType="video" />} />
          <Route
            path="upload/material"
            element={<UploadForm fileType="material" />}
          />
          <Route path="my-uploads" element={<TeacherUploadsList />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="progress" element={<TeacherProgress />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="view-attendance" element={<ViewAttendance />} />
          <Route path="tests" element={<TeacherTestsPage />} />
          <Route path="video" element={<TeacherVideoRoom />} />
        </Route>
      </Route>

      {/* ========== ADMIN AREA ========== */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="attendance-heatmap" element={<AdminTeacherHeatmap />} />
        <Route path="activity-logs" element={<AdminActivityLogs />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/* ======================================
   Main App
====================================== */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>

     <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: 'var(--sd-bg-elevated, #1e293b)', // fallback if var not defined
        color: 'var(--sd-text, #f1f5f9)',
        border: '1px solid var(--sd-border, #334155)',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        fontSize: '14px',
      },
      success: {
        iconTheme: {
          primary: '#7c3aed', // matches your indigo-purple palette
          secondary: '#fff',
        },
      },
      error: {
        iconTheme: {
          primary: '#dc2626',
          secondary: '#fff',
        },
      },
    }}
  />
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
