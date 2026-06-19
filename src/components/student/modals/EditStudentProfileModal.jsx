// src/pages/student/EditStudentProfileModal.jsx
import React, { useState } from "react";
import api from "../../../services/api";
import { toast } from "react-hot-toast";

const EditStudentProfileModal = ({ profile, onClose, onUpdated }) => {
  const [address, setAddress] = useState(profile.address || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!address.trim()) {
      toast.error("Address cannot be empty");
      return;
    }

    try {
      setSaving(true);

      await api.put("/api/student/profile", {
        email: profile.email,          // ✅ always valid
        address: address.trim(),       // ✅ validated
      });

      toast.success("Profile updated");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* overlay */}
      <div className="sd-overlay" onClick={onClose} />

      {/* modal */}
      <div className="sd-settings sd-settings--animate">
        <div className="sd-settings__header">
          <h3>Edit Profile</h3>
        </div>

        <div className="sd-settings__content">
          <div className="sd-form">

            {/* EMAIL (READ ONLY) */}
            <div className="sd-field">
              <label className="sd-label">Email</label>
              <input
                className="sd-input"
                value={profile.email}
                disabled
              />
            </div>

            {/* ADDRESS */}
            <div className="sd-field">
              <label className="sd-label">Address</label>
              <textarea
                className="sd-input"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
              />
            </div>

            {/* ACTIONS (ONLY ONE SET) */}
            <div className="sd-actions">
              <button
                className="sd-btn"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="sd-btn sd-btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EditStudentProfileModal;
