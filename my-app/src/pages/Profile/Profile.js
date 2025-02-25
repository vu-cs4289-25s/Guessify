import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.log("No userId => not logged in");
      return;
    }
    const fetchProfile = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        setProfile(snapshot.data());
      }
    };
    fetchProfile();
  }, [userId]);

  const handleLogout = () => {
    // TODO: If you truly want to “log out”, you might redirect to home with no userId
    window.location.href = "/";
  };

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-overlays-wrapper">
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
                <p>Display Name: {profile.displayName}</p>
                <p>Email: {profile.email}</p>
              </>
            ) : (
              <p>Loading...</p>
            )}
            <Link className="nav-link profile-link" onClick={handleLogout}>
              LOGOUT
            </Link>
          </div>
        </div>
        <div className="profile-overlay-panel">
          <h2 className="profile-generate-poster">GENERATE POSTER</h2>
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
