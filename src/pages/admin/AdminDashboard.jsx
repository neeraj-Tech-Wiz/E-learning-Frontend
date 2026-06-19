import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

// Recharts
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [userDist, setUserDist] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = 2025;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewRes, attendanceRes, usersRes] = await Promise.all([
          api.get("/api/admin/analytics/overview"),
          api.get(`/api/admin/analytics/attendance/monthly?year=${year}`),
          api.get("/api/admin/analytics/users-distribution"),
        ]);

        setOverview(overviewRes.data);

        // Format attendance months
        const formattedAttendance = attendanceRes.data.map((item) => ({
          month: new Date(year, item.month - 1).toLocaleString("default", {
            month: "short",
          }),
          presentCount: item.presentCount,
        }));

        setAttendanceData(formattedAttendance);

        setUserDist(
          usersRes.data.map((u) => ({
            name: u.role,
            value: u.count,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load admin analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-gray-500 dark:text-gray-300">
        Loading Analytics…
      </div>
    );
  }
  if (!overview) {
  return (
    <div className="p-10 text-red-500">
      Failed to load analytics
    </div>
  );
}

  const COLORS = ["#4ade80", "#60a5fa"];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold dark:text-white">
          📊 Admin Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor platform performance & usage.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Students"
          value={overview?.totalStudents ?? 0}
          color="bg-green-500"
        />
        <StatCard
          title="Total Teachers"
          value={overview?.totalTeachers ?? 0}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Users"
          value={overview?.totalUsers ?? 0}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Line Chart */}
        <ChartContainer title={`Monthly Attendance (${year})`}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <XAxis dataKey="month" stroke="#888" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="presentCount"
                stroke="#f97316"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Users Pie Chart */}
        <ChartContainer title="User Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDist}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {userDist.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;

/**************************************
 *   REUSABLE COMPONENTS
 **************************************/

const StatCard = ({ title, value, color }) => (
  <div className="p-6 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl opacity-80 ${color}`}></div>
    </div>
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow p-6">
    <h2 className="text-lg font-semibold mb-3 dark:text-white">{title}</h2>
    {children}
  </div>
);
