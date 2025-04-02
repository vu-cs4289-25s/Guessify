
export async function generateConcertPoster(artist, topSongs) {
  const prompt = `Create a njz aesthetic concert poster for a performance by ${artist}, featuring the songs: ${topSongs.join(
    ", "
  )}. Use bold typography and vibrant colors.`;

  const response = await fetch("/api/generate-poster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return data.imageUrl;
}
