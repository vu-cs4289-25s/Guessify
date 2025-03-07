import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./GameOver.css";

const GameOver = () => {
  const [score, setScore] = useState(null); // State to store the score
  const [loading, setLoading] = useState(true); // State to handle loading

  useEffect(() => {
    const fetchScore = async () => {
      const gameId = localStorage.getItem("gameId"); // Retrieve gameId from localStorage

      if (gameId) {
        const gameDocRef = doc(db, "games", gameId); // Reference to the game document
        const gameDoc = await getDoc(gameDocRef); // Fetch the game document

        if (gameDoc.exists()) {
          const gameData = gameDoc.data(); // Get game data
          setScore(gameData.score); // Set score in state
        } else {
          console.error("Game data not found!");
        }

        localStorage.removeItem("gameId"); // Clear gameId from localStorage
      }
      setLoading(false); // Stop loading
    };

    fetchScore(); // Call the function to fetch score
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Show loading message while fetching
  }

  return (
    <div className="game-over-container">
      <Navbar />

      <div className="game-over-points-overlay">
        <h1 className="game-over-title">GAME OVER</h1>
        <h2 className="game-over-sub-title">SCORE</h2>
        <h2>{score !== null ? score : "N/A"}</h2>{" "}
        <div className="game-over-columns">
          <div className="game-over-col-left">
            <p className="game-over-col-title">SONGS GUESSED</p>
            <br />
            <p>NUM</p>
          </div>
          <div className="game-over-col-mid">
            <p className="game-over-col-title">TIME SURVIVED</p>
            <br />
            <p>TIME</p>
          </div>
          <div className="game-over-col-right">
            <p className="game-over-col-title">FASTEST GUESS</p>
            <br />
            <p>{score !== null ? score : "N/A"}</p>{" "}
            {/* Display the score here */}
          </div>
        </div>
        {/* <h2 className="game-over-points-text">
          WELL PLAYED! CHECK THE LEADERBOARD FOR MORE.
        </h2> */}
        <Link to="/" className="play-again-button">
          PLAY AGAIN
        </Link>
      </div>
    </div>
  );
};

export default GameOver;
