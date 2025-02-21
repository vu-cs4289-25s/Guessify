import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../global.css";

const Callback = () => {
  const [error, setError] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");

    if (code) {
      const clientId = "3c75e5c902f94501ae14000ce64c5053";
      const clientSecret = "7c4ef5e4001841228a21b4c372d92b02";
      const redirectUri = "http://localhost:3000/callback";

      // Exchange authorization code for access token
      const authString = btoa(`${clientId}:${clientSecret}`);
      axios
        .post(
          "https://accounts.spotify.com/api/token",
          new URLSearchParams({
            code: code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
          {
            headers: {
              Authorization: `Basic ${authString}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          localStorage.setItem(
            "spotify_access_token",
            response.data.access_token
          );
          console.log("Token: ", response.data.access_token);
          window.location.href = `/game`;
        })
        .catch((error) => {
          setError("Failed to authenticate with Spotify");
        });
    }
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
