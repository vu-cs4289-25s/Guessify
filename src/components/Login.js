const authenticate = (nextPage = "game") => {
  try {
    const clientId = "3c75e5c902f94501ae14000ce64c5053";
    const redirectUri = "https://guessify-game.web.app/callback";
    
    // Define scopes as a single string
    const scopes = "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state user-top-read user-read-recently-played";

    // Construct the authorization URL with proper encoding
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("scope", scopes);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("show_dialog", "true");
    authUrl.searchParams.append("state", nextPage);
    
    // Log detailed information for debugging
    console.log("Auth Parameters:", {
      response_type: "code",
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      show_dialog: "true",
      state: nextPage
    });
    console.log("Full Auth URL:", authUrl.toString());
    
    // Verify the URL is properly constructed
    const urlString = authUrl.toString();
    if (!urlString.includes(clientId) || !urlString.includes(encodeURIComponent(redirectUri))) {
      console.error("URL construction error - missing required parameters");
      return;
    }
    
    window.location.href = urlString;
  } catch (error) {
    console.error("Authentication error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
  }
};

export default authenticate;
