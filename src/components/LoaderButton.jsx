import React from "react";

const LoaderButton = ({ loading, children, className = "", ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`relative inline-flex items-center justify-center ${className} ${
      loading ? "opacity-80 cursor-not-allowed" : ""
    }`}
  >
    {loading ? (
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    ) : (
      children
    )}
  </button>
);

export default LoaderButton;
