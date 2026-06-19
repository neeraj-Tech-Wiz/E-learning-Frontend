// src/components/student/progress/ProgressBar.jsx
import { useEffect, useRef, useState } from "react";

const ProgressBar = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    // ✅ animate ONLY when value actually changes
    if (prevValue.current === value) return;

    let current = prevValue.current;
    const step = value > current ? 1 : -1;

    const interval = setInterval(() => {
      current += step;
      setDisplay(current);

      if (current === value) {
        clearInterval(interval);
        prevValue.current = value;
      }
    }, 12);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="sd-progress">
      <div
        className="sd-progress__fill"
        style={{ width: `${display}%` }}
      />
    </div>
  );
};

export default ProgressBar;
