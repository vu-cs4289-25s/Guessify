import React, { useEffect, useState } from "react";
import { useGameContext } from "../../components/GameContext";

function WebPlayback({ nextSongTrigger, onSongStarted, onTrackChange, showAnswer }) {
  const [token, setToken] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(localStorage.getItem("device_id"));
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const { gameGenre } = useGameContext();

  // Load token and SDK script
  useEffect(() => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      console.error("No access token available.");
      return;
    }
    setToken(accessToken);

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (player) return; // Prevent re-initialization

      const newPlayer = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

      setPlayer(newPlayer);

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID:", device_id);
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
        setCurrentTrack(state.track_window.current_track);
        if (onTrackChange && state.track_window.current_track) {
          const trackInfo = {
            name: state.track_window.current_track.name,
            albumCover: state.track_window.current_track.album.images[0].url,
          };
          onTrackChange(trackInfo);
        }
      });

      newPlayer.connect();
    };
  }, [player]);

  const getPlaylistId = (genre) => {
    const playlists = {
      "TODAY'S TOP HITS": "6q4q9SfMy2w3ae4YROBncd",
      "POP": "34NbomaTu7YuOYnky8nLXL",
      "FOLK": "1WXXO8g0zyY9f2OIRsL96X",
      "HIP-HOP / RAP": "7xjtqlGL5HuIdVF9rj1ADs", 
      "JAZZ": "5IbvIjc5HVU7gaiCniQHEC",
      "METAL": "54roY8wSrfInsgbHljU6du",
      "ROCK": "1ti3v0lLrJ4KhSTuxt4loZ",
      "CLASSICAL": "27Zm1P410dPfedsdoO9fqm",
      "INDIE": "22VR7ZV8z45dnbPWj19HHL",
      "COUNTRY": "7APcM0pDgeFCZi1HlrsWCM",
      "BLUES": "2uGtHlsrXprWFdIf7jqYsV",
      "K-POP": "6tQDMnj0qImEl6AKA1Uv74"
    };
    return playlists[genre] || playlists["TODAY'S TOP HITS"];
  };

  // Fetch playlist tracks and play a random track.
  const playRandomTrackFromPlaylist = async () => {
    if (!token || !deviceId || !playerReady) {
      console.error("Token, device ID, or player is not ready.");
      return;
    }

    const playlistId = getPlaylistId(gameGenre);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch playlist tracks");
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        console.error("No tracks found in the playlist");
        return;
      }

      const validTracks = data.items.filter((item) => {
        const track = item.track;
        if (!track || !track.uri) return false;
        if (track.is_playable === false) return false;
        return true;
      });

      if (validTracks.length === 0) {
        console.error("No valid tracks found in the playlist");
        return;
      }

      console.log("Number of valid tracks:", validTracks.length);
      const randomIndex = Math.floor(Math.random() * validTracks.length);
      const randomTrackUri = validTracks[randomIndex].track.uri;

      const playResponse = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          body: JSON.stringify({ uris: [randomTrackUri] }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!playResponse.ok) {
        throw new Error("Failed to play the track");
      }

      console.log("Random track playing:", randomTrackUri);
      if (onSongStarted) {
        onSongStarted();
      }
    } catch (error) {
      console.error("Error playing random track:", error);
    }
  };

  const pauseTrack = async () => {
    if (player && deviceId) {
      try {
        await player.pause();
        console.log("Track paused.");
      } catch (error) {
        console.error("Error pausing track:", error);
      }
    } else {
      console.log("Player not initialized or device ID not ready.");
    }
  };

  useEffect(() => {
    if (nextSongTrigger > 0) {
      playRandomTrackFromPlaylist();
    }
  }, [nextSongTrigger]);

  useEffect(() => {
    if (playerReady) {
      playRandomTrackFromPlaylist();
    }
  }, [playerReady]);

  return (
    <div>
      {currentTrack && (
        <div>
          <img
            src={currentTrack.album.images[0].url}
            alt="Album Cover"
            style={{
              width: 150,
              height: 150,
              filter: showAnswer ? "none" : "blur(8px)"
            }}
          />
        </div>
      )}
      <button onClick={playRandomTrackFromPlaylist} disabled={!playerReady}>
        Play Random Song
      </button>
      <button onClick={pauseTrack}>Pause</button>
    </div>
  );
}

export default WebPlayback;
