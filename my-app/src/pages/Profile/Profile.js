import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const handleLogout = () => {
    localStorage.removeItem("spotify_access_token");
    window.location.href = "/"; // Redirect to home
  };

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-overlays-wrapper">
        <div className="profile-overlay-panel">
          <h2 className="profile-title">PROFILE</h2>
          {/* TODO - spotify profile pic */}
          {/* TODO - spotify user */}
          <div className="profile-content">
            <p>Profile Info</p>
            <p>Coming Soon</p>
            <Link className="nav-link profile-link" onClick={handleLogout}>
              LOGOUT
            </Link>
          </div>
        </div>
        {/* TODO - logout button centered */}
        {/* Sources panel */}
        <div className="profile-overlay-panel">
          <h2 className="profile-generate-poster">GENERATE POSTER</h2>
        </div>
        {/* TODO - share button centered */}
      </div>
    </div>
  );
};

export default Profile;
