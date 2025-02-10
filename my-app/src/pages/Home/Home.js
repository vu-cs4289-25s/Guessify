import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handlePlayButtonClick = () => {
    navigate("/game");
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="content">
        <img src="/logo.png" alt="Guessify Logo" className="big-logo" />
        <h2 className="subtitle">A Song Recognition Game!</h2>
        <button className="play-button" onClick={handlePlayButtonClick}>
          PLAY
        </button>
      </div>
    </div>
  );
};

export default Home;
