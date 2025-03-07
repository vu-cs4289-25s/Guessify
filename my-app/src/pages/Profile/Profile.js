import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import "./Profile.css";
import { useUser } from "../../components/userContext";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const currentYear = new Date().getFullYear();
  const [profile, setProfile] = useState(null);
  const [daysSinceJoined, setDaysSinceJoined] = useState(null);
  const { setUserId, setUserProfile } = useUser();
  const [isClicked, setIsClicked] = useState(false);
  const [isDownloadClicked, setIsDownloadClicked] = useState(false);

  useEffect(() => {
    if (!userId) {
      console.log("No userId => not logged in");
      return;
    }
    const fetchProfile = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile(data);

        if (data.createdAt) {
          const diffMs = Date.now() - data.createdAt;
          const dayCount = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          setDaysSinceJoined(dayCount);
        }
      }
    };
    fetchProfile();
  }, [userId]);

  const handleLogout = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      setUserId(null);
      setUserProfile(null);
      localStorage.removeItem("userId");
      localStorage.removeItem("userProfile");
      window.location.href = "/";
    }, 120);
  };

  const handleDownload = () => {
    setIsDownloadClicked(true);
    setTimeout(() => {
      setIsDownloadClicked(false);
      alert("Downloading Poster...");
      // TODO: Implement actual download logic here
    }, 120);
  };

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-overlays-wrapper">
        {/* Profile Panel */}
        <div className="profile-panel">
          <div className="profile-overlay-panel">
            <h2 className="profile-title">PROFILE</h2>
            <div className="profile-content">
              {profile ? (
                <>
                  {profile.profileImage && (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="profile-pic"
                    />
                  )}
                  <h3>{profile.displayName}</h3>

                  <p className="info-title">TOP GENRES:</p>
                  <p>{profile.topGenre}</p>

                  <p className="info-title">OBSCURITY RATING:</p>
                  <p>{profile.obscurity}%</p>

                  <p className="info-title">
                    # SONGS LISTENED TO {currentYear}:
                  </p>
                  <p>{profile.songCount}</p>

                  <p className="info-title">DAYS SINCE JOINED:</p>
                  <p>
                    {daysSinceJoined !== null
                      ? `${daysSinceJoined} days`
                      : "N/A"}
                  </p>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
          {/* Centered Logout Button */}
          <div className="profile-button-wrapper">
            <div className="profile-button-container">
              <button
                className={`profile-button ${isClicked ? "clicked" : ""}`}
                onClick={handleLogout}
              >
                {!isClicked ? (
                  <>
                    <img
                      className="default"
                      src="/buttons/button_rectangle_default.png"
                      alt="Logout"
                    />
                    <img
                      className="hover"
                      src="/buttons/button_rectangle_hover.png"
                      alt="Logout Hover"
                    />
                  </>
                ) : (
                  <img
                    className="clicked"
                    src="/buttons/button_rectangle_onClick.png"
                    alt="Logout Click"
                  />
                )}
                <span className={isClicked ? "clicked-text" : ""}>LOGOUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Generate Poster Panel */}
        <div className="profile-panel">
          <div className="profile-overlay-panel">
            <h2 className="profile-generate-poster">GENERATE POSTER</h2>
          </div>
          {/* Centered Download Button */}
          <div className="profile-button-wrapper">
            <div className="profile-button-container">
              <button
                className={`profile-button ${
                  isDownloadClicked ? "clicked" : ""
                }`}
                onClick={handleDownload}
              >
                {!isDownloadClicked ? (
                  <>
                    <img
                      className="default"
                      src="/buttons/button_rectangle_default.png"
                      alt="Download"
                    />
                    <img
                      className="hover"
                      src="/buttons/button_rectangle_hover.png"
                      alt="Download Hover"
                    />
                  </>
                ) : (
                  <img
                    className="clicked"
                    src="/buttons/button_rectangle_onClick.png"
                    alt="Download Click"
                  />
                )}
                <span className={isDownloadClicked ? "clicked-text" : ""}>
                  DOWNLOAD
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
