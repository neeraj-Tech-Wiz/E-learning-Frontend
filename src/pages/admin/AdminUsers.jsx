import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { toast } from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Simple client-side pagination
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch first page of each with large pageSize (you can tune)
        const [teachersData, studentsData] = await Promise.all([
          adminService.getTeachers(0, 100, ""),
          adminService.getStudents(0, 100, ""),
        ]);

        const teacherUsers =
          teachersData.content?.map((t) => ({
            id: `T-${t.id}`,
            rawId: t.id,
            name: t.name,
            email: t.email,
            role: "TEACHER",
          })) || [];

        const studentUsers =
          studentsData.content?.map((s) => ({
            id: `S-${s.id}`,
            rawId: s.id,
            name: s.name,
            email: s.email,
            role: "STUDENT",
            standard: s.standard,
          })) || [];

        setUsers([...teacherUsers, ...studentUsers]);
      } catch (e) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageUsers = filtered.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    // Reset to first page when search changes
    setPage(0);
  }, [search]);

  return (
    <div className="p-2 md:p-0 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">All Users</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Combined list of teachers and students.
          </p>
        </div>
        <input
          className="px-3 py-2 w-full md:w-64 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Search by name, email, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr className="text-left">
              <th className="p-3">User ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Extra</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading users...
                </td>
              </tr>
            ) : pageUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              pageUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-[11px] rounded-full ${
                        u.role === "TEACHER"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-500 dark:text-gray-400">
                    {u.role === "STUDENT" ? `Std ${u.standard}` : "Teacher"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-3 mt-2">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
        >
          Prev
        </button>
        <span className="text-xs dark:text-white">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page + 1 >= totalPages}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUsers;
