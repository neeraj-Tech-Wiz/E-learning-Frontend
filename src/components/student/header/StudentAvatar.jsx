import React, { useRef, useState } from "react";
import api from "../../../services/api";
import { BASE_URL } from "../../../services/api";
import { toast } from "react-hot-toast";

const StudentAvatar = ({ name, photo, onUpdated }) => {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    photo && !photo.startsWith("http")
      ? `${BASE_URL}/uploads/profile/${photo}`
      : photo;

  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "S";

  /* ===============================
     UPLOAD HANDLER
  =============================== */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post("/api/student/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile photo updated");
      onUpdated?.(); // reload profile
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     REMOVE PHOTO (fallback to letter)
  =============================== */
  const handleRemovePhoto = async () => {
    try {
      const formData = new FormData();
      formData.append("file", new Blob([])); // empty file

      await api.post("/api/student/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile photo removed");

      // refresh profile
      const res = await api.get("/api/student/profile");
      onUpdated(res.data);

    } catch (err) {
      toast.error("Failed to remove photo");
    }
  };

  return (
    <div className="relative group cursor-pointer">
      {/* IMAGE OR LETTER */}
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt="Profile"
          className="w-14 h-14 rounded-full object-cover border border-gray-600"
          onError={() => setImageError(true)}
          onClick={() => fileRef.current.click()}
        />
      ) : (
        <div
          onClick={() => fileRef.current.click()}
          className="w-14 h-14 rounded-full bg-blue-600 text-white
                     flex items-center justify-center text-xl font-bold"
        >
          {letter}
        </div>
      )}

      {/* HOVER ACTIONS */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2
                      hidden group-hover:flex gap-1">
        <button
          className="text-xs px-2 py-1 rounded bg-gray-700 text-white"
          onClick={() => fileRef.current.click()}
        >
          Change
        </button>

        {imageUrl && (
          <button
            className="text-xs px-2 py-1 rounded bg-red-600 text-white"
            onClick={handleRemovePhoto}
          >
            Remove
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileRef}
        hidden
        accept="image/*"
        onChange={handleFileChange}
      />

      {loading && (
        <div className="absolute inset-0 rounded-full bg-black/40
                        flex items-center justify-center text-xs">
          …
        </div>
      )}
    </div>
  );
};

export default StudentAvatar;
