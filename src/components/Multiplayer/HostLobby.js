import React from 'react';
import './HostLobby.css';

const HostLobby = ({ 
  roomCode, 
  players, 
  currentGenre, 
  displayNamesMap, 
  profilePicsMap, 
  startClicked, 
  onStartGame 
}) => {
  return (
    <div className="host-lobby-wrapper">
      <div className="host-room-info">
        <div className="host-room-code">{roomCode}</div>
        <div className="host-player-count">{players.length}/6 PLAYERS JOINED</div>
        <div className="host-music-genre">{currentGenre.toUpperCase()}</div>
      </div>

      <div className="host-player-container">
        {[...Array(6)].map((_, index) => {
          const player = players[index];
          const name = player ? displayNamesMap[player.userId] || "..." : "???";
          const imgSrc = player ? profilePicsMap[player.userId] : null;

          return (
            <div key={index} className="host-player-slot">
              <div className={`host-avatar-square ${player ? "filled" : "empty"}`}>
                {player ? (
                  <img
                    src={imgSrc}
                    alt={name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = null;
                    }}
                  />
                ) : (
                  <span className="host-placeholder-text">???</span>
                )}
              </div>
              <p className="host-player-label">{name}</p>
            </div>
          );
        })}
      </div>

      {players.length >= 2 ? (
        <div className="host-start-container">
          <button
            className={`host-start-button ${startClicked ? "clicked" : ""}`}
            onClick={onStartGame}
          >
            {!startClicked ? (
              <>
                <img
                  className="default"
                  src="/buttons/button_rectangle_default.png"
                  alt="Start"
                />
                <img
                  className="hover"
                  src="/buttons/button_rectangle_hover.png"
                  alt="Start Hover"
                />
              </>
            ) : (
              <img
                className="clicked"
                src="/buttons/button_rectangle_onClick.png"
                alt="Start Click"
              />
            )}
            <span className={startClicked ? "clicked-text" : ""}>START</span>
          </button>
        </div>
      ) : (
        <div className="host-message">You need at least 2 players to start!</div>
      )}
    </div>
  );
};

export default HostLobby; 