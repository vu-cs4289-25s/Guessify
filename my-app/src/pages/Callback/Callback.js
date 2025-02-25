import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../../global.css";
import { useUser } from "../../components/userContext";

const Callback = () => {
  const [error, setError] = useState("");
  const { setUserId, setUserProfile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const doAuth = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");
        const nextPage = queryParams.get("state") || "game";

        if (!code) {
          setError("No authorization code provided");
          return;
        }

        const clientId = "3c75e5c902f94501ae14000ce64c5053";
        const redirectUri = "http://localhost:3000/callback";

        // Exchange code for tokens
        const tokenRes = await fetch(
          "http://localhost:5001/api/spotify/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              redirect_uri: redirectUri,
              client_id: clientId,
            }),
          }
        );

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          setError(
            `Failed to retrieve access token: ${
              tokenData.error || "Unknown error"
            }`
          );
          return;
        }

        // Fetch user profile from Spotify
        const userRes = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });
        const userData = await userRes.json();
        if (!userRes.ok || !userData.id) {
          setError("Failed to fetch Spotify user profile");
          return;
        }

        // Fallback profile image from top track album if none
        let profileImage = userData.images?.[0]?.url || null;
        if (!profileImage) {
          const topTracksRes = await fetch(
            "https://api.spotify.com/v1/me/top/tracks?limit=1",
            {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
              },
            }
          );
          const topTracksData = await topTracksRes.json();
          if (
            topTracksRes.ok &&
            topTracksData.items &&
            topTracksData.items.length > 0
          ) {
            const topTrack = topTracksData.items[0];
            profileImage = topTrack.album?.images?.[0]?.url || null;
          }
        }

        // Additional data
        let topGenre = "Unknown";
        let obscurity = 0;
        let songCount = 0;
        let createdAt = Date.now(); // default if new user

        const userRef = doc(db, "users", userData.id);
        const existingSnap = await getDoc(userRef);
        if (existingSnap.exists()) {
          const oldData = existingSnap.data();
          if (oldData.createdAt) {
            createdAt = oldData.createdAt;
          }
        }

        // top artists => pick genre + compute obscurity
        const topArtistsRes = await fetch(
          "https://api.spotify.com/v1/me/top/artists?limit=5",
          {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          }
        );
        const topArtistsData = await topArtistsRes.json();
        if (
          topArtistsRes.ok &&
          topArtistsData.items &&
          topArtistsData.items.length > 0
        ) {
          const allGenres = [];
          let totalPop = 0;
          topArtistsData.items.forEach((artist) => {
            allGenres.push(...artist.genres);
            totalPop += artist.popularity;
          });
          if (allGenres.length > 0) {
            const freqMap = {};
            allGenres.forEach((g) => {
              freqMap[g] = (freqMap[g] || 0) + 1;
            });
            topGenre = Object.keys(freqMap).reduce((a, b) =>
              freqMap[a] > freqMap[b] ? a : b
            );
          }
          const avgPop = totalPop / topArtistsData.items.length;
          obscurity = Math.round(100 - avgPop);
        }
        songCount = Math.floor(Math.random() * 3000 + 200);

        // Store in Firestore
        await setDoc(
          userRef,
          {
            spotifyId: userData.id,
            displayName: userData.display_name,
            email: userData.email,
            profileImage,
            topGenre,
            obscurity,
            songCount,
            createdAt,
            // store tokens
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: Date.now() + tokenData.expires_in * 1000,
          },
          { merge: true }
        );

        // Set in context => no flicker
        setUserId(userData.id);
        setUserProfile({
          profileImage,
          displayName: userData.display_name,
          topGenre,
          obscurity,
          songCount,
        });

        // Instead of window.location.href => use navigate for in-app route (no flicker)
        navigate(`/${nextPage}?userId=${userData.id}`, { replace: true });
      } catch (err) {
        console.error("Error in Callback:", err);
        setError("Failed to authenticate with Spotify");
      }
    };

    doAuth();
  }, [setUserId, setUserProfile, navigate]);

  return (
    <div className="overlay-panel">
      {error ? (
        <h2 className="overlay-title">{error}</h2>
      ) : (
        <h2 className="overlay-title">Connecting to Spotify . . .</h2>
      )}
    </div>
  );
};

export default Callback;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../../global.css";

// const Callback = () => {
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const queryParams = new URLSearchParams(window.location.search);
//     const code = queryParams.get("code");

//     if (code) {
//       const clientId = "3c75e5c902f94501ae14000ce64c5053";
//       const clientSecret = "7c4ef5e4001841228a21b4c372d92b02";
//       const redirectUri = "http://localhost:3000/callback";

//       // Exchange authorization code for access token
//       const authString = btoa(`${clientId}:${clientSecret}`);
//       axios
//         .post(
//           "https://accounts.spotify.com/api/token",
//           new URLSearchParams({
//             code: code,
//             redirect_uri: redirectUri,
//             grant_type: "authorization_code",
//           }),
//           {
//             headers: {
//               Authorization: `Basic ${authString}`,
//               "Content-Type": "application/x-www-form-urlencoded",
//             },
//           }
//         )
//         .then((response) => {
//           localStorage.setItem(
//             "spotify_access_token",
//             response.data.access_token
//           );
//           console.log("Token: ", response.data.access_token);
//           window.location.href = `/game`;
//         })
//         .catch((error) => {
//           setError("Failed to authenticate with Spotify");
//         });
//     }
//   }, []);

//   return (
//     <div className="overlay-panel">
//       {error ? (
//         <h2 className="overlay-title">{error}</h2>
//       ) : (
//         <h2 className="overlay-title">Connecting to Spotify . . .</h2>
//       )}
//     </div>
//   );
// };

// export default Callback;
