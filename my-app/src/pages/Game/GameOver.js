import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./GameOver.css";

const GameOver = () => {
  const [score, setScore] = useState(null); // State to store the score
  const [correctCount, setCorrectCount] = useState(null);
  const [totalTimeSurvived, setTotalTimeSurvived] = useState(null);
  const [fastestGuessedSong, setFastestGuessedSong] = useState(null); // New state for fastest guessed song
  const [loading, setLoading] = useState(true); // State to handle loading

  useEffect(() => {
    const fetchScore = async () => {
      const gameId = localStorage.getItem("gameId");

      if (gameId) {
        const gameDocRef = doc(db, "games", gameId);
        const gameDoc = await getDoc(gameDocRef);

        if (gameDoc.exists()) {
          const gameData = gameDoc.data();
          setScore(gameData.score);
          setCorrectCount(gameData.correctCount);
          setTotalTimeSurvived(gameData.totalTimeSurvived);
          setFastestGuessedSong(gameData.fastestGuessedSong); // Fetch fastest guessed song
        } else {
          console.error("Game data not found!");
        }

        localStorage.removeItem("gameId");
      }
      setLoading(false);
    };

    fetchScore();
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
        <h2>{score !== null ? score : "N/A"}</h2>
        <div className="game-over-columns">
          <div className="game-over-col-left">
            <p className="game-over-col-title">SONGS GUESSED</p>
            <br />
            <p>{correctCount !== null ? correctCount : "N/A"}</p>
          </div>
          <div className="game-over-col-mid">
            <p className="game-over-col-title">TIME SURVIVED</p>
            <br />
            <p>
              {totalTimeSurvived !== null ? `${totalTimeSurvived}s` : "N/A"}
            </p>
          </div>
          <div className="game-over-col-right">
            <p className="game-over-col-title">FASTEST GUESS</p>
            <br />
            <p>{fastestGuessedSong !== null ? fastestGuessedSong : "N/A"}</p>
          </div>
        </div>
        <Link to="/" className="play-again-button">
          PLAY AGAIN
        </Link>
      </div>
    </div>
  );
};

export default GameOver;
