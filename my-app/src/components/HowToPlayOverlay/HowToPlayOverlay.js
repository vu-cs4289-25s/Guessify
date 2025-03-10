import React from "react";
import "./HowToPlayOverlay.css";

const HowToPlayOverlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="overlay-how-to-play-overlay-container">
      <div className="overlay-how-to-play-overlay">
        {/* <button className="overlay-close-button" onClick={onClose}>
          ✖
        </button> */}
        <h1 className="overlay-how-to-title">HOW TO PLAY</h1>
        <div className="overlay-how-to-icons-container">
          <div className="overlay-how-to-icon-box">
            <img
              src="/HTPIcons/HTP_listen.png"
              alt="Listen to the song"
              className="overlay-how-to-icon"
            />
            <p className="overlay-how-to-description">LISTEN TO THE SONG</p>
          </div>
          <div className="overlay-how-to-icon-box">
            <img
              src="/HTPIcons/HTP_guess.png"
              alt="Guess the song name"
              className="overlay-how-to-icon"
            />
            <p className="overlay-how-to-description">
              GUESS THE SONG NAME IN LIMITED TIME
            </p>
          </div>
          <div className="overlay-how-to-icon-box">
            <img
              src="/HTPIcons/HTP_point.png"
              alt="Earn points"
              className="overlay-how-to-icon"
            />
            <p className="overlay-how-to-description">
              EARN POINTS & LAND ON LEADERBOARD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayOverlay;
