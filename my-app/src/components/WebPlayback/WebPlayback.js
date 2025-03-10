import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useGameContext } from "../../components/GameContext";
import { useUser } from "../../components/userContext";
import { refreshAccessToken } from "../Refresh";

function WebPlayback({
  trackUriFromHost,
  nextSongTrigger,
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
  const { gameGenre } = useGameContext();
  const { userId } = useUser();

  // Load token and SDK script
  // useEffect(() => {
  //   const accessToken = localStorage.getItem("spotify_access_token");
  //   if (!accessToken) {
  //     console.error("No access token available.");
  //     return;
  //   }
  //   setToken(accessToken);
  // });

  const getValidSpotifyToken = async (userData) => {
    const { accessToken, refreshToken, expiresAt } = userData;
    console.log(userData);
    const clientId = "3c75e5c902f94501ae14000ce64c5053";

    if (!accessToken || !refreshToken) {
      console.error("Missing Spotify tokens");
      return null;
    }

    // If token is about to expire in <60s
    if (Date.now() >= expiresAt - 60000) {
      console.log("Refreshing token...");
      const newTokens = await refreshAccessToken(refreshToken, clientId);
      if (!newTokens) return null;

      // Save updated token in Firestore
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: newTokens.expiresAt,
        },
        { merge: true }
      );

      return newTokens.accessToken;
    }

    return accessToken;
  };

  // Fetch token from Firestore
  useEffect(() => {
    if (!userId) return;

    const fetchSpotifyToken = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.data();
        const validToken = await getValidSpotifyToken(userData);
        if (validToken) {
          setToken(validToken);
        }
      }
    };

    fetchSpotifyToken();
  }, [userId]);

  // Load SDK and initialize player
  useEffect(() => {
    if (!token) return;

    const scriptUrl = "https://sdk.scdn.co/spotify-player.js";
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log(token);
      if (player) return; // Prevent re-initialization

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
        console.log("Device ID has gone offline:", device_id);
        setDeviceId(null);
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

  // Play a track by URI (multiplayer mode)
  const playTrack = async (uri) => {
    if (!player || !deviceId || !token || !uri) return;
    try {
      await fetch(
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
      onSongStarted && onSongStarted();
    } catch (err) {
      console.error("Error playing track:", err);
    }
  };

  const getPlaylistId = (genre) => {
    const playlists = {
      "TODAY'S TOP HITS": "6q4q9SfMy2w3ae4YROBncd",
      POP: "34NbomaTu7YuOYnky8nLXL",
      FOLK: "1WXXO8g0zyY9f2OIRsL96X",
      "HIP-HOP / RAP": "7xjtqlGL5HuIdVF9rj1ADs",
      JAZZ: "5IbvIjc5HVU7gaiCniQHEC",
      METAL: "54roY8wSrfInsgbHljU6du",
      ROCK: "1ti3v0lLrJ4KhSTuxt4loZ",
      CLASSICAL: "27Zm1P410dPfedsdoO9fqm",
      INDIE: "22VR7ZV8z45dnbPWj19HHL",
      COUNTRY: "7APcM0pDgeFCZi1HlrsWCM",
      BLUES: "2uGtHlsrXprWFdIf7jqYsV",
      "K-POP": "6tQDMnj0qImEl6AKA1Uv74",
    };
    return playlists[genre] || playlists["TODAY'S TOP HITS"];
  };

  const playRandomTrackFromPlaylist = async () => {
    if (!token || !deviceId || !playerReady) return;
    const playlistId = getPlaylistId(gameGenre);
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      const tracks = data.items.filter(
        (item) => item.track?.uri && item.track.is_playable !== false
      );
      const rand = tracks[Math.floor(Math.random() * tracks.length)];
      await playTrack(rand.track.uri);
    } catch (err) {
      console.error("Error playing random track:", err);
    }
  };

  // Play multiplayer song
  useEffect(() => {
    if (playerReady && trackUriFromHost) {
      playTrack(trackUriFromHost);
    }
  }, [playerReady, trackUriFromHost]);

  // Play singleplayer song on load
  useEffect(() => {
    if (playerReady && !trackUriFromHost && nextSongTrigger >= 0) {
      playRandomTrackFromPlaylist();
    }
  }, [playerReady, nextSongTrigger, trackUriFromHost]);

  // Pause on game over
  useEffect(() => {
    if (onGameOver && player && deviceId) {
      player.pause().catch((err) => console.error("Error pausing track:", err));
    }
  }, [onGameOver, player, deviceId]);

  // Album cover loading
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
