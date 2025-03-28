import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import "./Profile.css";
import { useUser } from "../../components/userContext";
import { generatePoster } from "./PosterGenerator";

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
  const [posterType, setPosterType] = useState(1); // 1 or 3

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

  useEffect(() => {
    const generate = async () => {
      if (profile) {
        const url = await generatePoster(profile, posterType);
        setPosterUrl(url);
      }
    };
    generate();
  }, [profile, posterType]);

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

  const handleDownload = async () => {
    if (!posterUrl) return;

    setIsDownloadClicked(true);
    setTimeout(() => {
      setIsDownloadClicked(false);
      const link = document.createElement("a");
      link.href = posterUrl;
      link.download = "Guessify_Poster.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(posterUrl);
    }, 120);
  };

  const handleTemplateSwitch = () => {
    setIsGenerateClicked(true);
    setPosterType((prev) => (prev === 1 ? 3 : 1));
    setTimeout(() => {
      setIsGenerateClicked(false);
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

                  <p className="info-title"># SONGS LISTENED TODAY:</p>
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

            {posterUrl && (
              <img
                src={posterUrl}
                alt="Poster Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
                  borderRadius: "16px",
                  marginTop: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              />
            )}
          </div>

          <div className="profile-button-wrapper" style={{ gap: "2rem" }}>
            <div className="profile-button-container">
              <button
                className={`profile-button ${isGenerateClicked ? "clicked" : ""}`}
                onClick={handleTemplateSwitch}
              >
                {!isGenerateClicked ? (
                  <>
                    <img
                      className="default"
                      src="/buttons/button_rectangle_default.png"
                      alt="Generate"
                    />
                    <img
                      className="hover"
                      src="/buttons/button_rectangle_hover.png"
                      alt="Generate Hover"
                    />
                  </>
                ) : (
                  <img
                    className="clicked"
                    src="/buttons/button_rectangle_onClick.png"
                    alt="Generate Click"
                  />
                )}
                <span className={isGenerateClicked ? "clicked-text" : ""}>
                  GENERATE
                </span>
              </button>
            </div>

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
