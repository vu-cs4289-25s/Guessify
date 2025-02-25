const authenticate = (nextPage = "game") => {
  const clientId = "3c75e5c902f94501ae14000ce64c5053";
  const redirectUri = "http://localhost:3000/callback";
  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state",
  ];

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("show_dialog", "true");
  // State param remembers which page to go to after login
  authUrl.searchParams.set("state", nextPage);

  window.location.href = authUrl.toString();
};

export default authenticate;

// const checkSpotifyTokenValidity = async (token) => {
//   try {
//     const response = await fetch("https://api.spotify.com/v1/me", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return response.ok; // Token is valid if response = OK (200)
//   } catch (error) {
//     console.error("Error checking Spotify token:", error);
//     return false;
//   }
// };

// export const authenticate = async () => {
//   const accessToken = localStorage.getItem("spotify_access_token");

//   if (accessToken) {
//     // If token exists, check if it's still valid
//     const isValid = await checkSpotifyTokenValidity(accessToken);
//     if (isValid) {
//       console.log("Authenticated");
//       window.location.href = `/game`; // If authenticated, go straight to game
//       return;
//     }
//   }

//   // If no valid token, proceed with authentication
//   const clientId = "3c75e5c902f94501ae14000ce64c5053";
//   const redirectUri = "http://localhost:3000/callback";
//   const scopes = [
//     "streaming",
//     "user-read-email",
//     "user-read-private",
//     "user-modify-playback-state",
//     "user-read-playback-state",
//   ];

//   const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join(
//     "%20"
//   )}&redirect_uri=${redirectUri}`;

//   window.location.href = authUrl;
// };

// export default authenticate;
