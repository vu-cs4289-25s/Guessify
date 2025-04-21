import React from "react";
import "./ConfirmationPopup.css";

const ConfirmationPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="confirmation-overlay" onClick={onCancel}>
      <div
        className="confirmation-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h1>ARE YOU SURE?</h1>
        <h3>The game will not be saved.</h3>

        {/* ✅ Button now says "EXIT GAME" instead of "BACK TO LOBBY" */}
        <button className="confirmation-button" onClick={onConfirm}>
          EXIT GAME
        </button>

        <p>Click anywhere to return to game</p>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
