import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./HowToPlay.css";

const HowToPlay = () => {
  return (
    <div className="how-to-play-container">
      <Navbar />
      <div className="how-to-blurred-overlay">
        <h1 className="how-to-title">HOW TO PLAY</h1>
        <div className="how-to-icons-container">
          <div className="how-to-icon-box">
            <img
              src="/icons/listen.png" // TODO
              alt="Listen to the song"
              className="icon"
            />
            <p className="how-to-description">LISTEN TO THE SONG</p>
          </div>
          <div className="how-to-icon-box">
            <img
              src="/icons/guess.png" // TODO
              alt="Guess the song name"
              className="icon"
            />
            <p className="how-to-description">
              GUESS THE SONG NAME IN LIMITED TIME
            </p>
          </div>
          <div className="how-to-icon-box">
            <img
              src="/icons/leaderboard.png" // TODO
              alt="Earn points"
              className="icon"
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

export default HowToPlay;
