import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css"; // Import the CSS file for styling

const Home = () => {
  const navigate = useNavigate();

  const handlePlayClick = async () => {
    // if logged in
    // navigate("/gameType");
    // else
    const clientId = "3c75e5c902f94501ae14000ce64c5053";
    const redirectUri = "http://localhost:3000/callback";
    const scopes = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-modify-playback-state",
      "user-read-playback-state",
    ];

    // Construct the authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

    // Redirect the user to the authorization URL
    window.location.href = authUrl;
  };
  return (
    <div className="home-container">
      <Navbar />
      <div className="content">
        <img src="/logo.png" alt="Guessify Logo" className="big-logo" />
        <h2 className="subtitle">A Song Recognition Game!</h2>
        <button className="play-button" onClick={handlePlayClick}>
          PLAY
        </button>
      </div>
    </div>
  );
};

export default Home;
