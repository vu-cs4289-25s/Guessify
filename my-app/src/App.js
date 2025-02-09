import React from "react";
import { Route, Routes } from "react-router-dom";
import Game from "./pages/Game/Game";
import GameType from "./pages/Game/GameType";
import Home from "./pages/Home/Home";
import HowToPlay from "./pages/HowToPlay/HowToPlay";
import About from "./pages/About/About";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Callback from "./pages/Callback/Callback";
import Profile from "./pages/Profile/Profile";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/about" element={<About />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/gameType " element={<GameType />} />
      </Routes>
    </div>
  );
}

export default App;
