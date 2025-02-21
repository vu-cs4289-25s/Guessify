import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import authenticate from "../../components/Login";

const Navbar = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isActivePage = (path) => location.pathname === path;

  const accessToken = localStorage.getItem("spotify_access_token");
  const handleLoginClick = async () => {
    authenticate();
  };

  return (
    <nav className={`navbar ${isLandingPage ? "no-logo" : ""}`}>
      {/* Conditionally render the logo if not on the landing page */}
      {!isLandingPage && (
        <Link to="/" className="nav-link">
          <img src="/logo.png" alt="Logo" className="logo" />
        </Link>
      )}

      <Link
        to="/how-to-play"
        className={`nav-link ${
          isActivePage("/how-to-play") ? "nav-link-border" : ""
        }`}
      >
        HOW TO PLAY
      </Link>

      <Link
        to="/about"
        className={`nav-link ${
          isActivePage("/about") ? "nav-link-border" : ""
        }`}
      >
        ABOUT
      </Link>

      <Link
        to="/leaderboard"
        className={`nav-link ${
          isActivePage("/leaderboard") ? "nav-link-border" : ""
        }`}
      >
        LEADERBOARD
      </Link>

      {/* TODO - profile picture instead of text */}
      {accessToken ? (
        <Link to="/profile" className="nav-link profile-link">
          PROFILE
        </Link>
      ) : (
        <Link onClick={handleLoginClick} className="nav-link profile-link">
          LOGIN
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
