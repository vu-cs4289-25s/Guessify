import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import { useUser } from "../../components/userContext";
import "./Profile.css";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const currentYear = new Date().getFullYear();
  const [profile, setProfile] = useState(null);
  const [daysSinceJoined, setDaysSinceJoined] = useState(null);
  const { setUserId, setUserProfile } = useUser();

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
    // Clear user session
    setUserId(null);
    setUserProfile(null);

    // Remove from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userProfile");

    // Redirect to home
    window.location.href = "/";
  };

  const generatePoster = () => {};

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
            <Link className="logout-link" onClick={handleLogout}>
              LOG OUT
            </Link>
          </div>
        </div>

        {/* Generate Poster Panel */}
        <div className="profile-panel">
          <div className="profile-overlay-panel">
            <h2 className="profile-generate-poster">GENERATE POSTER</h2>
          </div>
          {/* Centered Download/Share Button */}
          <div className="profile-button-wrapper">
            <Link className="download-button" onClick={generatePoster}>
              DOWNLOAD AND SHARE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

// import React from "react";
// import Navbar from "../../components/Navbar/Navbar";
// import { Link } from "react-router-dom";
// import "./Profile.css";

// const Profile = () => {
//   const handleLogout = () => {
//     localStorage.removeItem("spotify_access_token");
//     window.location.href = "/"; // Redirect to home
//   };

//   return (
//     <div className="profile-container">
//       <Navbar />
//       <div className="profile-overlays-wrapper">
//         <div className="profile-overlay-panel">
//           <h2 className="profile-title">PROFILE</h2>
//           {/* TODO - spotify profile pic */}
//           {/* TODO - spotify user */}
//           <div className="profile-content">
//             <p>Profile Info</p>
//             <p>Coming Soon</p>
//             <Link className="nav-link profile-link" onClick={handleLogout}>
//               LOGOUT
//             </Link>
//           </div>
//         </div>
//         {/* TODO - logout button centered */}
//         {/* Sources panel */}
//         <div className="profile-overlay-panel">
//           <h2 className="profile-generate-poster">GENERATE POSTER</h2>
//         </div>
//         {/* TODO - share button centered */}
//       </div>
//     </div>
//   );
// };

// export default Profile;
