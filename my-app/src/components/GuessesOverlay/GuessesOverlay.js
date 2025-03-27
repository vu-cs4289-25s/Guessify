import React from "react";
import "./GuessesOverlay.css";

const GuessesOverlay = ({
  players,
  guesses,
  currentUserId,
  displayNamesMap,
}) => {
  if (!players || players.length === 0) return null;

  return (
    <div className="player-guesses-overlay-container">
      <div className="player-guesses-overlay">
        {/* <h3 className="guesses-title">Guesses</h3> */}
        <ul className="guesses-list">
          {players.map((player) => {
            const { userId } = player;
            const isYou = userId === currentUserId;
            const name = displayNamesMap?.[userId] || "Loading...";

            // if (!displayNamesMap?.[userId]) return null; // wait until name is loaded
            // const name = displayNamesMap[userId];

            const playerGuess = guesses.find((g) => g.userId === userId);
            const guess = playerGuess?.guess || "";
            const isCorrect = playerGuess?.isCorrect;
            const isClose = playerGuess?.isClose;

            let displayColor = "#f3f3f3";
            if (isCorrect) displayColor = "#8aff90";
            else if (isClose) displayColor = "#ffe283";

            return (
              <li key={userId}>
                <span style={{ color: isYou ? "#ffe283" : "#f3f3f3" }}>
                  {name}:
                </span>{" "}
                <span style={{ color: displayColor }}>{guess}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default GuessesOverlay;
