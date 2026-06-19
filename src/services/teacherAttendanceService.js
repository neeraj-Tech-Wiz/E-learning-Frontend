import api from "./api";

const fetchStudentsForTeacher = async (teacherStandard = null) => {
  try {
    // Preferred: teacher-specific endpoint (requires teacher auth)
    const resp = await api.get("/api/teacher/students");
    return resp.data; // expect array of { id, name, ... }
  } catch (err) {
    // fallback to standard endpoint if we have standard
    if (teacherStandard) {
      const resp2 = await api.get(`/api/students/class/${teacherStandard}`);
      return resp2.data;
    }
    // if no fallback available -> rethrow original error for caller to handle
    throw err;
  }
};

const submitBulkAttendance = async (payload) => {
  // payload: { date: "YYYY-MM-DD", statuses: [{ studentId, present }, ...] }
  const resp = await api.post("/api/attendance/bulk", payload);
  return resp.data;
};

export default {
  fetchStudentsForTeacher,
  submitBulkAttendance,
};
