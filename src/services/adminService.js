import api from './api';

const ADMIN_URL = "/api/admin/";

const getStats = async () => {
  const res = await api.get(ADMIN_URL + "stats");
  return res.data;
};

// ========== TEACHERS ==========
const getTeachers = async (page = 0, size = 10, search = "") => {
  const res = await api.get(ADMIN_URL + "teachers", {
    params: { page, size, search },
  });
  return res.data;
};

const createTeacher = async (data) => {
  const res = await api.post(ADMIN_URL + "teachers", data);
  return res.data;
};

const updateTeacher = async (id, data) => {
  const res = await api.put(ADMIN_URL + `teachers/${id}`, data);
  return res.data;
};

const deleteTeacher = async (id) => {
  return api.delete(ADMIN_URL + `teachers/${id}`);
};

const resetTeacherPassword = async (id, newPassword) => {
  return api.post(ADMIN_URL + `teachers/${id}/reset-password`, newPassword, {
    headers: { "Content-Type": "text/plain" },
  });
};

// ========== STUDENTS ==========
const getStudents = async (page = 0, size = 10, search = "") => {
  const res = await api.get(ADMIN_URL + "students", {
    params: { page, size, search },
  });
  return res.data;
};

const createStudent = async (data) => {
  const res = await api.post(ADMIN_URL + "students", data);
  return res.data;
};

const updateStudent = async (id, data) => {
  const res = await api.put(ADMIN_URL + `students/${id}`, data);
  return res.data;
};

const deleteStudent = async (id) => {
  return api.delete(ADMIN_URL + `students/${id}`);
};

const resetStudentPassword = async (id, newPassword) => {
  return api.post(ADMIN_URL + `students/${id}/reset-password`, newPassword, {
    headers: { "Content-Type": "text/plain" },
  });
};
const getActivityLogs = async ({ page = 0, size = 10, search = "" }) => {
  const params = { page, size };
  if (search) params.search = search;

  const res = await api.get("/api/admin/activity-logs", { params });
  return res.data;
};

const adminService = {
  getStats,
  getActivityLogs,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  resetTeacherPassword,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
};

export default adminService;
