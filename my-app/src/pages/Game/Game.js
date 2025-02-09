import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
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

  const playSong = async () => {
    if (!token) return alert("Please authenticate with Spotify first!");

    let songUri = "spotify:track:07UFnnK3uPIuKv5Rs9TmXl";

    try {
      await axios.put(
        "https://api.spotify.com/v1/me/player/play",
        { uris: [songUri] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error playing song:", error);
      console.log(error.response?.data); // Log the response from the error
      console.log(error.response?.status); // Log the status code
      console.log(error.response?.headers); // Log the headers (if useful)
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Game</h1>
      <button
        onClick={playSong}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Play Song
      </button>
    </div>
  );
};

export default Game;
