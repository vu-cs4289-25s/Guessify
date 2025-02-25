import React, { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../../global.css";

const Callback = () => {
  const [error, setError] = useState("");

  useEffect(() => {
    const doAuth = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");
        // 'state' might be "game" or "profile"
        const nextPage = queryParams.get("state") || "game";

        if (!code) {
          setError("No authorization code provided");
          return;
        }

        const clientId = "3c75e5c902f94501ae14000ce64c5053";
        const redirectUri = "http://localhost:3000/callback";

        // Exchange the code for tokens
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
        console.log("Token Response:", tokenData);

        if (!tokenRes.ok || !tokenData.access_token) {
          setError(
            `Failed to retrieve access token: ${
              tokenData.error || "Unknown error"
            }`
          );
          return;
        }

        // Fetch user profile
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

        // Create or update user doc in Firestore
        const userRef = doc(db, "users", userData.id);
        await setDoc(
          userRef,
          {
            spotifyId: userData.id,
            displayName: userData.display_name,
            email: userData.email,
            profileImage: userData.images?.[0]?.url || null,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: Date.now() + tokenData.expires_in * 1000,
          },
          { merge: true }
        );

        // final redirect => e.g. "/game?userId=abc123" or "/profile?userId=abc123"
        window.location.href = `/${nextPage}?userId=${userData.id}`;
      } catch (err) {
        console.error("Error in Callback:", err);
        setError("Failed to authenticate with Spotify");
      }
    };

    doAuth();
  }, []);

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
