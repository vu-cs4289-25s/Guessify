import React from "react";
import "./HowToPlayOverlay.css";

const HowToPlayOverlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="how-to-play-overlay-container">
      <div className="how-to-play-overlay">
        {/* <button className="close-button" onClick={onClose}>
          ✖
        </button> */}
        <h1 className="how-to-title">HOW TO PLAY</h1>
        <div className="how-to-icons-container">
          <div className="how-to-icon-box">
            <img
              src="/HTPIcons/HTP_listen.png"
              alt="Listen to the song"
              className="how-to-icon"
            />
            <p className="how-to-description">LISTEN TO THE SONG</p>
          </div>
          <div className="how-to-icon-box">
            <img
              src="/HTPIcons/HTP_guess.png"
              alt="Guess the song name"
              className="how-to-icon"
            />
            <p className="how-to-description">
              GUESS THE SONG NAME IN LIMITED TIME
            </p>
          </div>
          <div className="how-to-icon-box">
            <img
              src="/HTPIcons/HTP_point.png"
              alt="Earn points"
              className="how-to-icon"
            />
            <p className="how-to-description">
              EARN POINTS & LAND ON LEADERBOARD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayOverlay;
