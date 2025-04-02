import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import "./Profile.css";
import { useUser } from "../../components/userContext";
import { generateConcertPoster } from "./generatePoster";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const [profile, setProfile] = useState(null);
  const [daysSinceJoined, setDaysSinceJoined] = useState(null);
  const { setUserId, setUserProfile } = useUser();
  const [isClicked, setIsClicked] = useState(false);
  const [isDownloadClicked, setIsDownloadClicked] = useState(false);
  const [isGenerateClicked, setIsGenerateClicked] = useState(false);
  const [posterUrl, setPosterUrl] = useState(null);
  const [posterLoading, setPosterLoading] = useState(false);
  const [posterError, setPosterError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile(data);

        if (data.createdAt) {
          const dayCount = Math.floor((Date.now() - data.createdAt) / (1000 * 60 * 60 * 24));
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

  const handleGenerate = async () => {
    if (!profile?.topArtist || !profile?.topSongs) {
      setPosterError("Missing artist or song data.");
      return;
    }

    setIsGenerateClicked(true);
    setPosterLoading(true);
    setPosterError(null);

    try {
      const url = await generateConcertPoster(profile.topArtist, profile.topSongs);
      setPosterUrl(url);
    } catch (err) {
      console.error(err);
      setPosterError("Failed to generate poster.");
    } finally {
      setPosterLoading(false);
      setTimeout(() => setIsGenerateClicked(false), 150);
    }
  };

  const handleDownload = () => {
    setIsDownloadClicked(true);
    setTimeout(() => {
      setIsDownloadClicked(false);
      if (posterUrl) {
        const link = document.createElement("a");
        link.href = posterUrl;
        link.download = "concert-poster.png";
        link.click();
      }
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
                    <img src={profile.profileImage} alt="Profile" className="profile-pic" />
                  )}
                  <h3>{profile.displayName}</h3>

                  <p className="info-title">TOP GENRES:</p>
                  <p>{profile.topGenre}</p>

                  <p className="info-title">OBSCURITY RATING:</p>
                  <p>{profile.obscurity}%</p>

                  <p className="info-title"># SONGS LISTENED TODAY:</p>
                  <p>{profile.songCount}</p>

                  <p className="info-title">DAYS SINCE JOINED:</p>
                  <p>{daysSinceJoined !== null ? `${daysSinceJoined} days` : "N/A"}</p>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="profile-button-wrapper">
            <div className="profile-button-container">
              <button className={`profile-button ${isClicked ? "clicked" : ""}`} onClick={handleLogout}>
                {!isClicked ? (
                  <>
                    <img className="default" src="/buttons/button_rectangle_default.png" alt="Logout" />
                    <img className="hover" src="/buttons/button_rectangle_hover.png" alt="Logout Hover" />
                  </>
                ) : (
                  <img className="clicked" src="/buttons/button_rectangle_onClick.png" alt="Logout Click" />
                )}
                <span className={isClicked ? "clicked-text" : ""}>LOGOUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Poster Generator Panel */}
        <div className="profile-panel">
          <div className="profile-overlay-panel">
            <h2 className="profile-generate-poster">GENERATE POSTER</h2>
            {posterLoading && <p>Generating poster...</p>}
            {posterError && <p style={{ color: "red" }}>{posterError}</p>}
            {posterUrl && (
              <img
                src={posterUrl}
                alt="Generated Concert Poster"
                style={{ marginTop: "20px", width: "300px", borderRadius: "12px" }}
              />
            )}
          </div>

         {/* Generate + Download Buttons */}
          <div className="profile-button-wrapper">
            {/* Generate Button */}
            <div className="profile-button-container">
              <button
                className={`profile-button ${isGenerateClicked ? "clicked" : ""}`}
                onClick={handleGenerate}
              >
                <img
                  className="default"
                  src="/buttons/button_rectangle_default.png"
                  alt="Generate"
                  style={{ display: isGenerateClicked ? "none" : "block" }}
                />
                <img
                  className="hover"
                  src="/buttons/button_rectangle_hover.png"
                  alt="Generate Hover"
                  style={{ display: isGenerateClicked ? "none" : "block" }}
                />
                {isGenerateClicked && (
                  <img
                    className="clicked"
                    src="/buttons/button_rectangle_onClick.png"
                    alt="Generate Click"
                  />
                )}
                <span className={isGenerateClicked ? "clicked-text" : ""}>GENERATE</span>
              </button>
            </div>

            {/* Download Button */}
            <div className="profile-button-container">
              <button
                className={`profile-button ${isDownloadClicked ? "clicked" : ""}`}
                onClick={handleDownload}
                disabled={!posterUrl}
              >
                <img
                  className="default"
                  src="/buttons/button_rectangle_default.png"
                  alt="Download"
                  style={{ display: isDownloadClicked ? "none" : "block" }}
                />
                <img
                  className="hover"
                  src="/buttons/button_rectangle_hover.png"
                  alt="Download Hover"
                  style={{ display: isDownloadClicked ? "none" : "block" }}
                />
                {isDownloadClicked && (
                  <img
                    className="clicked"
                    src="/buttons/button_rectangle_onClick.png"
                    alt="Download Click"
                  />
                )}
                <span className={isDownloadClicked ? "clicked-text" : ""}>DOWNLOAD</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;