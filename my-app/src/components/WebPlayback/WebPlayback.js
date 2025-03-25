import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../components/userContext";

function WebPlayback({
  trackUriFromHost,
  onSongStarted,
  onTrackChange,
  showAnswer,
  onGameOver,
}) {
  const [token, setToken] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [albumCoverReady, setAlbumCoverReady] = useState(false);

  const { userId } = useUser();

  // Fetch token from Firestore
  useEffect(() => {
    if (!userId) return;
    const fetchSpotifyToken = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setToken(userData.accessToken);
      }
    };
    fetchSpotifyToken();
  }, [userId]);

  useEffect(() => {
    if (!token) return;

    // Load SDK
    const scriptUrl = "https://sdk.scdn.co/spotify-player.js";
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (player) return; // Already initted?

      const newPlayer = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      setPlayer(newPlayer);

      newPlayer.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        localStorage.setItem("device_id", device_id);
        setPlayerReady(true);
      });

      newPlayer.addListener("not_ready", ({ device_id }) => {
        setPlayerReady(false);
      });

      newPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;
        const track = state.track_window.current_track;
        setCurrentTrack(track);
        if (onTrackChange && track) {
          onTrackChange({
            name: track.name,
            artist: track.artists.map((a) => a.name).join(", "),
            albumCover: track.album.images?.[0]?.url || "",
          });
        }
      });

      newPlayer.connect();
    };
  }, [token]);

  // Play a given track URI on this device
  const playTrack = async (uri) => {
    if (!player || !deviceId || !token) return;
    try {
      const resp = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          body: JSON.stringify({ uris: [uri] }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to play track");
      onSongStarted && onSongStarted();
    } catch (err) {
      console.error("Error playing track:", err);
    }
  };

  // Whenever the parent updates trackUriFromHost, play that track
  useEffect(() => {
    if (playerReady && trackUriFromHost) {
      playTrack(trackUriFromHost);
    }
  }, [playerReady, trackUriFromHost]);

  // Optionally pause the track if game is over
  useEffect(() => {
    if (onGameOver && player && deviceId) {
      player.pause().catch((err) => console.error("Error pausing track:", err));
    }
  }, [onGameOver, player, deviceId]);

  // Handle album cover loading
  useEffect(() => {
    if (currentTrack?.album?.images?.[0]?.url) {
      setAlbumCoverReady(false);
      const img = new Image();
      img.src = currentTrack.album.images[0].url;
      img.onload = () => setAlbumCoverReady(true);
    }
  }, [currentTrack]);

  return (
    <div>
      {currentTrack ? (
        albumCoverReady ? (
          <img
            src={currentTrack.album.images[0].url}
            alt="Album Cover"
            style={{
              width: 150,
              height: 150,
              margin: 15,
              filter: showAnswer ? "none" : "blur(10px)",
              transition: "filter 0.3s ease-in-out",
            }}
          />
        ) : (
          <div>Loading song...</div>
        )
      ) : (
        <div>Loading song...</div>
      )}
    </div>
  );
}

export default WebPlayback;
