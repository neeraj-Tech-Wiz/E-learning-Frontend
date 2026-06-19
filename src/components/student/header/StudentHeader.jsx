import StudentAvatar from "./StudentAvatar";

const StudentHeader = ({ profile, onSettings, onLogout }) => {
  if (!profile) return null;

  return (
    <div className="sd-header">
      <div className="flex items-center gap-4">
        <StudentAvatar
          name={profile.name}
          photo={profile.profilePhotoUrl}
        />

        <div>
          <h1 className="sd-title">Welcome, {profile.name}</h1>
          <p style={{ opacity: 0.7 }}>
            Standard {profile.standard}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="sd-btn" onClick={onSettings}>
          Settings
        </button>
        <button className="sd-btn sd-btn--danger" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default StudentHeader;
