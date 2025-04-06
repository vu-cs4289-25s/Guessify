import React from 'react';
import './PlayerLobby.css';

const PlayerLobby = ({ 
  roomCode, 
  players, 
  currentGenre, 
  displayNamesMap, 
  profilePicsMap 
}) => {
  return (
    <div className="player-lobby-wrapper">
      <div className="circular-player-container">
        {[...Array(6)].map((_, index) => {
          const player = players[index];
          const name = player ? displayNamesMap[player.userId] || "..." : "???";
          const imgSrc = player ? profilePicsMap[player.userId] : null;

          return (
            <div key={index} className="player-slot">
              <div className={`avatar-square ${player ? "filled" : "empty"}`}>
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
                  <span className="placeholder-text">???</span>
                )}
              </div>
              <p className="player-label">{name}</p>
            </div>
          );
        })}

        <div className="player-room-info">
          <div className="room-code">{roomCode}</div>
          <div className="player-count">{players.length}/6 PLAYERS JOINED</div>
          <div className="music-genre">{currentGenre.toUpperCase()}</div>
        </div>

        <div className="player-waiting-message">WAITING FOR HOST TO START...</div>
      </div>
    </div>
  );
};

export default PlayerLobby; 