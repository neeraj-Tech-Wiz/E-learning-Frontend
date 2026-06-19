import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Color scale based on attendance count
const getCellColor = (count) => {
  if (count === 0) return "bg-gray-200 dark:bg-gray-700";
  if (count <= 5) return "bg-green-200";
  if (count <= 10) return "bg-green-400";
  if (count <= 20) return "bg-green-600";
  return "bg-green-800";
};

const AdminTeacherHeatmap = () => {
  const [year, setYear] = useState(2025);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/api/admin/analytics/attendance/heatmap?year=${year}`
        );
        setHeatmapData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load teacher attendance heatmap");
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [year]);

  // Transform API data into table structure
  const teachers = {};
  heatmapData.forEach((row) => {
    if (!teachers[row.teacherName]) {
      teachers[row.teacherName] = {};
    }
    teachers[row.teacherName][row.month] = row.attendanceCount;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold dark:text-white">
          🔥 Teacher Attendance Heatmap
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Visual overview of teacher activity across months
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <label className="text-gray-600 dark:text-gray-300 font-medium">
          Year:
        </label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded px-3 py-1 dark:bg-gray-800 dark:text-white"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Heatmap */}
      {loading ? (
        <div className="text-gray-500 animate-pulse">Loading heatmap…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm text-gray-600 dark:text-gray-300">
                  Teacher
                </th>
                {MONTHS.map((m) => (
                  <th
                    key={m}
                    className="p-2 text-xs text-gray-500 dark:text-gray-400"
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Object.entries(teachers).map(([teacher, months]) => (
                <tr key={teacher}>
                  <td className="p-2 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                    {teacher}
                  </td>

                  {MONTHS.map((_, idx) => {
                    const monthIndex = idx + 1;
                    const count = months[monthIndex] || 0;

                    return (
                      <td key={idx} className="p-1">
                        <div
                          title={`Attendance marked: ${count}`}
                          className={`w-8 h-8 rounded ${getCellColor(count)} cursor-pointer`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTeacherHeatmap;
