import api from "./api";

// ✅ GET all students progress
const getAllProgress = () => {
  return api.get("/api/teacher/progress/all").then(res => res.data);
};

// ✅ SEARCH students by name
const searchProgress = (name) => {
  return api
    .get(`/api/teacher/progress/search?name=${encodeURIComponent(name)}`)
    .then(res => res.data);
};

// ✅ GET a single student’s full progress summary
const getStudentProgress = (studentId) => {
  return api.get(`/api/teacher/progress/student/${studentId}`).then(res => res.data);
};

const teacherProgressService = {
  getAllProgress,
  searchProgress,
  getStudentProgress,
};

export default teacherProgressService;
