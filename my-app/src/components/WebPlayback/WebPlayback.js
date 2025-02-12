import React, { useEffect, useState } from "react";

function WebPlayback({ token }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    if (
      !document.querySelector(
        'script[src="https://sdk.scdn.co/spotify-player.js"]'
      )
    ) {
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (player) return; // Prevent re-initialization if the player already exists

      const newPlayer = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      setPlayer(newPlayer);

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID:", device_id);
        setDeviceId(device_id);
      });

      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline:", device_id);
      });

      newPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;

        const currentTrack = state.track_window.current_track;
        setCurrentTrack(currentTrack);

        setPaused(state.paused);
      });

      newPlayer.connect();
    };
  }, [token]);

  const playTrack = async () => {
    const trackUri = "spotify:track:07UFnnK3uPIuKv5Rs9TmXl"; // Example track URI

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  return (
    <div>
      <h2 className="label-text">Spotify Web Player Placeholder</h2>
      {currentTrack && (
        <div>
          <img
            src={currentTrack.album.images[0].url}
            alt={currentTrack.name}
            style={{ width: 150, height: 150 }}
          />
          <p>{currentTrack.name}</p>
          <p>{currentTrack.artists[0].name}</p>
        </div>
      )}
      <button onClick={playTrack}>Play Song</button>

      <button
        onClick={() => {
          player.pause();
        }}
      >
        Pause
      </button>
    </div>
  );
}

export default WebPlayback;
