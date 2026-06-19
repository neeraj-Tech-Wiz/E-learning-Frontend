import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { toast } from "react-hot-toast";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNumber: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", standard: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", standard: "" });

  const [editingStudent, setEditingStudent] = useState(null);

  // Fetch Students
  const fetchStudents = async (page = 0) => {
    setLoading(true);

    try {
      const data = await adminService.getStudents(page, 10, search);
      setStudents(data.content);
      setPageInfo({
        pageNumber: data.pageNumber,
        totalPages: data.totalPages,
      });
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(0);
  }, [search]);

  // Add Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
     if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }
    try {
      await adminService.createStudent(form);
      toast.success("Student added");
      setOpenAdd(false);
      setForm({ name: "", email: "", password: "", standard: "" });
      fetchStudents(pageInfo.pageNumber);
    } catch (err) {
      toast.error("Failed to add student");
    }
  };

  // Edit Student
  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateStudent(editingStudent.id, editForm);
      toast.success("Student updated");
      setOpenEdit(false);
      fetchStudents(pageInfo.pageNumber);
    } catch (err) {
      toast.error("Failed to update student");
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await adminService.deleteStudent(id);
      toast.success("Student deleted");
      fetchStudents(pageInfo.pageNumber);
    } catch (err) {
      toast.error("Failed to delete student");
    }
  };

  // Reset Password
  const handleResetPassword = async (id) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;

    try {
      await adminService.resetStudentPassword(id, newPassword);
      toast.success("Password reset");
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Students</h1>
        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow"
        >
          + Add Student
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="px-3 py-2 w-full md:w-1/3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Search student name..."
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
              <th className="p-3">Standard</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr
                  key={s.id}
                  className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3">{s.id}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.standard}</td>

                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingStudent(s);
                        setEditForm({
                          name: s.name,
                          email: s.email,
                          standard: s.standard,
                        });
                        setOpenEdit(true);
                      }}
                      className="px-3 py-1 rounded-lg border dark:border-gray-600 dark:text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleResetPassword(s.id)}
                      className="px-3 py-1 rounded-lg border text-yellow-600 dark:text-yellow-400 dark:border-gray-600"
                    >
                      Reset PW
                    </button>

                    <button
                      onClick={() => handleDeleteStudent(s.id)}
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
          onClick={() => fetchStudents(pageInfo.pageNumber - 1)}
          disabled={pageInfo.pageNumber === 0}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
        >
          Prev
        </button>

        <span className="dark:text-white">
          Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages || 1}
        </span>

        <button
          onClick={() => fetchStudents(pageInfo.pageNumber + 1)}
          disabled={pageInfo.pageNumber + 1 >= pageInfo.totalPages}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
        >
          Next
        </button>
      </div>

      {/* ADD STUDENT MODAL */}
      {openAdd && (
        <Modal title="Add Student" onClose={() => setOpenAdd(false)}>
          <form className="space-y-3" onSubmit={handleAddStudent}>
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

            <InputField
              label="Standard"
              value={form.standard}
              onChange={(v) => setForm({ ...form, standard: v })}
            />

            <button className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl">
              Save
            </button>
          </form>
        </Modal>
      )}

      {/* EDIT STUDENT MODAL */}
      {openEdit && (
        <Modal title="Edit Student" onClose={() => setOpenEdit(false)}>
          <form className="space-y-3" onSubmit={handleEditStudent}>
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

            <InputField
              label="Standard"
              value={editForm.standard}
              onChange={(v) => setEditForm({ ...editForm, standard: v })}
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

export default AdminStudents;

/*****************************************
 * Modal Component
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
 * InputField Component
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
