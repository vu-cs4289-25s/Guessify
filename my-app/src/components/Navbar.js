import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation(); // Get the current route
  const isLandingPage = location.pathname === "/"; // Check if on the landing page

  return (
    <nav className={`navbar ${isLandingPage ? "no-logo" : ""}`}>
      {/* Conditionally render the logo if not on the landing page */}
      {!isLandingPage && (
        <Link to="/" className="nav-link">
          <img src="/logo.png" alt="Logo" className="logo" />
        </Link>
      )}
      <Link to="/how-to-play" className="nav-link">
        HOW TO PLAY
      </Link>
      <Link to="/about" className="nav-link">
        ABOUT
      </Link>
      <Link to="/leaderboard" className="nav-link">
        LEADERBOARD
      </Link>
      <Link to="/profile" className="nav-link profile-link">
        PROFILE
      </Link>
    </nav>
  );
};

export default Navbar;
