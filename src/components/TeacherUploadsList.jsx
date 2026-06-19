import React, { useEffect, useState } from "react";
import teacherService from "../services/teacherService";
import { FaVideo, FaBookOpen } from "react-icons/fa";

const TeacherUploadsList = () => {
  const [content, setContent] = useState({ lectures: [], materials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      const teacherId = localStorage.getItem("user_id"); 
      if (!teacherId) return;

      const result = await teacherService.getUploadedContent(teacherId);
      setContent(result);
    } catch (err) {
      console.error("Failed to load uploads:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "white" }}>📁 My Uploads</h2>

      <h3 style={{ color: "white" }}>Video Lectures ({content.lectures.length})</h3>
      {content.lectures.map((lec) => (
        <div key={lec.id} className="upload-card">
          <FaVideo color="skyblue" size={20} /> {lec.title}
        </div>
      ))}

      <h3 style={{ color: "white", marginTop: "20px" }}>
        📚 Study Materials ({content.materials.length})
      </h3>
      {content.materials.map((mat) => (
        <div key={mat.id} className="upload-card">
          <FaBookOpen color="lightgreen" size={20} /> {mat.title}
        </div>
      ))}
    </div>
  );
};

export default TeacherUploadsList;
