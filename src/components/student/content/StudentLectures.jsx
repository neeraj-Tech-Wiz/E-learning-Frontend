const StudentLectures = ({ lectures, loading, onOpen }) => {
  if (loading) return null;

  return (
    <div className="sd-grid">
      {lectures.map(item => (
        <ContentCard
          key={item.id}
          item={item}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};
export default StudentLectures;