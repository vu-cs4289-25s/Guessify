export const refreshAccessToken = async (refreshToken, clientId) => {
  try {
    const response = await fetch(
      "https://us-central1-guessify-game.cloudfunctions.net/api/spotify/refresh-token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refresh_token: refreshToken,
          client_id: clientId,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok || !data.access_token) throw new Error(data.error);

    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token || refreshToken,
    };
  } catch (err) {
    console.error("Token refresh failed:", err);
    return null;
  }
};
