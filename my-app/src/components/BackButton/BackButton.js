import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

const BackButton = ({ to }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(to);
  };

  return (
    <button className="back-button" onClick={handleGoBack}>
      {"<"}
      {/* TODO - import icon for back button */}
      {/* <img src="/icons/back-arrow.png" alt="Back" /> */}
    </button>
  );
};

export default BackButton;
