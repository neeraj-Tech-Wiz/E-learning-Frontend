const StudentMaterials = ({ materials, loading, onOpen }) => {
  if (loading) return null;

  return (
    <div className="sd-grid">
      {materials.map(item => (
        <ContentCard
          key={item.id}      // now SAFE
          item={item}
          onOpen={onOpen}    // single source of truth
        />
      ))}
    </div>
  );
};
export default StudentMaterials;