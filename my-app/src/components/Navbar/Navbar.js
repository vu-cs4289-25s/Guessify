import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import authenticate from "../../components/Login";
import { useUser } from "../userContext";

const Navbar = ({ onNavClick }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isGamePage = location.pathname.startsWith("/game");
  const isActivePage = (path) => location.pathname === path;

  const { userId, userProfile } = useUser();

  const handleLoginClick = () => {
    authenticate("profile");
  };

  return (
    <nav className={`navbar ${isLandingPage ? "no-logo" : ""}`}>
      {!isLandingPage && (
        <Link
          to={`/?userId=${userId}`}
          className="nav-link"
          onClick={(e) => isGamePage && onNavClick(e, "/")}
        >
          <img src="/logo.png" alt="Logo" className="logo" />
        </Link>
      )}

      <Link
        to={`/how-to-play?userId=${userId}`}
        className={`nav-link ${
          isActivePage("/how-to-play") ? "nav-link-border" : ""
        }`}
        onClick={(e) => isGamePage && onNavClick(e, "/how-to-play")}
      >
        HOW TO PLAY
      </Link>

      <Link
        to={`/about?userId=${userId}`}
        className={`nav-link ${
          isActivePage("/about") ? "nav-link-border" : ""
        }`}
        onClick={(e) => isGamePage && onNavClick(e, "/about")}
      >
        ABOUT
      </Link>

      <Link
        to={`/leaderboard?userId=${userId}`}
        className={`nav-link ${
          isActivePage("/leaderboard") ? "nav-link-border" : ""
        }`}
        onClick={(e) => isGamePage && onNavClick(e, "/leaderboard")}
      >
        LEADERBOARD
      </Link>

      {userId ? (
        <Link
          to={`/profile?userId=${userId}`}
          className="nav-link profile-link"
          onClick={(e) =>
            isGamePage && onNavClick(e, `/profile?userId=${userId}`)
          }
        >
          <img
            src={userProfile?.profileImage || "/defaultPic.png"}
            alt="User"
            className="nav-profile-pic"
          />
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
