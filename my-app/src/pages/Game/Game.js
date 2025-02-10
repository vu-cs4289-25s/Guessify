import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import WebPlayback from "../../components/WebPlayback/WebPlayback";
import axios from "axios";

const Game = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("token");

    if (accessToken) {
      setToken(accessToken); // Store token in state or context
    }
  });

  return (
    <div>
      <Navbar />
      <div className="overlay-panel">
        <h2 className="overlay-title">Game</h2>
        <WebPlayback token={token} />
      </div>
    </div>
  );
};

export default Game;
