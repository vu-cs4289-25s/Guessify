import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../BackButton/BackButton";
import "./GenreSelect.css";

const GenreSelect = () => {
  return (
    <div className="genre-select-container">
      <Navbar />
      <BackButton to="/game" />

      <div className="genre-grid">
        <Link to="/game/play" className="genre-button">
          TODAY'S TOP HITS
        </Link>
        <Link to="/game/play" className="genre-button">
          POP
        </Link>
        <Link to="/game/play" className="genre-button">
          FOLK
        </Link>
        <Link to="/game/play" className="genre-button">
          HIP-HOP / RAP
        </Link>
        <Link to="/game/play" className="genre-button">
          JAZZ
        </Link>
        <Link to="/game/play" className="genre-button">
          METAL
        </Link>
        <Link to="/game/play" className="genre-button">
          ROCK
        </Link>
        <Link to="/game/play" className="genre-button">
          CLASSICAL
        </Link>
        <Link to="/game/play" className="genre-button">
          INDIE
        </Link>
        <Link to="/game/play" className="genre-button">
          COUNTRY
        </Link>
        <Link to="/game/play" className="genre-button">
          BLUES
        </Link>
        <Link to="/game/play" className="genre-button">
          K-POP
        </Link>
        <Link to="/game/play" className="genre-button">
          POP
        </Link>
        <Link to="/game/play" className="genre-button">
          FOLK
        </Link>
        <Link to="/game/play" className="genre-button">
          HIP-HOP / RAP
        </Link>
        <Link to="/game/play" className="genre-button">
          JAZZ
        </Link>
        <Link to="/game/play" className="genre-button">
          METAL
        </Link>
        <Link to="/game/play" className="genre-button">
          ROCK
        </Link>
        <Link to="/game/play" className="genre-button">
          CLASSICAL
        </Link>
        <Link to="/game/play" className="genre-button">
          INDIE
        </Link>
        <Link to="/game/play" className="genre-button">
          COUNTRY
        </Link>
        <Link to="/game/play" className="genre-button">
          BLUES
        </Link>
        <Link to="/game/play" className="genre-button">
          K-POP
        </Link>
        {/* Add more */}
      </div>
    </div>
  );
};

export default GenreSelect;
