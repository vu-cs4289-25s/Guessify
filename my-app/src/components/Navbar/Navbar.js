// src/components/Navbar/Navbar.js

import React from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import "./Navbar.css";
import authenticate from "../../components/Login";

const Navbar = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isActivePage = (path) => location.pathname === path;

  // parse userId from ?userId=xxx in the URL
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  const handleLoginClick = () => {
    // If not logged in, do the Spotify OAuth with state='profile'
    authenticate("profile");
  };

  return (
    <nav className={`navbar ${isLandingPage ? "no-logo" : ""}`}>
      {/* If not on landing page, show home link */}
      {!isLandingPage && (
        <Link to={userId ? `/?userId=${userId}` : "/"} className="nav-link">
          <img src="/logo.png" alt="Logo" className="logo" />
        </Link>
      )}

      <Link
        to={userId ? `/how-to-play?userId=${userId}` : "/how-to-play"}
        className={`nav-link ${
          isActivePage("/how-to-play") ? "nav-link-border" : ""
        }`}
      >
        HOW TO PLAY
      </Link>

      <Link
        to={userId ? `/about?userId=${userId}` : "/about"}
        className={`nav-link ${
          isActivePage("/about") ? "nav-link-border" : ""
        }`}
      >
        ABOUT
      </Link>

      <Link
        to={userId ? `/leaderboard?userId=${userId}` : "/leaderboard"}
        className={`nav-link ${
          isActivePage("/leaderboard") ? "nav-link-border" : ""
        }`}
      >
        LEADERBOARD
      </Link>

      {/* If userId => show PROFILE link => /profile?userId=..., else show LOGIN */}
      {userId ? (
        <Link
          to={`/profile?userId=${userId}`}
          className={`nav-link profile-link ${
            isActivePage("/profile") ? "nav-link-border" : ""
          }`}
        >
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

// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import "./Navbar.css";
// import authenticate from "../../components/Login";

// const Navbar = () => {
//   const location = useLocation();
//   const isLandingPage = location.pathname === "/";
//   const isActivePage = (path) => location.pathname === path;

//   // Instead of spotify_access_token, use userId to check if user is logged in
//   const userId = localStorage.getItem("userId");

//   const handleLoginClick = () => {
//     // This triggers Spotify auth and eventually sets userId in localStorage in Callback.js
//     authenticate();
//   };

//   return (
//     <nav className={`navbar ${isLandingPage ? "no-logo" : ""}`}>
//       {/* Conditionally render the logo if not on the landing page */}
//       {!isLandingPage && (
//         <Link to="/" className="nav-link">
//           <img src="/logo.png" alt="Logo" className="logo" />
//         </Link>
//       )}

//       <Link
//         to="/how-to-play"
//         className={`nav-link ${
//           isActivePage("/how-to-play") ? "nav-link-border" : ""
//         }`}
//       >
//         HOW TO PLAY
//       </Link>

//       <Link
//         to="/about"
//         className={`nav-link ${
//           isActivePage("/about") ? "nav-link-border" : ""
//         }`}
//       >
//         ABOUT
//       </Link>

//       <Link
//         to="/leaderboard"
//         className={`nav-link ${
//           isActivePage("/leaderboard") ? "nav-link-border" : ""
//         }`}
//       >
//         LEADERBOARD
//       </Link>

//       {/* If logged in (userId), show PROFILE link; otherwise show LOGIN */}
//       {userId ? (
//         <Link
//           to={`/profile?userId=${userId}`}
//           className="nav-link profile-link"
//         >
//           PROFILE
//         </Link>
//       ) : (
//         <Link onClick={handleLoginClick} className="nav-link profile-link">
//           LOGIN
//         </Link>
//       )}
//     </nav>
//   );
// };

// export default Navbar;
