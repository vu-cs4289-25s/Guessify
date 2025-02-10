import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

const BackButton = ({ to, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <button className="back-button" onClick={handleClick}>
      {"<"}
      {/* TODO - import icon for back button */}
      {/* <img src="/icons/back-arrow.png" alt="Back" /> */}
    </button>
  );
};

export default BackButton;
