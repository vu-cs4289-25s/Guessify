import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import authenticate from "../../components/Login";
import { useUser } from "../../components/userContext";
import "./Home.css";

const Home = () => {
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  const { userId } = useUser();

  const handlePlayClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);

      // If userId exists in context, navigate directly to game
      if (userId) {
        navigate(`/game?userId=${userId}`);
      } else {
        // Otherwise, authenticate user (login)
        authenticate("game");
      }
    }, 120);
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="content">
        <img src="/logo.png" alt="Guessify Logo" className="big-logo" />
        <h2 className="subtitle">A Song Recognition Game!</h2>
        <div className="play-button-container">
          <button className="play-button" onClick={handlePlayClick}>
            {!isClicked ? (
              <>
                <img
                  className="default"
                  src="/buttons/button_rectangle_default.png"
                  alt="Play"
                />
                <img
                  className="hover"
                  src="/buttons/button_rectangle_hover.png"
                  alt="Play Hover"
                />
              </>
            ) : (
              <img
                className="clicked"
                src="/buttons/button_rectangle_onClick.png"
                alt="Play Click"
              />
            )}
            <span className={isClicked ? "clicked-text" : ""}>PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
