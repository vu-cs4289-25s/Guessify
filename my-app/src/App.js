import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import HowToPlay from "./pages/HowToPlay/HowToPlay";
import About from "./pages/About/About";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Callback from "./pages/Callback/Callback";
import Profile from "./pages/Profile/Profile";
import Game from "./pages/Game/Game";
import "./App.css";

const defaultUser = {
  username: "",
  first_name: "",
  last_name: "",
  primary_email: "",
  city: "",
  games: [],
};

/***
 *
 * @param user
 * @param children
 * @returns {JSX.Element|*}
 * @constructor
 */
const ReqUser = ({ user, children }) =>
  !user || user.username === "" ? (
    <Navigate to={"/login"} replace={true} />
  ) : (
    children
  );

/***
 * Main application entry point
 * @returns {JSX.Element}
 * @constructor
 */
function App() {
  // If the user has logged in, grab info from sessionStorage
  const data = localStorage.getItem("user");
  let [state, setState] = useState(data ? JSON.parse(data) : defaultUser);
  console.log(`Starting as user: ${state.username}`);

  // Helper to check if the user is logged in or not
  const loggedIn = () => {
    return state.username && state.primary_email;
  };

  // Helper to manage what happens when the user logs in
  const logIn = async (username) => {
    const response = await fetch(`/v1/user/${username}`);
    const user = await response.json();
    localStorage.setItem("user", JSON.stringify(user));
    setState(user);
  };

  // Helper for when a user logs out
  const logOut = () => {
    // Wipe localStorage
    localStorage.removeItem("user");
    // Reset user state
    setState(defaultUser);
  };
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home logIn={logIn} />} />
        <Route path="/game" element={<Game />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/about" element={<About />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/game/*" element={<Game />} />
      </Routes>
    </div>
  );
}

export default App;
