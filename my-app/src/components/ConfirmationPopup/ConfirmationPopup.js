import React from "react";
import "./ConfirmationPopup.css";

const ConfirmationPopup = ({ onConfirm, onCancel }) => {
  // "onConfirm" will be triggered when user wants to leave
  // "onCancel" will dismiss the popup and return to game

  return (
    <div className="confirmation-overlay" onClick={onCancel}>
      <div
        className="confirmation-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h1>ARE YOU SURE?</h1>
        <h3>The game will not be saved.</h3>

        <button className="confirmation-button" onClick={onConfirm}>
          BACK TO LOBBY
        </button>

        <p>Click anywhere to return to game</p>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
