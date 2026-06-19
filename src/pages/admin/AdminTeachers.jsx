import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { toast } from "react-hot-toast";

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNumber: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Fetch teachers
  const fetchTeachers = async (page = 0) => {
    setLoading(true);

    try {
      const data = await adminService.getTeachers(page, 10, search);
      setTeachers(data.content);
      setPageInfo({
        pageNumber: data.pageNumber,
        totalPages: data.totalPages,
      });
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(0);
  }, [search]);

  // Add Teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
     if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }
    try {
      await adminService.createTeacher(form);
      toast.success("Teacher added");
      setOpenAdd(false);
      setForm({ name: "", email: "", password: "" });
      fetchTeachers(pageInfo.pageNumber);
    } catch (err) {
      toast.error("Failed to add teacher");
    }
  };

  // Edit Teacher
  const handleEditTeacher = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateTeacher(editingTeacher.id, editForm);
      toast.success("Teacher updated");
      setOpenEdit(false);
      fetchTeachers(pageInfo.pageNumber);
    } catch (err) {
      toast.error("Failed to update teacher");
    }
  };

  // Delete Teacher
  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    try {
      await adminService.deleteTeacher(id);
      toast.success("Deleted successfully");
      fetchTeachers(pageInfo.pageNumber);
    } catch (err) {
      toast.error("Failed to delete teacher");
    }
  };

  // Reset Password
  const handleResetPassword = async (id) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;

    try {
      await adminService.resetTeacherPassword(id, newPassword);
      toast.success("Password reset");
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Teachers</h1>
        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow"
        >
          + Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="px-3 py-2 w-full md:w-1/3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Search teacher name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map((t) => (
                <tr
                  key={t.id}
                  className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3">{t.id}</td>
                  <td className="p-3">{t.name}</td>
                  <td className="p-3">{t.email}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingTeacher(t);
                        setEditForm({ name: t.name, email: t.email });
                        setOpenEdit(true);
                      }}
                      className="px-3 py-1 rounded-lg border dark:border-gray-600 dark:text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleResetPassword(t.id)}
                      className="px-3 py-1 rounded-lg border dark:border-gray-600 text-yellow-600 dark:text-yellow-400"
                    >
                      Reset PW
                    </button>

                    <button
                      onClick={() => handleDeleteTeacher(t.id)}
                      className="px-3 py-1 rounded-lg border border-red-500 text-red-600 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-3 mt-4">
        <button
          onClick={() => fetchTeachers(pageInfo.pageNumber - 1)}
          disabled={pageInfo.pageNumber === 0}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
        >
          Prev
        </button>

        <span className="dark:text-white">
          Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages || 1}
        </span>

        <button
          onClick={() => fetchTeachers(pageInfo.pageNumber + 1)}
          disabled={pageInfo.pageNumber + 1 >= pageInfo.totalPages}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
        >
          Next
        </button>
      </div>

      {/* Add Modal */}
      {openAdd && (
        <Modal title="Add Teacher" onClose={() => setOpenAdd(false)}>
          <form className="space-y-3" onSubmit={handleAddTeacher}>
            <InputField
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <InputField
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <InputField
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />

            <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl">
              Save
            </button>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {openEdit && (
        <Modal title="Edit Teacher" onClose={() => setOpenEdit(false)}>
          <form className="space-y-3" onSubmit={handleEditTeacher}>
            <InputField
              label="Name"
              value={editForm.name}
              onChange={(v) => setEditForm({ ...editForm, name: v })}
            />
            <InputField
              label="Email"
              value={editForm.email}
              onChange={(v) => setEditForm({ ...editForm, email: v })}
            />

            <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl">
              Update
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminTeachers;

/*****************************************
 * Reusable Modal Component
 *****************************************/
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
        <button onClick={onClose} className="text-gray-600 dark:text-gray-300">
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

/*****************************************
 * Input Field Component
 *****************************************/
const InputField = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block mb-1 dark:text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-xl dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  </div>
);
