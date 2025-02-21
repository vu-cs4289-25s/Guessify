import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";

const Home = (props) => {
  const [isClicked, setIsClicked] = useState(false);
  const [error, setError] = useState("");

  const handlePlayClick = async () => {
    setIsClicked(true); // Set clicked state to true
    setTimeout(async () => {
      setIsClicked(false);

      let res = await fetch("/auth/login");

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        setError(`Error: ${data.error}`); //FIXME: error message
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
