import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Profile.css";

const Profile = () => {
  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-overlays-wrapper">
        {/* Team panel */}
        <div className="profile-overlay-panel">
          <h2 className="profile-title">PROFILE</h2>
          {/* TODO - spotify profile pic */}
          {/* TODO - spotify user */}
          <div className="profile-content">
            <p>1,300 Free Pixel Icons</p>
            <p>Pixel Icons</p>
            <p>Spotify API</p>
            <p>More External Sources</p>
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
