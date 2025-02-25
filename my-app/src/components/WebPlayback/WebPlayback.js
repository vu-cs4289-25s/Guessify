import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useGameContext } from "../../components/GameContext";

function WebPlayback({ userId }) {
  const [token, setToken] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const { gameGenre } = useGameContext();

  // Fetch token from Firestore
  useEffect(() => {
    if (!userId) return;
    const fetchSpotifyToken = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setToken(userData.accessToken); // store in state
      }
    };
    fetchSpotifyToken();
  }, [userId]);

  // Load Web Playback SDK script and initialize the player once we have a token
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
      if (player) return; // already set up

      const newPlayer = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      setPlayer(newPlayer);

      // Called when the player is ready
      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID:", device_id);
        setDeviceId(device_id);
      });

      // Called when the player state changes
      newPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
      });

      newPlayer.connect();
    };
  }, [token, player]);

  // Return a playlist ID based on the chosen genre
  const getPlaylistId = (genre) => {
    if (genre === "TODAY'S TOP HITS") return "1R8gNkzw3n3o9dhj4TX7Ak";
    if (genre === "POP") return "37i9dQZF1EQncLwOalG3K7";
    if (genre === "FOLK") return "37i9dQZF1EIe3texLXLRDS";
    // fallback or more genres
    return "37i9dQZF1DXcBWIGoYBM5M";
  };

  // TODO: fix Plays a random track from the specified playlist
  const playRandomTrackFromPlaylist = async () => {
    if (!token || !deviceId) {
      console.error("Missing token or deviceId, cannot play track.");
      return;
    }

    const playlistId = getPlaylistId(gameGenre);
    try {
      const resp = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to fetch playlist tracks");

      const data = await resp.json();
      if (!data.items || data.items.length === 0) {
        console.error("No tracks found in the playlist");
        return;
      }

      // pick a random track from the list
      const randomIndex = Math.floor(Math.random() * data.items.length);
      const randomTrackUri = data.items[randomIndex].track.uri;

      // instruct Spotify to play that track on this device
      const playResp = await fetch(
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
      if (!playResp.ok) {
        throw new Error("Failed to play track");
      }
    } catch (error) {
      console.error("Error playing random track:", error);
    }
  };

  // Pause the current track
  const pauseTrack = async () => {
    if (!player || !deviceId) {
      console.log("Player not initialized or device ID not ready.");
      return;
    }
    try {
      await player.pause();
      console.log("Track paused.");
    } catch (error) {
      console.error("Error pausing track:", error);
    }
  };

  return (
    <div>
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
      <button onClick={playRandomTrackFromPlaylist}>Play Random Song</button>
      <button onClick={pauseTrack}>Pause</button>
    </div>
  );
}

export default WebPlayback;

// import React, { useEffect, useState } from "react";
// import { useGameContext } from "../../components/GameContext";

// function WebPlayback() {
//   const [token, setToken] = useState(null);
//   const [player, setPlayer] = useState(null);
//   const [deviceId, setDeviceId] = useState(localStorage.getItem("device_id"));
//   const [currentTrack, setCurrentTrack] = useState(null);
//   const { gameGenre } = useGameContext();

//   useEffect(() => {
//     const accessToken = localStorage.getItem("spotify_access_token");

//     if (accessToken) {
//       setToken(accessToken); // Store token in state
//     }

//     const script = document.createElement("script");
//     script.src = "https://sdk.scdn.co/spotify-player.js";
//     script.async = true;

//     if (
//       !document.querySelector(
//         'script[src="https://sdk.scdn.co/spotify-player.js"]'
//       )
//     ) {
//       document.body.appendChild(script);
//     }

//     window.onSpotifyWebPlaybackSDKReady = () => {
//       if (player) return; // Prevent re-initialization if the player already exists

//       const newPlayer = new window.Spotify.Player({
//         name: "Web Playback SDK",
//         getOAuthToken: (cb) => cb(token),
//         volume: 0.5,
//       });

//       setPlayer(newPlayer);

//       newPlayer.addListener("ready", ({ device_id }) => {
//         console.log("Ready with Device ID:", device_id);
//         setDeviceId(device_id);
//         localStorage.setItem("device_id", device_id);
//       });

//       newPlayer.addListener("not_ready", ({ device_id }) => {
//         console.log("Device ID has gone offline:", device_id);
//         setDeviceId(null);
//       });

//       newPlayer.addListener("player_state_changed", (state) => {
//         if (!state) return;
//         setCurrentTrack(state.track_window.current_track);
//       });

//       newPlayer.connect();
//     };
//   }, [token, deviceId]);

//   const getPlaylistId = (playlist) => {
//     if (playlist === "TODAY'S TOP HITS") {
//       return "1R8gNkzw3n3o9dhj4TX7Ak";
//     } else if (playlist === "POP") {
//       return "37i9dQZF1EQncLwOalG3K7";
//     } else if (playlist === "FOLK") {
//       return "37i9dQZF1EIe3texLXLRDS";
//     }
//   };

//   // Fetch playlist tracks and play a random track
//   const playRandomTrackFromPlaylist = async () => {
//     const playlistId = getPlaylistId(gameGenre);
//     try {
//       // Fetch playlist tracks
//       const response = await fetch(
//         `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) throw new Error("Failed to fetch playlist tracks");

//       const data = await response.json();
//       if (!data.items || data.items.length === 0) {
//         console.error("No tracks found in the playlist");
//         return;
//       }

//       // Select a random track
//       const randomIndex = Math.floor(Math.random() * data.items.length);
//       const randomTrackUri = data.items[randomIndex].track.uri;

//       // Play the selected track
//       await fetch(
//         `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
//         {
//           method: "PUT",
//           body: JSON.stringify({ uris: [randomTrackUri] }),
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     } catch (error) {
//       console.error("Error playing random track:", error);
//     }
//   };

//   const pauseTrack = async () => {
//     if (player && deviceId) {
//       try {
//         await player.pause(); // Pause the current track
//         console.log("Track paused.");
//       } catch (error) {
//         console.error("Error pausing track:", error);
//       }
//     } else {
//       console.log("Player not initialized or device ID not ready.");
//     }
//   };

//   return (
//     <div>
//       {currentTrack && (
//         <div>
//           <img
//             src={currentTrack.album.images[0].url}
//             alt={currentTrack.name}
//             style={{ width: 150, height: 150 }}
//           />
//           <p>{currentTrack.name}</p>
//           <p>{currentTrack.artists[0].name}</p>
//         </div>
//       )}
//       <button onClick={playRandomTrackFromPlaylist}>Play Random Song</button>
//       <button onClick={pauseTrack}>Pause</button>
//     </div>
//   );
// }

// export default WebPlayback;
