import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { GameProvider } from "../../components/GameContext";

import GameModeSelect from "../../components/GameModeSelect/GameModeSelect";
import GenreSelect from "../../components/GenreSelect/GenreSelect";
import PlayGame from "../../components/PlayGame/PlayGame";

import MultiplayerModeSelect from "../../components/Multiplayer/MultiplayerModeSelect";
import CreateRoom from "../../components/Multiplayer/CreateRoom";
import JoinRoom from "../../components/Multiplayer/JoinRoom";
import Lobby from "../../components/Multiplayer/Lobby";
import PlayGameMulti from "../../components/PlayGame/PlayGameMulti";

import "./Game.css";

const Game = () => {
  return (
    <div className="game-container">
      <Navbar />
      <GameProvider>
        <Routes>
          {/* Singleplayer flow */}
          <Route index element={<GameModeSelect />} />
          <Route path="genres" element={<GenreSelect />} />
          <Route path="play" element={<PlayGame />} />

          {/* Multiplayer flow */}
          <Route path="multiplayer" element={<MultiplayerModeSelect />} />
          <Route path="create-room" element={<CreateRoom />} />
          <Route path="join-room" element={<JoinRoom />} />
          <Route path="lobby/:roomCode" element={<Lobby />} />
          <Route
            path="play-multiplayer/:roomCode"
            element={<PlayGameMulti />}
          />
        </Routes>
      </GameProvider>
    </div>
  );
};

export default Game;

// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Navbar from "../../components/Navbar/Navbar";
// import GameContext, { GameProvider } from "../../components/GameContext";
// import GameModeSelect from "../../components/GameModeSelect/GameModeSelect";
// import GenreSelect from "../../components/GenreSelect/GenreSelect";
// import PlayGame from "../../components/PlayGame/PlayGame";

// import "./Game.css";

// const Game = () => {
//   return (
//     <div className="game-container">
//       <Navbar />
//       <GameProvider>
//         <Routes>
//           <Route index element={<GameModeSelect />} />
//           <Route path="genres" element={<GenreSelect />} />
//           <Route path="play" element={<PlayGame />} />
//         </Routes>
//       </GameProvider>
//     </div>
//   );
// };

// export default Game;
