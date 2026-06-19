import "../../../styles/studentProgress.css";

const StudentProgress = ({ lecturePercent = 0, materialPercent = 0 }) => {
  return (
    <div className="sp-wrapper">
      {/* Lectures Progress */}
      <div className="sp-card">
        <div className="sp-card-bg sp-card-bg--blue" />

        <div className="sp-top">
          <div className="sp-icon sp-icon--blue">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <div className="sp-meta">
            <span className="sp-label">Lectures Progress</span>
            <span className="sp-pct sp-pct--blue">{lecturePercent}%</span>
          </div>
        </div>

        <div className="sp-bar-track">
          <div
            className="sp-bar-fill sp-bar-fill--blue"
            style={{ width: `${lecturePercent}%` }}
          />
        </div>

        <div className="sp-footer">
          <span className="sp-sub">
            {lecturePercent === 100
              ? "🎉 All lectures completed!"
              : `${Math.round(lecturePercent)}% of lectures watched`}
          </span>
          <span className="sp-badge sp-badge--blue">
            {lecturePercent === 100 ? "Complete" : "In Progress"}
          </span>
        </div>
      </div>

      {/* Materials Progress */}
      <div className="sp-card">
        <div className="sp-card-bg sp-card-bg--purple" />

        <div className="sp-top">
          <div className="sp-icon sp-icon--purple">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <div className="sp-meta">
            <span className="sp-label">Materials Progress</span>
            <span className="sp-pct sp-pct--purple">{materialPercent}%</span>
          </div>
        </div>

        <div className="sp-bar-track">
          <div
            className="sp-bar-fill sp-bar-fill--purple"
            style={{ width: `${materialPercent}%` }}
          />
        </div>

        <div className="sp-footer">
          <span className="sp-sub">
            {materialPercent === 100
              ? "🎉 All materials downloaded!"
              : `${Math.round(materialPercent)}% of materials accessed`}
          </span>
          <span className="sp-badge sp-badge--purple">
            {materialPercent === 100 ? "Complete" : "In Progress"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;