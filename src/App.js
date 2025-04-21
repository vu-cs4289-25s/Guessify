import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import HowToPlay from "./pages/HowToPlay/HowToPlay";
import About from "./pages/About/About";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Callback from "./pages/Callback/Callback";
import Profile from "./pages/Profile/Profile";
import Game from "./pages/Game/Game";
import GameOver from "./pages/Game/GameOver";
import FirebaseErrorBoundary from "./components/FirebaseErrorBoundary";
import "./App.css";

function App() {
  return (
    <FirebaseErrorBoundary>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/*s" element={<Game />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/about" element={<About />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/game/*" element={<Game />} />
          <Route path="/game-over" element={<GameOver />} />
        </Routes>
      </div>
    </FirebaseErrorBoundary>
  );
}

export default App;
