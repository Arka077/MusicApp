import React from "react";
import "../styles/LoadingSpinner.css";

export const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};
