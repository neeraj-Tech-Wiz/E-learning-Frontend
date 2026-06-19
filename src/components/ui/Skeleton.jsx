const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gray-700/40 rounded ${className}`}
    />
  );
};

export default Skeleton;
