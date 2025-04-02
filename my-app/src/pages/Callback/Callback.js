import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "../../global.css";
import { useUser } from "../../components/userContext";

const Callback = () => {
  const [error, setError] = useState("");
  const { setUserId, setUserProfile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const doAuth = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");
        const nextPage = queryParams.get("state") || "game";

        if (!code) {
          setError("No authorization code provided");
          return;
        }

        const clientId = "3c75e5c902f94501ae14000ce64c5053";
        const redirectUri = "http://localhost:3000/callback";

        // Exchange code for tokens
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
        if (!tokenRes.ok || !tokenData.access_token) {
          setError(
            `Failed to retrieve access token: ${
              tokenData.error || "Unknown error"
            }`
          );
          return;
        }

        // Fetch user profile from Spotify
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

        // Fallback profile image from top track album if none
        let profileImage = userData.images?.[0]?.url || null;
        if (!profileImage) {
          const topTracksRes = await fetch(
            "https://api.spotify.com/v1/me/top/tracks?limit=1",
            {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
              },
            }
          );
          const topTracksData = await topTracksRes.json();
          if (topTracksRes.ok && topTracksData.items.length > 0) {
            profileImage =
              topTracksData.items[0].album?.images?.[0]?.url || null;
          }
        }

        // Additional data
        let topGenre = "Unknown";
        let obscurity = 0;
        let songCount = 0;
        let createdAt = Date.now(); // default if new user

        const userRef = doc(db, "users", userData.id);
        const existingSnap = await getDoc(userRef);
        if (existingSnap.exists()) {
          const oldData = existingSnap.data();
          if (oldData.createdAt) {
            createdAt = oldData.createdAt;
          }
        }

        // Get top artists => pick genre + compute obscurity
        const topArtistsRes = await fetch(
          "https://api.spotify.com/v1/me/top/artists?limit=5",
          {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          }
        );
        const topArtistsData = await topArtistsRes.json();
        if (topArtistsRes.ok && topArtistsData.items.length > 0) {
          const allGenres = [];
          let totalPop = 0;
          topArtistsData.items.forEach((artist) => {
            allGenres.push(...artist.genres);
            totalPop += artist.popularity;
          });

          if (allGenres.length > 0) {
            const freqMap = {};
            allGenres.forEach((g) => {
              freqMap[g] = (freqMap[g] || 0) + 1;
            });
            topGenre = Object.keys(freqMap).reduce((a, b) =>
              freqMap[a] > freqMap[b] ? a : b
            );
          }

          const avgPop = totalPop / topArtistsData.items.length;
          obscurity = Math.round(100 - avgPop);
        }

        // Function to fetch ALL songs listened to today (using pagination)
        const fetchDailySongs = async () => {
          let totalSongs = 0;
          let nextUrl =
            "https://api.spotify.com/v1/me/player/recently-played?limit=50";

          // Calculate start of the current day (midnight)
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const startOfDayTime = now.getTime();

          while (nextUrl) {
            const response = await fetch(nextUrl, {
              headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            const data = await response.json();

            if (!response.ok || !data.items) break;

            // Count only songs played since midnight
            const songsToday = data.items.filter(
              (track) => new Date(track.played_at).getTime() >= startOfDayTime
            ).length;

            totalSongs += songsToday;

            // Stop if we reach songs older than the start of the day
            const oldestTrackDate = new Date(
              data.items[data.items.length - 1]?.played_at
            ).getTime();
            if (oldestTrackDate < startOfDayTime) break;

            nextUrl = data.next; // Get next batch of songs
          }

          return totalSongs;
        };

        // Get the actual song count for today
        songCount = await fetchDailySongs();
        // Fetch top tracks (to get top songs)
        const topTracksRes = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=5",
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          }
        );
        const topTracksData = await topTracksRes.json();
        const topSongs = topTracksRes.ok
          ? topTracksData.items.map((track) => track.name).slice(0, 5)
          : [];

        // Determine top artist name (most listened)
        const topArtist = topArtistsData.items?.[0]?.name || "Unknown";

        // Store in Firestore
        await setDoc(
          userRef,
          {
            spotifyId: userData.id,
            displayName: userData.display_name,
            email: userData.email,
            profileImage,
            topGenre,
            obscurity,
            songCount,
            createdAt,
            topArtist,  
            topSongs,  
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: Date.now() + tokenData.expires_in * 1000,
          },
          { merge: true }
        );
        

        // Store in Context & LocalStorage to persist session
        setUserId(userData.id);
        setUserProfile({
          profileImage,
          displayName: userData.display_name,
          topGenre,
          obscurity,
          songCount,
          topArtist,
          topSongs,
        });
        
        localStorage.setItem("userId", userData.id);
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            profileImage,
            displayName: userData.display_name,
            topGenre,
            obscurity,
            songCount,
            topArtist,
            topSongs,
          })
        );
        
        // Navigate in-app (instead of full page reload)
        navigate(`/${nextPage}?userId=${userData.id}`, { replace: true });
      } catch (err) {
        console.error("Error in Callback:", err);
        setError("Failed to authenticate with Spotify");
      }
    };

    doAuth();
  }, [setUserId, setUserProfile, navigate]);

  return (
    <div className="overlay-panel">
      {error ? (
        <h2 className="overlay-title">{error}</h2>
      ) : (
        <h2 className="overlay-title">Connecting to Spotify...</h2>
      )}
    </div>
  );
};

export default Callback;