import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  // Dark mode toggle
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const navLinkBase =
    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors";
  const navLinkInactive =
    "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";
  const navLinkActive =
    "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900";

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/admin/teachers", label: "Teachers", icon: "👨‍🏫" },
    { to: "/admin/students", label: "Students", icon: "🎓" },
    { to: "/admin/users", label: "All Users", icon: "👥" },
    { to: "/admin/attendance-heatmap", label: "Attendance Heatmap", icon: "🔥" },
    { to: "/admin/activity-logs", label: "Activity Logs", icon: "📜" }

  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="text-blue-600">eLearn</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
              ADMIN
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage teachers, students & analytics.
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  navLinkBase,
                  isActive ? navLinkActive : navLinkInactive,
                ].join(" ")
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setDark((prev) => !prev)}
            className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {dark ? "☀ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Sidebar (mobile) */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transform transition-transform md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="text-lg font-bold tracking-tight flex items-center gap-2">
            <span className="text-blue-600">eLearn</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
              ADMIN
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 text-xl"
          >
            ✕
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  navLinkBase,
                  isActive ? navLinkActive : navLinkInactive,
                ].join(" ")
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setDark((prev) => !prev)}
            className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {dark ? "☀ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-xl"
            >
              ☰
            </button>
            <div>
              <div className="text-xs uppercase text-gray-400">
                Admin Panel
              </div>
              <div className="text-sm font-semibold truncate">
                {location.pathname.replace("/admin", "") || "/dashboard"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">
                {user?.name || "Admin"}
              </span>
              <span className="text-xs text-gray-500">
                {user?.role || "ADMIN"}
              </span>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
