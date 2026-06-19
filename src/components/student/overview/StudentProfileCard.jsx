// src/pages/student/StudentProfileCard.jsx
import React from "react";

const StudentProfileCard = ({ profile, onEdit }) => {
  if (!profile) return null;

  return (
    <div className="sd-card">
      <div className="sd-line">
        <h3>My Profile</h3>
        <button className="sd-btn sd-btn--primary" onClick={onEdit}>
          Edit
        </button>
      </div>

      <p><b>Name:</b> {profile.name}</p>
      <p><b>Standard:</b> {profile.standard}</p>
      <p><b>Email:</b> {profile.email}</p>
      <p><b>Address:</b> {profile.address || "-"}</p>
    </div>
  );
};

export default StudentProfileCard;
