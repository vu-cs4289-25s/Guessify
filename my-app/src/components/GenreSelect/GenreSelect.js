import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import { useGameContext } from "../../components/GameContext";
import "./GenreSelect.css";

const GenreSelect = () => {
  const { setGameGenre } = useGameContext();

  // Handle genre selection
  const handleClick = (genre) => {
    setGameGenre(genre); // Set the selected genre in context
    console.log("Genre: ", genre); // For debugging
  };

  return (
    <div className="genre-select-container">
      <Navbar />
      <BackButton to="/game" />

      <div className="genre-grid">
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("TODAY'S TOP HITS")}
        >
          TODAY'S TOP HITS
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("POP")}
        >
          POP
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("FOLK")}
        >
          FOLK
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("HIP-HOP / RAP")}
        >
          HIP-HOP / RAP
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("JAZZ")}
        >
          JAZZ
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("METAL")}
        >
          METAL
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("ROCK")}
        >
          ROCK
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("CLASSICAL")}
        >
          CLASSICAL
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("INDIE")}
        >
          INDIE
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("COUNTRY")}
        >
          COUNTRY
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("BLUES")}
        >
          BLUES
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("K-POP")}
        >
          K-POP
        </Link>
      </div>
    </div>
  );
};

export default GenreSelect;
