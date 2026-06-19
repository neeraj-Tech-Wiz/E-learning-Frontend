const StudentAttendanceCard = ({ attendance }) => {
  if (!attendance) return null;

  return (
    <div className="sd-card">
      <h3>Attendance (This Month)</h3>
      <p>Month: {attendance.month}</p>
      <p>Days Present: {attendance.presentDays}</p>
      <p>Total Days: {attendance.totalDays}</p>
      <p style={{ color: attendance.percentage < 75 ? "red" : "green" }}>
        Percentage: {attendance.percentage}%
      </p>
    </div>
  );
};

export default StudentAttendanceCard;
