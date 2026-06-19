import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import contentService from "../services/contentService";
import api from "../services/api";
import { toast } from "react-hot-toast";

const StudentDashboardContext = createContext();

export const StudentDashboardProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [content, setContent] = useState({ lectures: [], materials: [] });

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD DASHBOARD (ONLY ONCE) ================= */
const loadDashboard = useCallback(async () => {
  if (loaded || loading) return;

  try {
    setLoading(true);

    const [profileRes, attendanceRes, contentRes] = await Promise.all([
      api.get("/api/student/profile"),
      api.get("/api/student/attendance/current"),
      contentService.getStudentContentAndProgress(""),
    ]);

    const normalizeLectures = (arr = []) =>
      arr.map((i) => ({
        ...i,
        id: i.id,
        type: "LECTURE",
        isCompleted: i.completed ?? false,
      }));

    const normalizeMaterials = (arr = []) =>
      arr.map((i) => ({
        ...i,
        id: i.id,
        type: "MATERIAL",
        isCompleted: i.completed ?? false,
      }));

    const profileData = profileRes.data;

    setProfile({
      ...profileData,
      profilePhoto:
        profileData.profilePhoto?.startsWith("http")
          ? profileData.profilePhoto.split("/").pop()
          : profileData.profilePhoto,
    });

    setAttendance(attendanceRes.data);
    setContent({
      lectures: normalizeLectures(contentRes.lectures),
      materials: normalizeMaterials(contentRes.materials),
    });

    setLoaded(true);
  } catch (err) {
    console.error(err);

    if (err.response?.status === 401) {
      localStorage.removeItem("user_token");
      window.location.href = "/demo";
      return;
    }

    toast.error("Failed to load dashboard");

    setLoaded(true); // ✅ VERY IMPORTANT
  } finally {
    setLoading(false); // ✅ FIXED
  }
}, [loaded, loading]);

  /* ================= MARK COMPLETE ================= */
  const markContentComplete = async (id, type) => {
    await contentService.markComplete(id, type);

    setContent((prev) => ({
      lectures: prev.lectures.map((l) =>
        l.id === id ? { ...l, isCompleted: true } : l
      ),
      materials: prev.materials.map((m) =>
        m.id === id ? { ...m, isCompleted: true } : m
      ),
    }));
  };

  /* ================= REFRESH PROFILE ================= */
  const refreshProfile = async () => {
    const res = await api.get("/api/student/profile");
    setProfile(res.data);
  };

  const value = useMemo(() => ({
    profile,
    attendance,
    content,
    loaded,
    loading,
    loadDashboard,
    markContentComplete,
    refreshProfile,
  }), [
    profile,
    attendance,
    content,
    loaded,
    loading,
    loadDashboard,
  ]);

  return (
    <StudentDashboardContext.Provider value={value}>
      {children}
    </StudentDashboardContext.Provider>
  );
};

export const useStudentDashboard = () =>
  useContext(StudentDashboardContext);
