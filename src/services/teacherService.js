// src/services/teacherService.js
import api from './api';

const uploadFile = async (type, fileData, onProgress) => {
  const endpoint =
    type === 'video' ? '/api/lectures/upload' : '/api/materials/upload';

  const formData = new FormData();

  formData.append("title", fileData.title);
  formData.append("targetStandard", fileData.targetStandard);
  formData.append("subject", fileData.subject);
  formData.append("file", fileData.file);

  if (type === "video") {
    formData.append("duration", fileData.duration);
  }

  const token = localStorage.getItem("user_token");
  if (!token) throw new Error("Authentication required");

  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: progressEvent => {
        if (onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      }
    });

    return response.data;
  } catch (error) {
    console.error("Upload error:", error.response?.data || error);
    throw error;
  }
};

const getUploadedContent = async () => {
  const token = localStorage.getItem("user_token");
  const teacherId = localStorage.getItem("user_id");

  if (!token || !teacherId) throw new Error("Not authenticated");

  const [lectureResponse, materialResponse] = await Promise.all([
    api.get(`/api/lectures/teacher/${teacherId}`),
    api.get(`/api/materials/teacher/${teacherId}`)
  ]);

  return {
    lectures: lectureResponse.data,
    materials: materialResponse.data
  };
};

export default {
  uploadFile,
  getUploadedContent
};
