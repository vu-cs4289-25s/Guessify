import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css"; // Import the CSS file for styling

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <div className="content">
        <img src="/logo.png" alt="Guessify Logo" className="big-logo" />
        <h2 className="subtitle">A Song Recognition Game!</h2>
        <button className="play-button">PLAY</button>
      </div>
    </div>
  );
};

export default Home;
