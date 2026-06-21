import React from "react";
import "../styles/Alert.css";

export const Alert = ({ type = "info", message, onClose }) => {
  React.useEffect(() => {
    if (type !== "error") {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="alert-close">
        ✕
      </button>
    </div>
  );
};
