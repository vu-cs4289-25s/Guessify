const authenticate = (nextPage = "game") => {
  const clientId = "3c75e5c902f94501ae14000ce64c5053";
  const redirectUri = "http://localhost:3000/callback";
  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-top-read",
    "user-read-recently-played",
  ];

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("show_dialog", "true");
  authUrl.searchParams.set("state", nextPage); // State param remembers where to go after login

  window.location.href = authUrl.toString();
};

export default authenticate;
