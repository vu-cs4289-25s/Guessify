import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  doc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import { useGameContext } from "../../components/GameContext";
import { useUser } from "../../components/userContext";
import "./GenreSelect.css";

const genres = [
  "TODAY'S TOP HITS",
  "POP",
  "FOLK",
  "HIP-HOP / RAP",
  "JAZZ",
  "METAL",
  "ROCK",
  "CLASSICAL",
  "INDIE",
  "COUNTRY",
  "BLUES",
  "K-POP",
];

const GenreSelect = () => {
  const { setGameGenre } = useGameContext();
  const { userId } = useUser();
  const [bestScores, setBestScores] = useState({}); // Store best scores for each genre
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch best scores for each genre from Firestore
  useEffect(() => {
    const fetchBestScores = async () => {
      if (!userId) return;
      try {
        const scores = {};
        await Promise.all(
          genres.map(async (genre) => {
            const gamesRef = collection(db, "games");
            const q = query(
              gamesRef,
              where("userId", "==", userId),
              where("genre", "==", genre),
              orderBy("score", "desc"),
              limit(1) // Get the highest score for this genre
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              scores[genre] = querySnapshot.docs[0].data().score;
            } else {
              scores[genre] = "---"; // No score yet for this genre
            }
          })
        );
        setBestScores(scores);
        setLoading(false); // Done loading
      } catch (error) {
        console.error("Error fetching best scores:", error);
        setLoading(false); // Done loading even if error
      }
    };

    fetchBestScores();
  }, [userId]);

  // Handle genre selection
  const handleClick = (genre) => {
    setGameGenre(genre); // Set the selected genre in context
    console.log("Genre: ", genre);
  };

  return (
    <div className="genre-select-container">
      <Navbar />
      <BackButton to="/game" />

      <div className="genre-grid">
        {genres.map((genre) => (
          <Link
            to="/game/play"
            className="genre-button"
            onClick={() => handleClick(genre)}
            key={genre}
          >
            <div className="genre-text">{genre}</div>
            <div className="genre-score">
              {loading
                ? "Loading..."
                : `HIGH SCORE: ${
                    bestScores[genre] !== undefined ? bestScores[genre] : "---"
                  }`}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GenreSelect;
