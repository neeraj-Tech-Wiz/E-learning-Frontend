// src/services/testService.js
import api from "./api";
import { toast } from "react-hot-toast";

/* ============================================================
   TEACHER: CREATE TEST
   ============================================================ */
export const createTest = async (payload) => {
  try {
    const res = await api.post("/api/tests", payload);
    toast.success("Test created successfully!");
    return res;
  } catch (err) {
    toast.error("Failed to create test");
    throw err;
  }
};

/* ============================================================
   GET ALL TESTS  (Student + Teacher)
   ============================================================ */
  export const getStudentTests = () =>
  api.get("/api/tests/student/my");

/* ============================================================
   TEACHER: GET TESTS CREATED BY HIM/HER
   ============================================================ */

export const getTeacherTests = () =>
  api.get("/api/tests/teacher/my");

/* ============================================================
   STUDENT: START TEST
   ============================================================ */
export const startTest = async (testId) => {
  try {
    return await api.get(`/api/tests/${testId}/start`);
  } catch (err) {
    if (err?.response?.status === 403) {
      toast.error("You have already attempted this test!");
    } else {
      toast.error("Cannot start test");
    }
    throw err;
  }
};

/* ============================================================
   STUDENT: SUBMIT TEST
   ============================================================ */
export const submitTest = async (testId, submission) => {
  try {
    return await api.post(`/api/tests/${testId}/submit`, submission);
  } catch (err) {
    toast.error("Error submitting test");
    throw err;
  }
};

/* ============================================================
   STUDENT: GET RESULT
   (Auto-handles score-only OR review-enabled)
   ============================================================ */
export const getStudentResult = async (testId) => {
  try {
    return await api.get(`/api/tests/${testId}/result`);
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new Error("No attempt found");
    }
    toast.error("Unable to fetch test result");
    throw err;
  }
};

/* ============================================================
   TEACHER: VIEW SUBMISSIONS
   ============================================================ */
export const getTestSubmissions = async (testId) => {
  try {
    return await api.get(`/api/tests/${testId}/submissions`);
  } catch (err) {
    toast.error("Failed to load submissions");
    throw err;
  }
};

/* ============================================================
   TEACHER: ENABLE REVIEW
   ============================================================ */
export const enableReview = async (testId) => {
  try {
    const res = await api.patch(`/api/tests/${testId}/enable-review`);
    toast.success("Review enabled for this test");
    return res;
  } catch (err) {
    toast.error("Error enabling review");
    throw err;
  }
};

/* ============================================================
   TEACHER: DISABLE REVIEW
   ============================================================ */
export const disableReview = async (testId) => {
  try {
    const res = await api.patch(`/api/tests/${testId}/disable-review`);
    toast.success("Review disabled for this test");
    return res;
  } catch (err) {
    toast.error("Error disabling review");
    throw err;
  }
};
