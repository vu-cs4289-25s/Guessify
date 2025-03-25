import React from "react";
import "./GuessesOverlay.css";

const GuessesOverlay = ({ guesses, currentUserId }) => {
  if (!guesses || guesses.length === 0) return null;

  return (
    <div className="player-guesses-overlay-container">
      <div className="player-guesses-overlay">
        <h3 className="guesses-title">Player Guesses</h3>
        <ul className="guesses-list">
          {guesses.map(({ userId, guess }) => (
            <li key={userId} className={userId === currentUserId ? "you" : ""}>
              <span>
                {userId === currentUserId ? "You" : userId.slice(0, 5)}:
              </span>{" "}
              {guess}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GuessesOverlay;
