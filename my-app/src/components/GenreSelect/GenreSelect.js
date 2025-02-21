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
    setGameGenre("Genre: ", genre); // Set the selected genre in context
    console.log(genre); // For debugging
  };

  return (
    <div className="genre-select-container">
      <Navbar />
      <BackButton to="/game" />

      <div className="genre-grid">
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Today's Top Hits")}
        >
          TODAY'S TOP HITS
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Pop")}
        >
          POP
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Folk")}
        >
          FOLK
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Hip-Hop/Rap")}
        >
          HIP-HOP / RAP
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Jazz")}
        >
          JAZZ
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Metal")}
        >
          METAL
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Rock")}
        >
          ROCK
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Classical")}
        >
          CLASSICAL
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Indie")}
        >
          INDIE
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Country")}
        >
          COUNTRY
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("Blues")}
        >
          BLUES
        </Link>
        <Link
          to="/game/play"
          className="genre-button"
          onClick={() => handleClick("K-Pop")}
        >
          K-POP
        </Link>
      </div>
    </div>
  );
};

export default GenreSelect;
